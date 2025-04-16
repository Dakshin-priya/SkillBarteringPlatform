import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/profile.css'; // ✅ Import your CSS

function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    displayName: '',
    skillsOffered: [],
    skillsNeeded: [],
    points: 0
  });
  const [newSkillOffer, setNewSkillOffer] = useState('');
  const [newSkillNeed, setNewSkillNeed] = useState('');

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      };
      fetchProfile();
    }
  }, [currentUser]);

  const handleUpdate = async () => {
    if (!currentUser) return;
    try {
      const updatedProfile = {
        ...profile,
        displayName: profile.displayName || currentUser.displayName
      };
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      alert('Profile updated!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.message);
    }
  };

  const addSkillOffer = () => {
    if (newSkillOffer) {
      setProfile({
        ...profile,
        skillsOffered: [...profile.skillsOffered, newSkillOffer]
      });
      setNewSkillOffer('');
    }
  };

  const addSkillNeed = () => {
    if (newSkillNeed) {
      setProfile({
        ...profile,
        skillsNeeded: [...profile.skillsNeeded, newSkillNeed]
      });
      setNewSkillNeed('');
    }
  };

  if (!currentUser) return <div>Please log in</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-heading">Profile</h2>
      <input
        type="text"
        value={profile.displayName}
        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
        placeholder="Display Name"
        className="profile-input"
      />
      <div className="skills-section">
        <h3 className="skills-title">Skills Offered</h3>
        <ul className="skill-list">
          {profile.skillsOffered.map((skill, idx) => (
            <li key={idx}>{skill}</li>
          ))}
        </ul>
        <div className="skill-input-group">
          <input
            type="text"
            value={newSkillOffer}
            onChange={(e) => setNewSkillOffer(e.target.value)}
            placeholder="Add skill offered"
            className="profile-skill-input"
          />
          <button onClick={addSkillOffer} className="add-button">Add</button>
        </div>
      </div>
      <div className="skills-section">
        <h3 className="skills-title">Skills Needed</h3>
        <ul className="skill-list">
          {profile.skillsNeeded.map((skill, idx) => (
            <li key={idx}>{skill}</li>
          ))}
        </ul>
        <div className="skill-input-group">
          <input
            type="text"
            value={newSkillNeed}
            onChange={(e) => setNewSkillNeed(e.target.value)}
            placeholder="Add skill needed"
            className="profile-skill-input"
          />
          <button onClick={addSkillNeed} className="add-button">Add</button>
        </div>
      </div>
      <p className="points-text">Points: {profile.points}</p>
      <button onClick={handleUpdate} className="update-button">Update Profile</button>
    </div>
  );
}

export default ProfilePage;
