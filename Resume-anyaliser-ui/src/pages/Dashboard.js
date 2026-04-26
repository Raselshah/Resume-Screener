import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ── Score ring SVG ────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : score >= 30 ? "#f97316" : "#ef4444";
  return (
    <div className="score-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle className="score-ring-bg" cx="55" cy="55" r={r} />
        <circle
          className="score-ring-fill"
          cx="55" cy="55" r={r}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring-text">
        <span className="score-num" style={{ color }}>{score}</span>
        <span className="score-pct">/ 100</span>
      </div>
    </div>
  );
}

// ── Dimension bar ─────────────────────────────────────────────────────────────
function DimBar({ label, value }) {
  const color = value >= 70 ? "#22c55e" : value >= 50 ? "#f59e0b" : value >= 30 ? "#f97316" : "#ef4444";
  return (
    <div className="dim-row">
      <div className="dim-label-row">
        <span className="dim-name">{label}</span>
        <span className="dim-val" style={{ color }}>{value}%</span>
      </div>
      <div className="dim-bar">
        <div className="dim-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Result display ────────────────────────────────────────────────────────────
function ResultDisplay({ result, engine, isGuest }) {
  const scoreColor = result.score >= 70 ? "c-green" : result.score >= 50 ? "c-yellow" : "c-red";

  return (
    <div className="result-section">
      <span className={`engine-badge ${engine === "groq" ? "engine-groq" : "engine-rule"}`}>
        {engine === "groq" ? "⚡ Powered by Groq AI" : "📊 Keyword analysis mode"}
      </span>

      {/* Score Hero */}
      <div className="score-hero">
        <ScoreRing score={result.score} />
        <div className="score-info">
          <div className={`score-label ${scoreColor}`}>{result.label}</div>
          <div className="score-summary">{result.summary}</div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="dimensions-card">
        <div className="card-title">Score breakdown</div>
        <DimBar label="Skills Match" value={result.skillsMatch || result.skills_match || 0} />
        <DimBar label="Experience Match" value={result.experienceMatch || result.experience_match || 0} />
        <DimBar label="Keyword Coverage" value={result.keywordMatch || result.keyword_match || 0} />
        <DimBar label="Education Fit" value={result.educationMatch || result.education_match || 0} />
      </div>

      {/* Keywords + Strengths */}
      <div className="cards-row">
        <div className="info-card">
          <div className="card-title">✅ Matched keywords</div>
          <div className="tags">
            {(result.matchedKeywords || result.matched_keywords || []).map((k) => (
              <span key={k} className="tag tag-match">{k}</span>
            ))}
          </div>
        </div>
        <div className="info-card">
          <div className="card-title">❌ Missing keywords</div>
          <div className="tags">
            {(result.missingKeywords || result.missing_keywords || []).map((k) => (
              <span key={k} className="tag tag-miss">{k}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths */}
      {(result.strengths || []).length > 0 && (
        <div className="info-card">
          <div className="card-title">💪 Your strengths</div>
          <div className="tags">
            {(result.strengths || []).map((s) => (
              <span key={s} className="tag tag-strength">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="suggestions-card">
        <div className="card-title">🎯 How to improve your resume</div>
        {(result.suggestions || []).map((s, i) => (
          <div key={i} className="suggestion-item">
            <span className="sug-num">{i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {/* Guest upgrade prompt */}
      {isGuest && (
        <div className="upgrade-card">
          <h3>Save your analysis history</h3>
          <p>You've used {3 - 0} of 3 free guest analyses. Create a free account to get unlimited analyses and save your history.</p>
          <Link to="/register">
            <button className="btn-primary">Create free account →</button>
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [form, setForm] = useState({ jobTitle: "", jobDescription: "", resumeText: "" });
  const [result, setResult] = useState(null);
  const [engine, setEngine] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isGuest = !user;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setResult(null); setLoading(true);
    try {
      let res;
      if (isGuest) {
        // Guest uses public endpoint
        res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/analyze/guest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Analysis failed");
        }
        const data = await res.json();
        setResult(data.analysis);
        setEngine(data.engine || "");
      } else {
        res = await api.post("/analyze", form);
        setResult(res.data.analysis);
        setEngine(res.data.engine || "");
      }
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Resume Screener</h1>
        <p>{isGuest ? "Try it free — no account needed (3 analyses/day)" : `Welcome back, ${user?.name}. Paste a JD and resume to analyze your fit.`}</p>
      </div>

      <div className="screener-form">
        {isGuest && (
          <div className="guest-info">
            <strong>Guest mode</strong> — 3 free analyses per day. <Link to="/register">Sign up free</Link> for unlimited access + history.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job title (optional)</label>
            <input type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Senior Full Stack Developer" />
          </div>
          <div className="two-col">
            <div className="form-group">
              <label>Job description *</label>
              <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange} placeholder="Paste the full job description here..." rows={10} required />
            </div>
            <div className="form-group">
              <label>Your resume *</label>
              <textarea name="resumeText" value={form.resumeText} onChange={handleChange} placeholder="Paste your resume content here..." rows={10} required />
            </div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze my resume →"}
          </button>
          {isGuest && (
            <Link to="/login">
              <button type="button" className="btn-ghost">Sign in to save results</button>
            </Link>
          )}
        </form>
      </div>

      {loading && (
        <div className="analysis-loading">
          <div className="spinner" />
          <p style={{ color: "var(--text2)", fontSize: 14 }}>AI is analyzing your resume against the job description...</p>
        </div>
      )}

      {result && <ResultDisplay result={result} engine={engine} isGuest={isGuest} />}
    </div>
  );
}
