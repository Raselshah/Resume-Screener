import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/history")
      .then((res) => setAnalyses(res.data.analyses))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this analysis?")) return;
    await api.delete(`/history/${id}`);
    setAnalyses((prev) => prev.filter((a) => a._id !== id));
  };

  const scoreColor = (score) => {
    if (score >= 75) return "#16a34a";
    if (score >= 50) return "#d97706";
    return "#dc2626";
  };

  if (loading) return <div className="page"><p>Loading history...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Analysis history</h1>
        <p>{analyses.length} saved {analyses.length === 1 ? "analysis" : "analyses"}</p>
      </div>

      {analyses.length === 0 ? (
        <div className="empty-state">
          <p>No analyses yet. Go to the dashboard to screen your first resume.</p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>
            Screen a resume →
          </button>
        </div>
      ) : (
        <div className="history-list">
          {analyses.map((a) => (
            <div key={a._id} className="history-card">
              <div className="history-left">
                <div className="history-score" style={{ color: scoreColor(a.score) }}>
                  {a.score}
                </div>
                <div className="history-info">
                  <h3>{a.jobTitle || "Untitled Role"}</h3>
                  <p>{a.label} · {new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="history-actions">
                <button className="btn-outline" onClick={() => navigate(`/history/${a._id}`)}>View</button>
                <button className="btn-danger-outline" onClick={() => handleDelete(a._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
