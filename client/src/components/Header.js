import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            LMS
          </Link>
          <nav className="nav-links">
            {user ? (
              <>
                <Link to="/leads" className="nav-link">
                  Leads
                </Link>
                <Link to="/leads/new" className="nav-link">
                  Add Lead
                </Link>
                <div className="user-info">
                  <span>Welcome, {user.firstName}!</span>
                  <button onClick={onLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
