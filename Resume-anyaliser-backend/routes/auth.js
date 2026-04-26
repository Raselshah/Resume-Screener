const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: "Too many attempts. Please try again later." },
});

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
router.post("/register", authLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required." });

  if (password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters." });

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered." });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Registration failed.", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password." });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
});

// GET /api/auth/me  (get logged-in user info)
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
