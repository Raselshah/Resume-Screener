const express = require("express");
const { protect } = require("../middleware/auth");
const Analysis = require("../models/Analysis");

const router = express.Router();

// GET /api/history  — get all analyses for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-jobDescription -resumeText"); // exclude large fields for list view

    res.json({ analyses });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history." });
  }
});

// GET /api/history/:id  — get single analysis detail
router.get("/:id", protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis)
      return res.status(404).json({ message: "Analysis not found." });

    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analysis." });
  }
});

// DELETE /api/history/:id  — delete a single analysis
router.delete("/:id", protect, async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis)
      return res.status(404).json({ message: "Analysis not found." });

    res.json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete analysis." });
  }
});

module.exports = router;
