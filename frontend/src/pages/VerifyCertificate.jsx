import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  CircleCheck,
  CircleX,
  Hash as HashIcon,
  Loader2,
  QrCode,
  ShieldCheck,
  UploadCloud,
  Copy as CopyIcon,
  PlusCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

async function sha256Hex(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCertificateHash(name, certId) {
  // Backend matches: crypto.createHash("sha256").update(name + certId).digest("hex")
  return sha256Hex(`${name}${certId}`);
}

export default function VerifyCertificate() {
  const location = useLocation();
  const [name, setName] = useState("");
  const [certId, setCertId] = useState("");

  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("idle"); // idle | added | valid | invalid
  const [message, setMessage] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [selectedFileName, setSelectedFileName] = useState("");
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && certId.trim().length > 0 && !isAdding && !isVerifying;
  }, [name, certId, isAdding, isVerifying]);

  useEffect(() => {
    // Clear "valid/fake" state when user edits inputs
    setStatus("idle");
    setMessage("");
    setCopied(false);
  }, [name, certId]);

  useEffect(() => {
    if (!location.state) return;
    if (location.state.name) setName(location.state.name);
    if (location.state.certId) setCertId(location.state.certId);
  }, [location.state]);

  const qrSrc = useMemo(() => {
    if (!hash) return "";
    // No dependency needed: let an external API render a QR for the hash.
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      hash
    )}`;
  }, [hash]);

  const handleAddCertificate = async () => {
    if (!name || !certId) {
      setStatus("idle");
      setMessage("Please enter both Name and Certificate ID.");
      return;
    }

    setIsAdding(true);
    setStatus("idle");
    setMessage("");
    setCopied(false);

    try {
      // Keep backend call exactly the same.
      const res = await axios.post(`${API_BASE_URL}/blockchain/add`, { name, certId });
      const nextHash = res.data?.hash || "";
      setHash(nextHash);
      setStatus("added");
      setMessage("Certificate added to blockchain (mocked hash stored).");
    } catch (err) {
      setStatus("idle");
      setMessage(err.response?.data?.message || "Failed to add certificate.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyCertificate = async () => {
    if (!name || !certId) {
      setStatus("idle");
      setMessage("Please enter both Name and Certificate ID.");
      return;
    }

    setIsVerifying(true);
    setStatus("idle");
    setMessage("");
    setCopied(false);

    try {
      // Compute hash in the frontend (backend returns only { valid }).
      const computedHash = await getCertificateHash(name, certId);
      setHash(computedHash);

      // Keep backend call exactly the same.
      const res = await axios.post(`${API_BASE_URL}/blockchain/verify`, { name, certId });
      const valid = !!res.data?.valid;

      if (valid) {
        setStatus("valid");
        setMessage("Certificate is valid.");
      } else {
        setStatus("invalid");
        setMessage("Certificate looks fake or unregistered.");
      }
    } catch (err) {
      setStatus("idle");
      setMessage(err.response?.data?.message || "Failed to verify certificate.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyHash = async () => {
    if (!hash) return;
    try {
      await window.navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setMessage("Copy failed. You can manually select and copy the hash.");
    }
  };

  const resultCard = (() => {
    if (status === "valid") {
      return (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm animate-[fadeInUp_300ms_ease-out]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-green-600/10 p-2">
              <CircleCheck className="h-6 w-6 text-green-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-green-900">Valid Certificate</h3>
              </div>
              <p className="mt-1 text-sm text-green-800">{message}</p>
            </div>
          </div>
        </div>
      );
    }

    if (status === "invalid") {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm animate-[fadeInUp_300ms_ease-out]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-red-600/10 p-2">
              <CircleX className="h-6 w-6 text-red-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-red-900">Fake Certificate</h3>
              </div>
              <p className="mt-1 text-sm text-red-800">{message}</p>
            </div>
          </div>
        </div>
      );
    }

    if (status === "added") {
      return (
        <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-blue-600/10 p-2">
              <ShieldCheck className="h-6 w-6 text-blue-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">Certificate Added</h3>
              </div>
              <p className="mt-1 text-sm text-gray-700">{message}</p>
            </div>
          </div>
        </div>
      );
    }

    if (!message) return null;
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
        <p className="text-sm font-medium text-amber-900">{message}</p>
      </div>
    );
  })();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

          <div className="p-6 sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10">
                <ShieldCheck className="h-6 w-6 text-blue-700" />
              </div>
              <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
                Certificate Verification
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Enter details to add or verify a certificate. The hash shown matches the backend SHA-256
                of <span className="font-semibold">name + certId</span>.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                <label className="block text-sm font-semibold text-gray-700">Name</label>
                <div className="mt-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-inner outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="e.g. Aisha Khan"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4">
                <label className="block text-sm font-semibold text-gray-700">Certificate ID</label>
                <div className="mt-2">
                  <input
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-inner outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="e.g. CERT-2026-001"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddCertificate}
                  disabled={!canSubmit}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-800 px-5 py-3 text-sm font-bold text-white shadow-md transition duration-200 hover:bg-blue-900 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:-translate-y-0"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      Add Certificate
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleVerifyCertificate}
                  disabled={!canSubmit}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-md transition duration-200 hover:bg-black hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:-translate-y-0"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      Verify Certificate
                    </>
                  )}
                </button>
              </div>

              <div className="text-right text-xs text-gray-500">
                Tip: Use the exact same Name + Certificate ID you used when adding.
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                {resultCard}

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <HashIcon className="h-5 w-5 text-gray-700" />
                      <h2 className="text-sm font-bold text-gray-900">Certificate Hash</h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      disabled={!hash}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100 disabled:opacity-60"
                    >
                      <CopyIcon className="h-4 w-4" />
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-3">
                    {hash ? (
                      <div className="rounded-xl bg-gray-50 p-4">
                        <code className="block overflow-x-auto text-xs font-mono text-gray-900">
                          {hash}
                        </code>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Hash will appear after verification.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-gray-700" />
                    <h2 className="text-sm font-bold text-gray-900">QR Code (Bonus)</h2>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Scan to copy the certificate hash quickly.
                  </p>

                  <div className="mt-4 flex items-center justify-center">
                    {hash ? (
                      <div className="rounded-2xl bg-gray-50 p-3 shadow-sm">
                        <img src={qrSrc} alt="Certificate hash QR code" className="h-auto w-[180px]" loading="lazy" />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
                        <p className="text-sm font-semibold text-gray-700">QR will appear after verification.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-gray-700" />
                    <h2 className="text-sm font-bold text-gray-900">Upload Document (UI Placeholder)</h2>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    This is a frontend-only placeholder. No upload API is called.
                  </p>

                  <div className="mt-4">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setSelectedFileName(file ? file.name : "");
                        }}
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                      Choose file
                    </label>
                    {selectedFileName ? (
                      <p className="mt-3 text-xs text-gray-600">
                        Selected: <span className="font-semibold text-gray-900">{selectedFileName}</span>
                      </p>
                    ) : (
                      <p className="mt-3 text-xs text-gray-500">No file selected.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500">
              Backend routes used: <span className="font-mono">POST /blockchain/add</span> and{" "}
              <span className="font-mono">POST /blockchain/verify</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}