import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" onClick={closeMobileMenu}>
        ResumeAI
      </Link>

      <button
        className={`mobile-menu-btn ${mobileMenuOpen ? "open" : ""}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`nav-right ${mobileMenuOpen ? "open" : ""}`}>
        {user ? (
          <>
            <Link
              to="/dashboard"
              className="nav-link"
              onClick={closeMobileMenu}
            >
              Screener
            </Link>
            <Link to="/history" className="nav-link" onClick={closeMobileMenu}>
              History
            </Link>
            <span className="nav-user">{user.name}</span>
            <button className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className="nav-link"
              onClick={closeMobileMenu}
            >
              Screener
            </Link>
            <Link to="/login" className="nav-link" onClick={closeMobileMenu}>
              Login
            </Link>
            <Link to="/register" onClick={closeMobileMenu}>
              <button className="nav-logout nav-signup">Sign up free</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
