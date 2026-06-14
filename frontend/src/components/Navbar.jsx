import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">🔐</span>
          <span className="brand-text">CertAuth AI</span>
        </Link>
      </div>
      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
            {user.role === "applicant" && (
              <Link to="/verify" className="nav-link" onClick={() => setMenuOpen(false)}>
                Verify Certificate
              </Link>
            )}
            {user.role === "institution" && (
              <Link to="/issue" className="nav-link" onClick={() => setMenuOpen(false)}>
                Issue Certificate
              </Link>
            )}
            <span className="nav-user">
              {user.name} ({user.role})
            </span>
            <button type="button" onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </>
        )}
      </div>
      <button
        type="button"
        className="hamburger"
        aria-label="Menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>
    </nav>
  );
}
