import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// MUI Components
import {
  Container,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

function Login() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const checkProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data();
            if (!profile.location || profile.skillsOffered.length === 0) {
              navigate('/profile');
            } else {
              navigate('/role-select');
            }
          } else {
            navigate('/profile');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
        }
      };
      checkProfile();
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google login error:', error);
      alert(error.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: '#E3F2FD',
          backgroundImage: 'url("https://via.placeholder.com/1200x800.png?text=SkillBartering+Platform")', // Add your image URL here
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img
            src="src\assets\logo.png" // Add your logo URL here
            alt="SkillBarter Logo"
            style={{
              width: '250px',
              height: 'auto',
              borderRadius: '50%',
              marginBottom: '20px',
            }}
          />
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom align="center" color="primary">
          Welcome to SkillBarter
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 4 }}>
          Connect, collaborate, and exchange your skills with others. 
          <br />
          Ready to find your next opportunity?
        </Typography>

        <Box mt={4}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              backgroundColor: '#1976D2', // Blue primary color
              '&:hover': {
                backgroundColor: '#1565C0', // Darker blue on hover
              },
              color: 'white',
              py: 1.5,
              fontSize: '1rem',
            }}
          >
            Sign in with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
