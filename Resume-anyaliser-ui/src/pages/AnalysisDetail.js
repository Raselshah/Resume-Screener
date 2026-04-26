import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

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

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/history/${id}`)
      .then((res) => setAnalysis(res.data.analysis))
      .catch(() => navigate("/history"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="page"><p style={{color:"var(--text2)"}}>Loading...</p></div>;
  if (!analysis) return null;

  const scoreColor = analysis.score >= 70 ? "var(--green)" : analysis.score >= 50 ? "var(--yellow)" : "var(--red)";

  return (
    <div className="page">
      <button className="btn-back" onClick={() => navigate("/history")}>← Back to history</button>
      <div className="page-header">
        <h1>{analysis.jobTitle || "Untitled Role"}</h1>
        <p>Analyzed on {new Date(analysis.createdAt).toLocaleString()}</p>
      </div>

      <div className="result-section">
        <div className="score-hero">
          <div className="score-ring-wrap">
            <svg width="110" height="110" viewBox="0 0 110 110" style={{transform:"rotate(-90deg)"}}>
              <circle className="score-ring-bg" cx="55" cy="55" r="46" />
              <circle className="score-ring-fill" cx="55" cy="55" r="46"
                stroke={scoreColor}
                strokeDasharray={2 * Math.PI * 46}
                strokeDashoffset={2 * Math.PI * 46 * (1 - analysis.score / 100)}
                fill="none" strokeWidth="8" strokeLinecap="round"
              />
            </svg>
            <div className="score-ring-text">
              <span className="score-num" style={{ color: scoreColor }}>{analysis.score}</span>
              <span className="score-pct">/ 100</span>
            </div>
          </div>
          <div className="score-info">
            <div className="score-label" style={{ color: scoreColor }}>{analysis.label}</div>
            <div className="score-summary">{analysis.summary}</div>
          </div>
        </div>

        <div className="dimensions-card">
          <div className="card-title">Score breakdown</div>
          <DimBar label="Skills Match" value={analysis.skillsMatch || 0} />
          <DimBar label="Experience Match" value={analysis.experienceMatch || 0} />
          <DimBar label="Keyword Coverage" value={analysis.keywordMatch || 0} />
          <DimBar label="Education Fit" value={analysis.educationMatch || 0} />
        </div>

        <div className="cards-row">
          <div className="info-card">
            <div className="card-title">✅ Matched keywords</div>
            <div className="tags">{analysis.matchedKeywords.map(k => <span key={k} className="tag tag-match">{k}</span>)}</div>
          </div>
          <div className="info-card">
            <div className="card-title">❌ Missing keywords</div>
            <div className="tags">{analysis.missingKeywords.map(k => <span key={k} className="tag tag-miss">{k}</span>)}</div>
          </div>
        </div>

        {analysis.strengths?.length > 0 && (
          <div className="info-card">
            <div className="card-title">💪 Strengths</div>
            <div className="tags">{analysis.strengths.map(s => <span key={s} className="tag tag-strength">{s}</span>)}</div>
          </div>
        )}

        <div className="suggestions-card">
          <div className="card-title">🎯 How to improve</div>
          {analysis.suggestions.map((s, i) => (
            <div key={i} className="suggestion-item">
              <span className="sug-num">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
