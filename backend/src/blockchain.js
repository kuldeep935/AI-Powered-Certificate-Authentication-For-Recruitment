const { ethers } = require("ethers");
const crypto = require("crypto");

const CONTRACT_ABI = [
  "function issueCertificate(string certHash, string issuerName, string candidateName, string courseName) external",
  "function revokeCertificate(string certHash) external",
  "function verifyCertificate(string certHash) external view returns (bool exists, bool isRevoked, string issuerName, string candidateName, string courseName, uint256 issueDate)",
  "function authorizeIssuer(address issuer) external",
];

function computeHash(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

function readConfigured() {
  const address = process.env.CONTRACT_ADDRESS;
  const rpc = process.env.RPC_URL;
  const key = process.env.PRIVATE_KEY;
  return { address, rpc, key };
}

async function getContractReadOnly() {
  const { address, rpc } = readConfigured();
  if (!address || !rpc) return null;
  const provider = new ethers.JsonRpcProvider(rpc);
  return new ethers.Contract(address, CONTRACT_ABI, provider);
}

async function getContractSigner() {
  const { address, rpc, key } = readConfigured();
  if (!address || !rpc || !key) return null;
  const provider = new ethers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet(key, provider);
  return new ethers.Contract(address, CONTRACT_ABI, signer);
}

async function addToBlockchain(certData) {
  const hash = computeHash(certData);
  const contract = await getContractSigner();
  if (!contract) {
    return {
      success: false,
      hash,
      error: "Blockchain not configured (CONTRACT_ADDRESS, RPC_URL, PRIVATE_KEY)",
    };
  }
  try {
    const tx = await contract.issueCertificate(
      hash,
      certData.issuingInstitution || "Unknown",
      certData.candidateName || "Unknown",
      certData.courseName || "Unknown"
    );
    await tx.wait();
    return { success: true, hash, txHash: tx.hash };
  } catch (err) {
    return { success: false, hash, error: err.message };
  }
}

async function revokeOnBlockchain(hash) {
  const contract = await getContractSigner();
  if (!contract || !hash) {
    return { success: false, error: "Blockchain not configured or missing hash" };
  }
  try {
    const tx = await contract.revokeCertificate(hash);
    await tx.wait();
    return { success: true, txHash: tx.hash };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function verifyOnBlockchain(hash) {
  const contract = await getContractReadOnly();
  if (!contract || !hash) {
    return { exists: false, isRevoked: false, message: "Blockchain not configured" };
  }
  try {
    const result = await contract.verifyCertificate(hash);
    return {
      exists: Boolean(result[0]),
      isRevoked: Boolean(result[1]),
      issuerName: result[2],
      candidateName: result[3],
      courseName: result[4],
      issueDate: result[5] ? new Date(Number(result[5]) * 1000).toISOString() : null,
    };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

module.exports = {
  computeHash,
  addToBlockchain,
  verifyOnBlockchain,
  revokeOnBlockchain,
};
