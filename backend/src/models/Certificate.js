const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, default: "" },
  filePublicId: { type: String },

  extractedData: {
    candidateName: String,
    issuingInstitution: String,
    courseName: String,
    issueDate: String,
    expiryDate: String,
    certificateId: String,
    skills: [String],
    rawText: String,
  },

  verificationStatus: {
    type: String,
    enum: ["pending", "authentic", "fake", "revoked", "unverified"],
    default: "pending",
  },
  verificationMethod: {
    type: String,
    enum: ["qr", "blockchain", "ai", "manual", "none"],
  },
  verificationDetails: {
    qrValid: Boolean,
    qrUrl: String,
    blockchainHash: String,
    blockchainTxId: String,
    aiConfidenceScore: Number,
    verifiedAt: Date,
    verifiedBy: String,
  },

  blockchainHash: { type: String, unique: true, sparse: true },
  isOnBlockchain: { type: Boolean, default: false },

  uploadedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

certificateSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Certificate", certificateSchema);
