import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../config/api";
import VerificationBadge from "../components/VerificationBadge";

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCerts = () => {
    setLoading(true);
    apiRequest("/certificates")
      .then((d) => setCertificates(d.certificates || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCerts();
  }, []);

  const handleRevoke = async (certId) => {
    if (!window.confirm("Are you sure you want to revoke this certificate?")) return;
    try {
      await apiRequest(`/certificates/revoke/${certId}`, { method: "POST" });
      loadCerts();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const stats = {
    total: certificates.length,
    authentic: certificates.filter((c) => c.verificationStatus === "authentic").length,
    revoked: certificates.filter((c) => c.verificationStatus === "revoked").length,
    blockchain: certificates.filter((c) => c.isOnBlockchain).length,
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>{user.organizationName || "Institution"} Dashboard</h1>
        <Link to="/issue" className="btn btn-primary">
          + Issue Certificate
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">Total Certs</span>
        </div>
        <div className="stat-card authentic">
          <span className="stat-num">{stats.authentic}</span>
          <span className="stat-label">Authentic</span>
        </div>
        <div className="stat-card fake">
          <span className="stat-num">{stats.revoked}</span>
          <span className="stat-label">Revoked</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.blockchain}</span>
          <span className="stat-label">On Blockchain</span>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>All Certificates</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="candidates-table">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Blockchain</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert._id}>
                    <td>{cert.extractedData?.candidateName || cert.applicantId?.name || "—"}</td>
                    <td>{cert.extractedData?.courseName || cert.fileName}</td>
                    <td>
                      <VerificationBadge status={cert.verificationStatus} size="sm" />
                    </td>
                    <td>{cert.isOnBlockchain ? "⛓️ Yes" : "—"}</td>
                    <td>
                      <Link to={`/certificates/${cert._id}`} className="btn btn-sm">
                        View
                      </Link>
                      {cert.verificationStatus !== "revoked" && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(cert._id)}
                          className="btn btn-sm btn-danger"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
