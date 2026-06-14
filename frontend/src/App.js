import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplicantDashboard from "./pages/ApplicantDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import VerifyCertificate from "./pages/VerifyCertificate";
import CertificateDetail from "./pages/CertificateDetail";
import IssueCertificate from "./pages/IssueCertificate";
import "./styles/global.css";

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "applicant") return <Navigate to="/dashboard/applicant" replace />;
  if (user.role === "employer") return <Navigate to="/dashboard/employer" replace />;
  if (user.role === "institution") return <Navigate to="/dashboard/institution" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardRedirect />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/applicant"
              element={
                <PrivateRoute allowedRoles={["applicant"]}>
                  <ApplicantDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/employer"
              element={
                <PrivateRoute allowedRoles={["employer"]}>
                  <EmployerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/institution"
              element={
                <PrivateRoute allowedRoles={["institution"]}>
                  <InstitutionDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/verify"
              element={
                <PrivateRoute allowedRoles={["applicant"]}>
                  <VerifyCertificate />
                </PrivateRoute>
              }
            />
            <Route
              path="/certificates/:id"
              element={
                <PrivateRoute>
                  <CertificateDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/issue"
              element={
                <PrivateRoute allowedRoles={["institution"]}>
                  <IssueCertificate />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Chatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}
