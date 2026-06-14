const axios = require("axios");

const PYTHON_SERVICE = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

async function validateCertificateWithPython(fileUrl, extractedText = null) {
  try {
    const response = await axios.post(
      `${PYTHON_SERVICE}/verify-certificate`,
      {
        file_url: fileUrl,
        extracted_text: extractedText,
      },
      { timeout: 120000 }
    );
    return response.data;
  } catch (err) {
    return {
      success: false,
      qr_found: false,
      qr_valid: false,
      qr_url: null,
      extracted_text: extractedText || "",
      error: err.message,
    };
  }
}

async function extractCertificateData(fileUrl) {
  try {
    const response = await axios.post(
      `${PYTHON_SERVICE}/extract-data`,
      { file_url: fileUrl },
      { timeout: 120000 }
    );
    return response.data;
  } catch (err) {
    return { success: false, error: err.message, data: {} };
  }
}

module.exports = { validateCertificateWithPython, extractCertificateData };
