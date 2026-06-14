const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const chatbotController = require("../controllers/chatbotController");

router.post("/ask", protect, chatbotController.ask);

module.exports = router;
