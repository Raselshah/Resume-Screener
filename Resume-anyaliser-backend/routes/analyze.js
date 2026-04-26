const express = require("express");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const Analysis = require("../models/Analysis");

const router = express.Router();

const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: "Analyze limit reached. Try again in an hour." },
});

// ── Extract text from PDF ─────────────────────────────────────────────────────
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// ── Call Groq API ─────────────────────────────────────────────────────────────
async function callGroq(jobDescription, resumeText) {
  const prompt = `You are a senior technical recruiter and ATS expert with 15+ years of experience. Carefully analyze this resume against the job description and provide a REALISTIC, DETAILED assessment.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Scoring guide (be realistic and strict — most resumes score 40-75):
- 85-100: Near perfect match, candidate has almost all required skills and experience level
- 70-84: Strong match, most key requirements met with minor gaps
- 55-69: Good match, core skills present but some important gaps
- 40-54: Partial match, relevant background but significant gaps
- 25-39: Weak match, some transferable skills but major misalignment
- 0-24: Poor match, very few relevant qualifications

Analyze these dimensions carefully:
1. Skills match (technical + soft skills mentioned vs required)
2. Experience level match (years, seniority)
3. Industry/domain relevance
4. Education requirements
5. Keyword and terminology alignment

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "score": <realistic integer 0-100>,
  "label": "<Excellent Match|Strong Match|Good Match|Fair Match|Weak Match|Poor Match>",
  "summary": "<2 sentence honest summary of fit and biggest strength/gap>",
  "experience_match": <integer 0-100>,
  "skills_match": <integer 0-100>,
  "education_match": <integer 0-100>,
  "keyword_match": <integer 0-100>,
  "matched_keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"],
  "missing_keywords": ["keyword1","keyword2","keyword3","keyword4","keyword5"],
  "strengths": ["strength1","strength2","strength3"],
  "suggestions": ["specific actionable suggestion1","suggestion2","suggestion3","suggestion4","suggestion5"]
}`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Groq error: ${err.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ── Realistic rule-based fallback ─────────────────────────────────────────────
function ruleBasedAnalysis(jobDescription, resumeText) {
  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const stopWords = new Set([
    "with",
    "that",
    "this",
    "from",
    "have",
    "will",
    "your",
    "they",
    "been",
    "were",
    "their",
    "about",
    "which",
    "when",
    "more",
    "also",
    "other",
    "into",
    "than",
    "then",
    "some",
    "such",
    "each",
    "many",
    "must",
    "only",
    "over",
    "both",
    "after",
    "before",
    "these",
    "those",
    "under",
    "while",
    "would",
    "could",
    "should",
    "there",
    "where",
    "through",
    "between",
    "during",
    "within",
    "without",
    "include",
    "including",
    "required",
    "preferred",
    "experience",
    "excellent",
    "strong",
    "knowledge",
    "ability",
    "skills",
    "working",
    "looking",
    "responsibilities",
    "requirements",
    "position",
    "company",
    "team",
    "work",
    "year",
    "years",
    "develop",
    "development",
  ]);

  const jdWords = jdLower.match(/\b[a-z][a-z0-9#+.]{2,}\b/g) || [];
  const wordFreq = {};
  jdWords.forEach((w) => {
    if (!stopWords.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
  });

  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([w]) => w);
  const matched = keywords.filter((k) => resumeLower.includes(k));
  const missing = keywords.filter((k) => !resumeLower.includes(k)).slice(0, 10);

  // More realistic scoring with variance
  const keywordRatio = matched.length / Math.max(keywords.length, 1);
  const baseScore = Math.round(keywordRatio * 70); // max 70 from keywords
  const lengthBonus = resumeText.length > 500 ? 5 : 0;
  const score = Math.min(78, Math.max(20, baseScore + lengthBonus));

  let label = "Poor Match";
  if (score >= 75) label = "Excellent Match";
  else if (score >= 62) label = "Strong Match";
  else if (score >= 50) label = "Good Match";
  else if (score >= 38) label = "Fair Match";
  else if (score >= 25) label = "Weak Match";

  return {
    score,
    label,
    summary: `Your resume aligns with ${Math.round(keywordRatio * 100)}% of the job's key terms. ${missing.length > 3 ? `Key gaps include: ${missing.slice(0, 3).join(", ")}.` : "Keyword coverage is solid."}`,
    experience_match: Math.min(85, score + 5),
    skills_match: Math.round(keywordRatio * 80),
    education_match: 60,
    keyword_match: Math.round(keywordRatio * 100),
    matched_keywords: matched.slice(0, 12),
    missing_keywords: missing.slice(0, 10),
    strengths: [
      matched.length > 5
        ? `Good coverage of ${matched.slice(0, 2).join(" and ")} skills`
        : "Some relevant experience present",
      "Resume structure appears organized",
      "Relevant industry background detected",
    ],
    suggestions: [
      missing.length > 0
        ? `Add these missing keywords naturally: ${missing.slice(0, 3).join(", ")}`
        : "Keyword coverage is strong.",
      "Quantify achievements with numbers (e.g. 'improved performance by 40%')",
      "Mirror the job description's exact terminology for ATS optimization",
      "Add a tailored professional summary at the top matching this role",
      "Highlight certifications or tools mentioned in the job description",
    ],
  };
}

// ── POST /api/analyze (authenticated) ────────────────────────────────────────
router.post(
  "/",
  protect,
  analyzeLimiter,
  upload.single("resume"),
  async (req, res) => {
    const { jobDescription, jobTitle } = req.body;
    let resumeText = req.body.resumeText;

    // Extract text from uploaded PDF if present
    if (req.file) {
      try {
        resumeText = await extractTextFromPDF(req.file.path);
        // Clean up uploaded file after extraction
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("PDF extraction error:", err);
        return res
          .status(400)
          .json({
            message:
              "Failed to extract text from PDF. Please ensure the file is a valid PDF.",
          });
      }
    }

    if (!jobDescription || !resumeText)
      return res
        .status(400)
        .json({ message: "Job description and resume are required." });

    let parsed;
    let engine = "groq";

    try {
      const rawText = await callGroq(jobDescription, resumeText);
      const clean = rawText.replace(/```json|```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in Groq response");
      parsed = JSON.parse(jsonMatch[0]);
    } catch (groqErr) {
      console.warn(
        "⚠️  Groq unavailable, using rule-based fallback:",
        groqErr.message,
      );
      parsed = ruleBasedAnalysis(jobDescription, resumeText);
      engine = "rule-based";
    }

    try {
      const analysis = await Analysis.create({
        user: req.user._id,
        jobTitle: jobTitle || "Untitled Role",
        jobDescription,
        resumeText,
        score: Math.min(100, Math.max(0, parsed.score)),
        label: parsed.label,
        summary: parsed.summary,
        experienceMatch: parsed.experience_match || 0,
        skillsMatch: parsed.skills_match || 0,
        educationMatch: parsed.education_match || 0,
        keywordMatch: parsed.keyword_match || 0,
        matchedKeywords: parsed.matched_keywords || [],
        missingKeywords: parsed.missing_keywords || [],
        strengths: parsed.strengths || [],
        suggestions: parsed.suggestions || [],
        engine,
      });
      res.status(201).json({ analysis, engine });
    } catch (dbErr) {
      res
        .status(500)
        .json({ message: "Failed to save analysis.", error: dbErr.message });
    }
  },
);

// ── POST /api/analyze/guest (no auth, limited) ────────────────────────────────
const guestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  message: {
    message:
      "Guest limit reached (3/day). Please sign up for unlimited access.",
  },
  keyGenerator: (req) => req.ip,
});

router.post(
  "/guest",
  guestLimiter,
  upload.single("resume"),
  async (req, res) => {
    const { jobDescription, jobTitle } = req.body;
    let resumeText = req.body.resumeText;

    // Extract text from uploaded PDF if present
    if (req.file) {
      try {
        resumeText = await extractTextFromPDF(req.file.path);
        // Clean up uploaded file after extraction
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("PDF extraction error:", err);
        return res
          .status(400)
          .json({
            message:
              "Failed to extract text from PDF. Please ensure the file is a valid PDF.",
          });
      }
    }

    if (!jobDescription || !resumeText)
      return res
        .status(400)
        .json({ message: "Job description and resume are required." });

    let parsed;
    let engine = "groq";

    try {
      const rawText = await callGroq(jobDescription, resumeText);
      const clean = rawText.replace(/```json|```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in Groq response");
      parsed = JSON.parse(jsonMatch[0]);
    } catch (groqErr) {
      console.warn("⚠️  Groq fallback for guest:", groqErr.message);
      parsed = ruleBasedAnalysis(jobDescription, resumeText);
      engine = "rule-based";
    }

    // Guest: return result but don't save to DB
    res.status(200).json({
      analysis: {
        jobTitle: jobTitle || "Untitled Role",
        score: Math.min(100, Math.max(0, parsed.score)),
        label: parsed.label,
        summary: parsed.summary,
        experienceMatch: parsed.experience_match || 0,
        skillsMatch: parsed.skills_match || 0,
        educationMatch: parsed.education_match || 0,
        keywordMatch: parsed.keyword_match || 0,
        matchedKeywords: parsed.matched_keywords || [],
        missingKeywords: parsed.missing_keywords || [],
        strengths: parsed.strengths || [],
        suggestions: parsed.suggestions || [],
      },
      engine,
      guest: true,
    });
  },
);

module.exports = router;
