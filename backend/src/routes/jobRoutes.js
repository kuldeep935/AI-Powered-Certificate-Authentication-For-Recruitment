const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const Job = require("../models/Job");

router.get("/my", protect, authorize("employer"), async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id }).populate(
      "applications.applicantId",
      "name email"
    );
    res.json({ success: true, message: "OK", jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, skills } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }
    if (skills) filter.requiredSkills = { $in: skills.split(",") };
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, message: "OK", jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

router.post("/", protect, authorize("employer"), async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, employerId: req.user._id });
    res.status(201).json({ success: true, message: "Created", job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

router.post("/:id/apply", protect, authorize("applicant"), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found", data: null });
    }
    const alreadyApplied = job.applications.find(
      (a) => a.applicantId.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(409).json({ success: false, message: "Already applied", data: null });
    }
    job.applications.push({ applicantId: req.user._id });
    await job.save();
    res.json({ success: true, message: "Applied successfully", data: null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
});

module.exports = router;
