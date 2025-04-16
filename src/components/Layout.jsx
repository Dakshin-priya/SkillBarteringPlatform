// src/components/Layout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/layout.css';  // Import the layout CSS for styling

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="logo">
            Home {/* This is where we change Skill Barter to Home */}
          </Link>
          <div className="links">
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/matches">Matches</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Home Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
