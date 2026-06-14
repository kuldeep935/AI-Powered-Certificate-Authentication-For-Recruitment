import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../config/api";
import VerificationBadge from "../components/VerificationBadge";

export default function CertificateDetail() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest(`/certificates/${id}`)
      .then((d) => setCert(d.certificate))
      .catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="loading-screen">Loading certificate...</div>;
  if (!cert) return null;

  const isPdf = cert.fileUrl && cert.fileUrl.toLowerCase().includes(".pdf");

  return (
    <div className="detail-page">
      <button type="button" className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="detail-header">
        <h1>Certificate Report</h1>
        <VerificationBadge status={cert.verificationStatus} size="lg" />
      </div>

      {cert.fileUrl ? (
        <div className="cert-preview">
          {isPdf ? (
            <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline">
              📄 View Original PDF
            </a>
          ) : (
            <img src={cert.fileUrl} alt="Certificate" className="cert-img" />
          )}
        </div>
      ) : null}

      <div className="detail-grid">
        <div className="detail-section">
          <h2>Extracted Information</h2>
          {Object.entries(cert.extractedData || {}).map(([key, val]) =>
            val && key !== "rawText" ? (
              <div key={key} className="detail-row">
                <span className="detail-label">{key.replace(/([A-Z])/g, " $1")}</span>
                <span className="detail-value">
                  {Array.isArray(val) ? val.join(", ") : String(val)}
                </span>
              </div>
            ) : null
          )}
        </div>

        <div className="detail-section">
          <h2>Verification Details</h2>
          <div className="detail-row">
            <span>Status</span>
            <VerificationBadge status={cert.verificationStatus} size="sm" />
          </div>
          <div className="detail-row">
            <span>Method</span>
            <strong>{(cert.verificationMethod || "—").toUpperCase()}</strong>
          </div>
          <div className="detail-row">
            <span>QR Valid</span>
            <strong>{cert.verificationDetails?.qrValid ? "✅ Yes" : "—"}</strong>
          </div>
          {cert.verificationDetails?.qrUrl && (
            <div className="detail-row">
              <span>QR URL</span>
              <a href={cert.verificationDetails.qrUrl} target="_blank" rel="noreferrer">
                {cert.verificationDetails.qrUrl}
              </a>
            </div>
          )}
          <div className="detail-row">
            <span>Blockchain</span>
            <strong>{cert.isOnBlockchain ? "⛓️ On Chain" : "Not on blockchain"}</strong>
          </div>
          {cert.blockchainHash && (
            <div className="detail-row hash-row">
              <span>Certificate Hash</span>
              <code className="hash-code">{cert.blockchainHash}</code>
            </div>
          )}
          {cert.verificationDetails?.verifiedAt && (
            <div className="detail-row">
              <span>Verified At</span>
              <strong>{new Date(cert.verificationDetails.verifiedAt).toLocaleString()}</strong>
            </div>
          )}
        </div>
      </div>

      <div className="detail-actions">
        <button type="button" onClick={() => window.print()} className="btn btn-outline">
          🖨️ Print Report
        </button>
      </div>
    </div>
  );
}
