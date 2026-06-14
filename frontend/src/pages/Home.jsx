import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">AI + Blockchain Powered</div>
          <h1>
            Verify Certificates.
            <br />
            Trust Your Hires.
          </h1>
          <p className="hero-subtitle">
            An intelligent certificate authentication platform using AI, OCR, QR scanning, and
            blockchain technology to reduce fraudulent credentials in recruitment.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>How It Works</h2>
        <div className="features-grid">
          {[
            { icon: "📄", title: "Upload Certificate", desc: "Upload any certificate in PDF or image format." },
            { icon: "🔍", title: "AI Extraction", desc: "OCR and NLP extract key information automatically." },
            { icon: "📷", title: "QR Verification", desc: "Scans embedded QR codes and validates issuer URLs." },
            { icon: "⛓️", title: "Blockchain Check", desc: "Cross-references an on-chain registry when configured." },
            { icon: "🤖", title: "AI Analysis", desc: "Gemini summarizes findings and highlights concerns." },
            { icon: "✅", title: "Instant Result", desc: "Authentic / Fake / Revoked / Unverified verdict." },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="roles-section">
        <h2>Built for Everyone</h2>
        <div className="roles-grid">
          <div className="role-card applicant">
            <h3>👤 Applicants</h3>
            <ul>
              <li>Upload and verify your certificates</li>
              <li>Get authenticity signals and extracted fields</li>
              <li>Browse jobs and apply with confidence</li>
            </ul>
            <Link to="/register?role=applicant" className="btn btn-primary">
              Join as Applicant
            </Link>
          </div>
          <div className="role-card employer">
            <h3>🏢 Employers</h3>
            <ul>
              <li>Review verified candidate certificates</li>
              <li>Open reports with QR and blockchain context</li>
              <li>Post roles and track applicants</li>
            </ul>
            <Link to="/register?role=employer" className="btn btn-primary">
              Join as Employer
            </Link>
          </div>
          <div className="role-card institution">
            <h3>🎓 Institutions</h3>
            <ul>
              <li>Issue blockchain-backed certificates</li>
              <li>Revoke fraudulent records</li>
              <li>Maintain a trusted credential trail</li>
            </ul>
            <Link to="/register?role=institution" className="btn btn-primary">
              Join as Institution
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
