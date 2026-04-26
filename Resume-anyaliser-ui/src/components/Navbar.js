import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">ResumeAI</Link>
      <div className="nav-right">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Screener</Link>
            <Link to="/history" className="nav-link">History</Link>
            <span className="nav-user">{user.name}</span>
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/" className="nav-link">Screener</Link>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register">
              <button className="nav-logout" style={{ color: "var(--accent)", borderColor: "rgba(124,106,255,0.4)" }}>Sign up free</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
