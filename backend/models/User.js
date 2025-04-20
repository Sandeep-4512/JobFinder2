const mongoose = require("mongoose");

// Subschema for education details
const EducationSchema = new mongoose.Schema({
  level: { type: String, required: true },         // e.g. 10th, Inter, Graduation
  instituteName: { type: String, required: true }, // School or college
  courseDuration: { type: String },                // e.g. "2015 - 2017"
  percentage: { type: String },                    // e.g. "87%"
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["recruiter", "job-seeker"], required: true },

  // Extended fields for job seekers
  contact: String,
  dob: Date,
  experience: String,
  education: [EducationSchema], // Updated structured array
  skills: [String],
});

module.exports = mongoose.model("User", UserSchema);
