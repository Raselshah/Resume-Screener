const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jobTitle: { type: String, default: "Untitled Role" },
    jobDescription: { type: String, required: true },
    resumeText: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    label: { type: String },
    summary: { type: String },
    experienceMatch: { type: Number, default: 0 },
    skillsMatch: { type: Number, default: 0 },
    educationMatch: { type: Number, default: 0 },
    keywordMatch: { type: Number, default: 0 },
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    strengths: [{ type: String }],
    suggestions: [{ type: String }],
    engine: { type: String, default: "groq" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
