import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

function RoleSelect() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const checkProfile = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists() || !userDoc.data().location || userDoc.data().skillsOffered.length === 0) {
        navigate('/profile');
      }
    };
    checkProfile();
  }, [currentUser, navigate]);

  if (!currentUser) return <div>Please log in</div>;

  const handleRoleSelect = async (role) => {
    if (currentUser) {
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: currentUser.displayName || `User_${currentUser.uid.slice(0, 8)}`,
        role: role
      }, { merge: true });
      navigate(role === 'barterer' ? '/marketplace' : '/seeker');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Select Your Role</h2>
      <div className="space-y-4">
        <button
          onClick={() => handleRoleSelect('barterer')}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Barterer (Offer Services)
        </button>
        <button
          onClick={() => handleRoleSelect('seeker')}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Seeker (Request Services)
        </button>
      </div>
    </div>
  );
}

export default RoleSelect;