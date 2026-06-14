const { GoogleGenerativeAI } = require("@google/generative-ai");

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  return genAI.getGenerativeModel({ model: modelName });
}

async function askGemini(prompt, systemContext = "") {
  const model = getModel();
  if (!model) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  const fullPrompt = systemContext ? `${systemContext}\n\nUser: ${prompt}` : prompt;
  const result = await model.generateContent(fullPrompt);
  return result.response.text();
}

async function analyzeCertificate(extractedText, verificationStatus) {
  if (!process.env.GEMINI_API_KEY || !extractedText) {
    return null;
  }
  const prompt = `
You are an AI certificate analyst. Given the following certificate text and verification status, provide:
1. A brief summary of the certificate
2. Key skills/qualifications identified
3. Any concerns or red flags
4. Overall authenticity assessment

Certificate Text: ${extractedText.slice(0, 12000)}
Verification Status: ${verificationStatus}

Respond in JSON format: { "summary": "", "skills": [], "concerns": [], "assessment": "", "confidence": 0 }
`;
  try {
    const response = await askGemini(prompt);
    const cleaned = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function chatbotResponse(userMessage, userRole, context = "") {
  if (!process.env.GEMINI_API_KEY) {
    return "CertBot is offline: add GEMINI_API_KEY to the server environment for AI answers. You can still use verification and dashboards.";
  }
  const systemPrompt = `You are CertBot, an AI assistant for an AI-Powered Certificate Authentication System.
You help ${userRole}s with certificate verification, understanding results, and using the platform.
Context: ${context}
Be concise, helpful, and professional. Answer only questions related to certificates, recruitment, and this platform.`;
  try {
    return await askGemini(userMessage, systemPrompt);
  } catch (err) {
    return `Sorry, I could not reach the AI service: ${err.message}`;
  }
}

module.exports = { askGemini, analyzeCertificate, chatbotResponse };
