const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [String],
  requiredCertifications: [String],
  location: String,
  jobType: {
    type: String,
    enum: ["full-time", "part-time", "contract", "internship"],
    default: "full-time",
  },
  isActive: { type: Boolean, default: true },
  applications: [
    {
      applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["applied", "reviewed", "shortlisted", "rejected"],
        default: "applied",
      },
      appliedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", jobSchema);
