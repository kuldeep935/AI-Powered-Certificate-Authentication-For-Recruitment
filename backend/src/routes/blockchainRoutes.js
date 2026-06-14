const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const blockchainController = require("../controllers/blockchainController");

router.post("/add", protect, blockchainController.add);
router.post("/verify", protect, blockchainController.verify);
router.post("/hash", protect, blockchainController.hash);

module.exports = router;
