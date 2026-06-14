import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../config/api";
import CertificateCard from "../components/CertificateCard";

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    Promise.all([
      apiRequest("/certificates/my").catch(() => ({ certificates: [] })),
      apiRequest("/jobs").catch(() => ({ jobs: [] })),
    ])
      .then(([certData, jobData]) => {
        setCertificates(certData.certificates || []);
        setJobs(jobData.jobs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: certificates.length,
    authentic: certificates.filter((c) => c.verificationStatus === "authentic").length,
    pending: certificates.filter((c) => c.verificationStatus === "pending").length,
    fake: certificates.filter((c) => c.verificationStatus === "fake").length,
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user.name} 👋</h1>
        <Link to="/verify" className="btn btn-primary">
          + Upload Certificate
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">Total Certificates</span>
        </div>
        <div className="stat-card authentic">
          <span className="stat-num">{stats.authentic}</span>
          <span className="stat-label">Authentic</span>
        </div>
        <div className="stat-card pending">
          <span className="stat-num">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card fake">
          <span className="stat-num">{stats.fake}</span>
          <span className="stat-label">Flagged</span>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>My Certificates</h2>
        {loading ? (
          <p>Loading...</p>
        ) : certificates.length === 0 ? (
          <div className="empty-state">
            <p>
              No certificates yet. <Link to="/verify">Upload and verify your first certificate!</Link>
            </p>
          </div>
        ) : (
          <div className="cert-list">
            {certificates.map((cert) => (
              <CertificateCard key={cert._id} certificate={cert} />
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Latest Job Openings</h2>
        <div className="jobs-grid">
          {jobs.slice(0, 6).map((job) => (
            <div key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p>{job.company}</p>
              <div className="job-skills">
                {job.requiredSkills?.slice(0, 3).map((s) => (
                  <span key={s} className="skill-badge">
                    {s}
                  </span>
                ))}
              </div>
              <span className="job-type">{job.jobType}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
