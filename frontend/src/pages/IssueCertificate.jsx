import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../config/api";

export default function IssueCertificate() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    courseName: "",
    issueDate: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleIssue = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/certificates/issue", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="issue-page">
      <div className="issue-container">
        <h1>Issue Blockchain Certificate</h1>
        <p>Issue a tamper-proof certificate stored on-chain when your environment is configured.</p>

        {error && <div className="alert alert-error">{error}</div>}

        {result ? (
          <div className="issue-success">
            <div className="success-icon">✅</div>
            <h2>Certificate Issued Successfully!</h2>
            <div className="cert-details">
              <div className="detail-row">
                <span>Candidate:</span>
                <strong>{form.candidateName}</strong>
              </div>
              <div className="detail-row">
                <span>Course:</span>
                <strong>{form.courseName}</strong>
              </div>
              <div className="detail-row">
                <span>Issued by:</span>
                <strong>{user.organizationName}</strong>
              </div>
              <div className="detail-row">
                <span>Blockchain:</span>
                <strong>
                  {result.blockchainResult?.success ? "⛓️ Stored on Chain" : "⚠️ Pending / hash only"}
                </strong>
              </div>
              <div className="detail-row">
                <span>Hash:</span>
                <code>{result.blockchainResult?.hash}</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setForm({
                  candidateName: "",
                  candidateEmail: "",
                  courseName: "",
                  issueDate: "",
                });
              }}
              className="btn btn-outline"
            >
              Issue Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleIssue} className="issue-form">
            <div className="form-group">
              <label>Candidate Name *</label>
              <input
                name="candidateName"
                value={form.candidateName}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Candidate Email</label>
              <input
                name="candidateEmail"
                type="email"
                value={form.candidateEmail}
                onChange={handleChange}
                placeholder="candidate@email.com"
              />
            </div>
            <div className="form-group">
              <label>Course / Certificate Name *</label>
              <input
                name="courseName"
                value={form.courseName}
                onChange={handleChange}
                placeholder="e.g. Bachelor of Technology, AI & DS"
                required
              />
            </div>
            <div className="form-group">
              <label>Issue Date</label>
              <input name="issueDate" type="date" value={form.issueDate} onChange={handleChange} />
            </div>
            <div className="form-group readonly">
              <label>Issuing Institution</label>
              <input value={user.organizationName || user.name} readOnly />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
              {loading ? "Issuing..." : "⛓️ Issue on Blockchain"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
