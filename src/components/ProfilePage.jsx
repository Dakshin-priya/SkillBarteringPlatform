import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

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
    <div className="container mx-auto p-4 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={profile.displayName}
          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          placeholder="Display Name"
          className="w-full p-2 border rounded"
        />
        <div>
          <h3 className="font-semibold">Skills Offered</h3>
          <ul className="list-disc pl-5">
            {profile.skillsOffered.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newSkillOffer}
              onChange={(e) => setNewSkillOffer(e.target.value)}
              placeholder="Add skill offered"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={addSkillOffer}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Skills Needed</h3>
          <ul className="list-disc pl-5">
            {profile.skillsNeeded.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newSkillNeed}
              onChange={(e) => setNewSkillNeed(e.target.value)}
              placeholder="Add skill needed"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={addSkillNeed}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>
        <p>Points: {profile.points}</p>
        <button
          onClick={handleUpdate}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Update Profile
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;