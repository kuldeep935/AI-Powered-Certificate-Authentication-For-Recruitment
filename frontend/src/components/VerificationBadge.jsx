import React from "react";

const STATUS_CONFIG = {
  authentic: { label: "Authentic ✓", color: "#22c55e", bg: "#dcfce7" },
  fake: { label: "Fake ✗", color: "#ef4444", bg: "#fee2e2" },
  revoked: { label: "Revoked", color: "#f97316", bg: "#ffedd5" },
  pending: { label: "Pending...", color: "#eab308", bg: "#fef9c3" },
  unverified: { label: "Unverified", color: "#6b7280", bg: "#f3f4f6" },
};

export default function VerificationBadge({ status, size = "md" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unverified;
  const fontSize = size === "sm" ? "12px" : size === "lg" ? "16px" : "14px";
  const padding = size === "sm" ? "2px 8px" : "4px 12px";
  return (
    <span
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}`,
        borderRadius: "9999px",
        padding,
        fontSize,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {config.label}
    </span>
  );
}
