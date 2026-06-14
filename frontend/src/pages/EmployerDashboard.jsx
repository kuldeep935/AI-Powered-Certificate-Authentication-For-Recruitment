import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../config/api";
import VerificationBadge from "../components/VerificationBadge";

const emptyJob = {
  title: "",
  company: "",
  description: "",
  requiredSkills: "",
  requiredCertifications: "",
  location: "",
  jobType: "full-time",
};

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [jobError, setJobError] = useState("");
  const [jobSaving, setJobSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiRequest("/certificates?status=authentic").catch(() => ({ certificates: [] })),
      apiRequest("/jobs/my").catch(() => ({ jobs: [] })),
    ])
      .then(([certData, jobData]) => {
        setCertificates(certData.certificates || []);
        setJobs(jobData.jobs || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    filter === "all" ? certificates : certificates.filter((c) => c.verificationStatus === filter);

  const handleJobChange = (e) =>
    setJobForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submitJob = async (e) => {
    e.preventDefault();
    setJobError("");
    setJobSaving(true);
    try {
      const payload = {
        title: jobForm.title.trim(),
        company: jobForm.company.trim() || user.organizationName || user.name,
        description: jobForm.description.trim(),
        location: jobForm.location.trim(),
        jobType: jobForm.jobType,
        requiredSkills: jobForm.requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        requiredCertifications: jobForm.requiredCertifications
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await apiRequest("/jobs", { method: "POST", body: JSON.stringify(payload) });
      setShowJobModal(false);
      setJobForm(emptyJob);
      load();
    } catch (err) {
      setJobError(err.message);
    } finally {
      setJobSaving(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Employer Dashboard</h1>
        <div className="header-actions">
          <button type="button" className="btn btn-outline" onClick={() => setShowJobModal(true)}>
            + Post Job
          </button>
        </div>
      </div>

      {showJobModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Post a Job</h2>
              <button type="button" className="btn btn-sm" onClick={() => setShowJobModal(false)}>
                ✕
              </button>
            </div>
            {jobError && <div className="alert alert-error">{jobError}</div>}
            <form onSubmit={submitJob} className="auth-form">
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={jobForm.title} onChange={handleJobChange} required />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input name="company" value={jobForm.company} onChange={handleJobChange} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={jobForm.description}
                  onChange={handleJobChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Required skills (comma-separated)</label>
                <input name="requiredSkills" value={jobForm.requiredSkills} onChange={handleJobChange} />
              </div>
              <div className="form-group">
                <label>Certifications (comma-separated)</label>
                <input
                  name="requiredCertifications"
                  value={jobForm.requiredCertifications}
                  onChange={handleJobChange}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input name="location" value={jobForm.location} onChange={handleJobChange} />
              </div>
              <div className="form-group">
                <label>Job type</label>
                <select name="jobType" value={jobForm.jobType} onChange={handleJobChange}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={jobSaving}>
                {jobSaving ? "Saving..." : "Publish"}
              </button>
            </form>
          </div>
        </div>
      )}

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Verified Candidates</h2>
          <div className="filter-tabs">
            {["all", "authentic", "pending", "fake"].map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="candidates-table">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Certificate</th>
                  <th>Institution</th>
                  <th>Status</th>
                  <th>Verified On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cert) => (
                  <tr key={cert._id}>
                    <td>{cert.applicantId?.name || "—"}</td>
                    <td>{cert.extractedData?.courseName || cert.fileName}</td>
                    <td>{cert.extractedData?.issuingInstitution || "—"}</td>
                    <td>
                      <VerificationBadge status={cert.verificationStatus} size="sm" />
                    </td>
                    <td>
                      {cert.verificationDetails?.verifiedAt
                        ? new Date(cert.verificationDetails.verifiedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <Link to={`/certificates/${cert._id}`} className="btn btn-sm">
                        Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>My Job Postings</h2>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          <div className="jobs-list">
            {jobs.map((job) => (
              <div key={job._id} className="job-row">
                <div>
                  <strong>{job.title}</strong> — {job.company}
                </div>
                <div>{job.applications?.length || 0} applicants</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
