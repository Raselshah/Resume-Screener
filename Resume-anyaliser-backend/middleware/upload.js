const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Use memory storage for serverless environments (like Vercel)
// Files are stored in memory and processed immediately
const storage = multer.memoryStorage();

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.originalname.endsWith(".pdf")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
  fileFilter: fileFilter,
});

module.exports = upload;
