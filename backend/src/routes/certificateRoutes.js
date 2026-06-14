const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const certificateController = require("../controllers/certificateController");

router.post(
  "/upload-and-verify",
  protect,
  authorize("applicant"),
  certificateController.uploadAndVerify
);
router.get("/my", protect, authorize("applicant"), certificateController.listMine);
router.get("/", protect, authorize("employer", "institution"), certificateController.listAll);
router.get("/:id", protect, certificateController.getOne);
router.post("/issue", protect, authorize("institution"), certificateController.issue);
router.post("/revoke/:id", protect, authorize("institution"), certificateController.revoke);

module.exports = router;
