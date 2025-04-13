const express = require("express");
const Job = require("../models/Job");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Get all jobs
router.get("/", async (req, res) => {
  const jobs = await Job.find()
    .populate("postedBy", "name email")
    .populate("applicants", "name email");
  res.json(jobs);
});

// ✅ Get job by ID (MISSING previously)
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "name email")
      .populate("applicants", "name email");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Recruiter posts a job
router.post("/", auth, async (req, res) => {
  if (req.user.role !== "recruiter") {
    return res.status(403).json({ message: "Only recruiters can post jobs" });
  }

  const {
    title,
    company,
    location,
    description,
    skills,
    requirements
  } = req.body;

  const job = new Job({
    title,
    company,
    location,
    description,
    skills,
    requirements,
    postedBy: req.user.id
  });

  await job.save();
  res.json({ message: "Job posted successfully" });
});

module.exports = router;
