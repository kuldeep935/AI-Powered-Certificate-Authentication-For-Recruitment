const { ethers } = require("ethers");
const crypto = require("crypto");

// ✅ CONNECT PROVIDER (Ethers v6)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// 📌 CONTRACT ADDRESS
const contractAddress = "0xd8b934580fcE35a11B50cE99B9e1DA61969929D6";

// ✅ FIXED ABI (REMOVE EXTRA [])
const abi = [
  {
    "inputs": [
      { "internalType": "string", "name": "_hash", "type": "string" },
      { "internalType": "string", "name": "_issuer", "type": "string" }
    ],
    "name": "addCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_hash", "type": "string" }
    ],
    "name": "verifyCertificate",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ❌ NO WALLET → USE PROVIDER ONLY
const contract = new ethers.Contract(contractAddress, abi, provider);

// 🔐 HASH FUNCTION
function generateHash(name, certId) {
  return crypto.createHash("sha256").update(name + certId).digest("hex");
}

// 🧪 TEMP STORAGE (FOR DEMO)
let storedHashes = [];

// ➕ ADD CERTIFICATE (MOCK FOR NOW)
exports.addCertificate = async (name, certId) => {
  const hash = generateHash(name, certId);

  storedHashes.push(hash); // simulate blockchain write

  return hash;
};

// ✔ VERIFY CERTIFICATE
exports.verifyCertificate = async (name, certId) => {
  const hash = generateHash(name, certId);

  try {
    // Try blockchain
    const result = await contract.verifyCertificate(hash);
    return result;
  } catch (err) {
    // fallback if blockchain not connected
    return storedHashes.includes(hash);
  }
};