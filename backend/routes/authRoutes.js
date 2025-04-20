const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if all required fields are provided
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) return res.status(400).json({ message: "User not found" });

  // Compare the provided password with the stored password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  // Create JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

  res.json({ token, user });
});

// Profile update route (for job seekers)
router.put("/update-profile", protect, async (req, res) => {
  try {
    if (req.user.role !== "job-seeker") {
      return res.status(403).json({ message: "Only job seekers can update profile" });
    }

    const updates = {
      contact: req.body.contact,
      dob: req.body.dob,
      experience: req.body.experience,
      education: Array.isArray(req.body.education) ? req.body.education : [],
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
    };

    // Update the user's profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
});

module.exports = router;
