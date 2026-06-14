const { chatbotResponse } = require("../services/geminiService");

exports.ask = async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message required", data: null });
    }
    const reply = await chatbotResponse(message, req.user.role, context || "");
    res.json({ success: true, message: "OK", reply });
  } catch (err) {
    res.status(500).json({ success: false, message: `Chatbot error: ${err.message}`, data: null });
  }
};
