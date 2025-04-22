import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FaHome, FaStore, FaUser, FaUsers, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { Box, Dialog, DialogTitle, DialogActions, Button, Snackbar, Alert } from '@mui/material';
import '../styles/layout.css';

const Layout = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleLogoutClick = () => {
    setOpenLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    setOpenLogoutDialog(false);
    try {
      await signOut(auth);
      setSnackbarOpen(true); // Show logout success
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed: ' + error.message); // Keep alert for errors
    }
  };

  const handleCancelLogout = () => {
    setOpenLogoutDialog(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
              <button onClick={handleLogoutClick} className="navbar-link logout-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
              <FaSignOutAlt style={{ marginRight: '5px' }} /> Logout
            </button>
            
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

      {/* Logout Confirmation Dialog */}
      <Dialog open={openLogoutDialog} onClose={handleCancelLogout}>
        <DialogTitle>Are you sure you want to log out?</DialogTitle>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">Cancel</Button>
          <Button onClick={handleConfirmLogout} color="error">Logout</Button>
        </DialogActions>
      </Dialog>

      {/* Logout Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Logged out successfully!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Layout;
