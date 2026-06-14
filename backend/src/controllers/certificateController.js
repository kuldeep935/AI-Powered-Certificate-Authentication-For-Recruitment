const Certificate = require("../models/Certificate");
const User = require("../models/User");
const { validateCertificateWithPython, extractCertificateData } = require("../services/QRvalidation");
const { addToBlockchain, verifyOnBlockchain, computeHash, revokeOnBlockchain } = require("../blockchain");
const { analyzeCertificate } = require("../services/geminiService");

exports.uploadAndVerify = async (req, res) => {
  try {
    const { fileUrl, filePublicId, fileName } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: "File URL required", data: null });
    }

    const extraction = await extractCertificateData(fileUrl);
    const extractedData = extraction.data || {};

    const qrResult = await validateCertificateWithPython(fileUrl, extractedData.rawText);

    const hashInput = { ...extractedData, fileUrl };
    const certHash = computeHash(hashInput);
    const blockchainResult = await verifyOnBlockchain(certHash);

    let status = "unverified";
    let method = "none";
    if (blockchainResult.exists && !blockchainResult.isRevoked) {
      status = "authentic";
      method = "blockchain";
    } else if (blockchainResult.exists && blockchainResult.isRevoked) {
      status = "revoked";
      method = "blockchain";
    } else if (qrResult.qr_valid) {
      status = "authentic";
      method = "qr";
    } else if (qrResult.qr_found && !qrResult.qr_valid) {
      status = "fake";
      method = "qr";
    }

    let aiAnalysis = null;
    if (extractedData.rawText) {
      aiAnalysis = await analyzeCertificate(extractedData.rawText, status);
    }

    const certificate = await Certificate.create({
      applicantId: req.user._id,
      fileName: fileName || "certificate",
      fileUrl,
      filePublicId,
      extractedData,
      verificationStatus: status,
      verificationMethod: method,
      verificationDetails: {
        qrValid: Boolean(qrResult.qr_valid),
        qrUrl: qrResult.qr_url || null,
        blockchainHash: certHash,
        verifiedAt: new Date(),
        verifiedBy: blockchainResult.issuerName || "System",
        aiConfidenceScore: aiAnalysis?.confidence,
      },
      blockchainHash: certHash,
      isOnBlockchain: Boolean(blockchainResult.exists),
    });

    res.json({
      success: true,
      message: "Verification complete",
      certificate,
      aiAnalysis,
      verificationSummary: {
        status,
        method,
        blockchainVerified: Boolean(blockchainResult.exists && !blockchainResult.isRevoked),
        qrVerified: Boolean(qrResult.qr_valid),
        certHash,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.listMine = async (req, res) => {
  try {
    const certs = await Certificate.find({ applicantId: req.user._id }).sort({ uploadedAt: -1 });
    res.json({ success: true, message: "OK", certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.getOne = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate("applicantId", "name email");
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found", data: null });
    }
    const applicantId = cert.applicantId?._id?.toString();
    if (req.user.role === "applicant" && applicantId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied", data: null });
    }
    res.json({ success: true, message: "OK", certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.listAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;
    const skip = (Number(page) - 1) * Number(limit);
    const certs = await Certificate.find(filter)
      .populate("applicantId", "name email")
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Certificate.countDocuments(filter);
    res.json({
      success: true,
      message: "OK",
      certificates: certs,
      total,
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.issue = async (req, res) => {
  try {
    const { candidateName, courseName, issueDate, candidateEmail } = req.body;
    if (!candidateName || !courseName) {
      return res.status(400).json({
        success: false,
        message: "candidateName and courseName required",
        data: null,
      });
    }

    const certData = {
      candidateName,
      courseName,
      issuingInstitution: req.user.organizationName || req.user.name,
      issueDate: issueDate || new Date().toISOString(),
      issuedBy: req.user._id.toString(),
    };

    const blockchainResult = await addToBlockchain(certData);

    let applicantId = req.user._id;
    if (candidateEmail) {
      const applicant = await User.findOne({ email: candidateEmail, role: "applicant" });
      if (applicant) applicantId = applicant._id;
    }

    const certificate = await Certificate.create({
      applicantId,
      fileName: `${courseName}_${candidateName}`,
      fileUrl: "",
      extractedData: {
        candidateName,
        courseName,
        issuingInstitution: certData.issuingInstitution,
        issueDate: certData.issueDate,
      },
      verificationStatus: blockchainResult.success ? "authentic" : "pending",
      verificationMethod: "blockchain",
      verificationDetails: {
        blockchainHash: blockchainResult.hash,
        blockchainTxId: blockchainResult.txHash,
        verifiedAt: new Date(),
        verifiedBy: certData.issuingInstitution,
      },
      blockchainHash: blockchainResult.hash,
      isOnBlockchain: blockchainResult.success,
    });

    res.json({
      success: true,
      message: "Issued",
      certificate,
      blockchainResult,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

exports.revoke = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: "Certificate not found", data: null });
    }
    if (cert.blockchainHash) {
      await revokeOnBlockchain(cert.blockchainHash);
    }
    cert.verificationStatus = "revoked";
    await cert.save();
    res.json({ success: true, message: "Certificate revoked", certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};
