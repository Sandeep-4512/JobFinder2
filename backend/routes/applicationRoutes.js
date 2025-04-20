const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// ✅ Apply for a job
router.post('/apply', auth, async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });

    // prevent recruiters from applying
    if (req.user.role !== 'job-seeker') {
      return res.status(403).json({ message: 'Only job seekers can apply' });
    }

    const existingApp = await Application.findOne({
      job: jobId,
      applicant: req.user.id,
    });

    if (existingApp) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    const newApp = new Application({
      job: jobId,
      applicant: req.user.id,
    });

    await newApp.save();

    await Job.findByIdAndUpdate(jobId, {
      $push: { applicants: newApp._id },
    });

    const job = await Job.findById(jobId).populate('postedBy');

    if (job && job.postedBy) {
      await Notification.create({
        user: job.postedBy._id,
        type: 'application',
        message: `${req.user.name} applied for your job: "${job.title}"`,
      });
    }

    res.status(201).json(newApp);
  } catch (error) {
    console.error('❌ Apply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ View applications submitted by current user
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get applications for a specific job
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    // restrict viewing to owner only
    if (job?.postedBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email skills education contact experience');

    res.json(applications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update application status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id)
      .populate('applicant job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // prevent other recruiters from approving jobs not posted by them
    if (application.job?.postedBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    await Notification.create({
      user: application.applicant._id,
      type: status === 'approved' ? 'approval' : 'rejection',
      message: `Your application for "${application.job.title}" was ${status}`,
    });

    res.json(application);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
