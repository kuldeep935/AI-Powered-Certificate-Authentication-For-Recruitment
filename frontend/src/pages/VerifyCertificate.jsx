import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, apiRequest } from "../config/api";
import VerificationBadge from "../components/VerificationBadge";

const STEPS = ["Upload", "Extracting", "QR Check", "Blockchain", "AI Analysis", "Done"];

export default function VerifyCertificate() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && (f.type === "application/pdf" || f.type.startsWith("image/"))) {
      setFile(f);
      setError("");
    } else {
      setError("Please upload a PDF or image file.");
    }
  };

  const handleVerify = async () => {
    if (!file) return setError("Please select a file first");
    setError("");
    setStep(1);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const uploadResponse = await fetch(`${API_BASE_URL}/files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const uploadData = await uploadResponse.json().catch(() => ({}));
      if (!uploadData.success || !uploadData.url) {
        throw new Error(uploadData.message || "Upload failed");
      }

      setStep(2);
      setStep(3);
      setStep(4);
      setStep(5);

      const verifyData = await apiRequest("/certificates/upload-and-verify", {
        method: "POST",
        body: JSON.stringify({
          fileUrl: uploadData.url,
          filePublicId: uploadData.publicId,
          fileName: file.name,
        }),
      });

      setStep(6);
      setResult(verifyData);
    } catch (err) {
      setError(err.message || "Verification failed");
      setStep(0);
    }
  };

  if (result) {
    const { certificate, aiAnalysis, verificationSummary } = result;
    const methodLabel = (verificationSummary.method || "none").toUpperCase();
    return (
      <div className="verify-page">
        <div className="verify-result">
          <div className="result-header">
            <h2>Verification Complete</h2>
            <VerificationBadge status={verificationSummary.status} size="lg" />
          </div>

          <div className="result-grid">
            <div className="result-card">
              <h3>Verification Details</h3>
              <div className="detail-row">
                <span>Method:</span>
                <strong>{methodLabel}</strong>
              </div>
              <div className="detail-row">
                <span>Blockchain:</span>
                <strong>
                  {verificationSummary.blockchainVerified ? "✅ Verified" : "❌ Not on Blockchain"}
                </strong>
              </div>
              <div className="detail-row">
                <span>QR Code:</span>
                <strong>{verificationSummary.qrVerified ? "✅ Valid" : "—"}</strong>
              </div>
              <div className="detail-row">
                <span>Hash:</span>
                <code className="hash-code">
                  {verificationSummary.certHash
                    ? `${verificationSummary.certHash.substring(0, 32)}...`
                    : "—"}
                </code>
              </div>
            </div>

            <div className="result-card">
              <h3>Extracted Information</h3>
              {Object.entries(certificate.extractedData || {}).map(([key, value]) =>
                value && key !== "rawText" ? (
                  <div key={key} className="detail-row">
                    <span>{key.replace(/([A-Z])/g, " $1")}:</span>
                    <strong>{Array.isArray(value) ? value.join(", ") : String(value)}</strong>
                  </div>
                ) : null
              )}
            </div>

            {aiAnalysis && (
              <div className="result-card ai-analysis">
                <h3>🤖 AI Analysis</h3>
                <p>
                  <strong>Summary:</strong> {aiAnalysis.summary}
                </p>
                {aiAnalysis.skills?.length > 0 && (
                  <div className="skills-list">
                    <strong>Skills:</strong>
                    {aiAnalysis.skills.map((s) => (
                      <span key={s} className="skill-badge">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {aiAnalysis.concerns?.length > 0 && (
                  <div className="concerns">
                    <strong>Concerns:</strong> {aiAnalysis.concerns.join(", ")}
                  </div>
                )}
                <div className="confidence-bar">
                  <span>Confidence: {aiAnalysis.confidence ?? "—"}%</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${Math.min(100, Number(aiAnalysis.confidence) || 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="result-actions">
            <button
              type="button"
              onClick={() => navigate(`/certificates/${certificate._id}`)}
              className="btn btn-primary"
            >
              View Full Report →
            </button>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setFile(null);
                setStep(0);
              }}
              className="btn btn-outline"
            >
              Verify Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-page">
      <div className="verify-container">
        <h1>Verify Certificate</h1>
        <p>Upload your certificate and our AI + Blockchain pipeline will analyze it.</p>

        {step > 0 && step < 6 && (
          <div className="progress-steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`step ${i < step ? "done" : i === step ? "active" : ""}`}>
                <div className="step-dot">{i < step ? "✓" : i + 1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        {step === 0 && (
          <>
            <button
              type="button"
              className="upload-zone"
              onClick={() => document.getElementById("cert-file").click()}
            >
              {file ? (
                <div className="file-selected">
                  <span className="file-icon">📄</span>
                  <p>{file.name}</p>
                  <small>{(file.size / 1024).toFixed(1)} KB</small>
                </div>
              ) : (
                <div className="upload-prompt">
                  <span>📁</span>
                  <p>Drop your certificate here or click to browse</p>
                  <small>Supports PDF, JPG, PNG (max 10MB)</small>
                </div>
              )}
            </button>
            <input
              id="cert-file"
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {error && <div className="alert alert-error">{error}</div>}

            <button type="button" onClick={handleVerify} disabled={!file} className="btn btn-primary btn-lg">
              🔍 Verify Now
            </button>
          </>
        )}

        {step > 0 && step < 6 && (
          <div className="verifying-state">
            <div className="spinner" />
            <p>
              Processing... {STEPS[Math.min(step - 1, STEPS.length - 1)]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
