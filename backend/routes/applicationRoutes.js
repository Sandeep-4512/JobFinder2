const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Application = require('../models/Application');
const Job = require('../models/Job');

const router = express.Router();

// Route to apply for a job with a portfolio link
router.post('/apply', protect, async (req, res) => {
  try {
    const { jobId, portfolioLink } = req.body;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Check if the user has already applied to the job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id,
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    // Create a new application
    const newApplication = new Application({
      job: jobId,
      applicant: req.user._id,
      portfolioLink,
    });

    await newApplication.save();

    res.status(200).json({
      message: 'Application submitted successfully.',
      application: newApplication,
    });
  } catch (err) {
    console.error('Error applying to job:', err);
    res.status(500).json({ message: 'Error applying to job.' });
  }
});

// Route to get all applications for a specific job (for recruiters)
router.get('/job/:jobId', protect, async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId }).populate('applicant', 'name email');
    res.status(200).json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ message: 'Error fetching applications.' });
  }
});

module.exports = router;
