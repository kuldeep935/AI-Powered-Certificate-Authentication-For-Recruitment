import React from "react";
import { Link } from "react-router-dom";
import VerificationBadge from "./VerificationBadge";

export default function CertificateCard({ certificate }) {
  if (!certificate) return null;
  const title = certificate.extractedData?.courseName || certificate.fileName;
  const institution = certificate.extractedData?.issuingInstitution || "—";
  return (
    <div className="certificate-card">
      <div className="certificate-card-body">
        <h3 className="certificate-card-title">{title}</h3>
        <p className="certificate-card-meta">{institution}</p>
        <p className="certificate-card-date">
          {new Date(certificate.uploadedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="certificate-card-actions">
        <VerificationBadge status={certificate.verificationStatus} size="sm" />
        <Link to={`/certificates/${certificate._id}`} className="btn btn-sm">
          View
        </Link>
      </div>
    </div>
  );
}
