import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div>
          <span className="brand-text">🔐 CertAuth AI</span>
          <p>AI + Blockchain Certificate Authentication for Recruitment</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/verify">Verify</Link>
          <Link to="/login">Login</Link>
        </div>
        <p className="footer-note">Certificate authenticity for trusted hiring.</p>
      </div>
    </footer>
  );
}
