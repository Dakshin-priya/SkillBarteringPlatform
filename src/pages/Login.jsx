import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Login() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const checkProfile = async () => {
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
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;