// src/components/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaStore, FaUser, FaUsers, FaSignInAlt } from 'react-icons/fa'; // Importing icons
import '../styles/layout.css';  // Import the layout CSS for styling

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <FaHome size={24} style={{ marginRight: '10px' }} /> Home {/* Logo with icon */}
          </Link>
          <div className="navbar-links">
            <Link to="/marketplace" className="navbar-link"><FaStore /> Marketplace</Link>
            <Link to="/profile" className="navbar-link"><FaUser /> Profile</Link>
            <Link to="/matches" className="navbar-link"><FaUsers /> Matches</Link>
            <Link to="/login" className="navbar-link"><FaSignInAlt /> Login</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Home Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
