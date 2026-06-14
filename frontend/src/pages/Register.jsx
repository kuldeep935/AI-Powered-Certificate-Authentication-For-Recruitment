import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: searchParams.get("role") || "applicant",
    organizationName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError("Passwords do not match");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (
      (form.role === "employer" || form.role === "institution") &&
      !form.organizationName.trim()
    ) {
      return setError("Organization name is required for this role");
    }
    setError("");
    setLoading(true);
    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.role,
        form.organizationName || undefined
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join CertAuth AI</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-role">Role</label>
            <select id="reg-role" name="role" value={form.role} onChange={handleChange}>
              <option value="applicant">Applicant (Job Seeker)</option>
              <option value="employer">Employer / Recruiter</option>
              <option value="institution">Institution / Certificate Issuer</option>
            </select>
          </div>
          {(form.role === "employer" || form.role === "institution") && (
            <div className="form-group">
              <label htmlFor="reg-org">
                {form.role === "employer" ? "Company Name" : "Institution Name"}
              </label>
              <input
                id="reg-org"
                name="organizationName"
                value={form.organizationName}
                onChange={handleChange}
                placeholder="Organization name"
                required
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="reg-pass">Password</label>
            <input
              id="reg-pass"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-pass2">Confirm Password</label>
            <input
              id="reg-pass2"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
