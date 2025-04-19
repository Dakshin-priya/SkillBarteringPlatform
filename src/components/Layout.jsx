import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FaHome, FaStore, FaUser, FaUsers, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { Box } from '@mui/material';
import '../styles/layout.css';

const Layout = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed: ' + error.message);
    }
  };

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <FaHome size={24} style={{ marginRight: '10px' }} /> Home
          </Link>
          <div className="navbar-links">
            <Link to="/marketplace" className="navbar-link"><FaStore /> Marketplace</Link>
            <Link to="/profile" className="navbar-link"><FaUser /> Profile</Link>
            <Link to="/matches" className="navbar-link"><FaUsers /> Matches</Link>
            {currentUser ? (
              <span onClick={handleLogout} className="navbar-link logout-link" role="button" tabIndex={0}>
                <FaSignOutAlt /> Logout
              </span>
            ) : (
              <Link to="/login" className="navbar-link"><FaSignInAlt /> Login</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <p>© 2025 SkillBarteringPlatform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;