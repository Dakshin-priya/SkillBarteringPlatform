import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { uploadString, ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

function UserProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    displayName: '',
    location: '',
    skillsOffered: [],
    skillsNeeded: [],
    points: 0,
    rating: 0,
    trades: [], // Explicitly initialized as an array
    photoURL: ''
  });
  const [newSkillOffer, setNewSkillOffer] = useState('');
  const [newSkillNeed, setNewSkillNeed] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            displayName: data.displayName || `User_${currentUser.uid.slice(0, 8)}`,
            location: data.location || '',
            skillsOffered: data.skillsOffered || [],
            skillsNeeded: data.skillsNeeded || [],
            points: data.points || 0,
            rating: data.rating || 0,
            trades: data.trades || [], // Default to empty array if undefined
            photoURL: data.photoURL || ''
          });
          if (data.photoURL) {
            setPhotoPreview(data.photoURL);
          }
        } else {
          await setDoc(docRef, {
            displayName: currentUser.displayName || `User_${currentUser.uid.slice(0, 8)}`,
            location: '',
            skillsOffered: [],
            skillsNeeded: [],
            points: 0,
            rating: 0,
            trades: [], // Ensure trades is initialized
            photoURL: ''
          });
        }
      };
      fetchProfile();
    }
  }, [currentUser]);

  const handleUpdate = async () => {
    if (!currentUser) return;
    try {
      let photoURL = profile.photoURL;
      if (photo) {
        const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${uuidv4()}`);
        await uploadString(storageRef, photo, 'data_url');
        photoURL = await getDownloadURL(storageRef);
      }
      await setDoc(doc(db, 'users', currentUser.uid), { ...profile, photoURL }, { merge: true });
      setPhotoPreview(photoURL);
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!currentUser) return <div>Please log in</div>;

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={profile.displayName}
          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          placeholder="Display Name"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          value={profile.location}
          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
          placeholder="Location (e.g., New York)"
          className="w-full p-2 border rounded"
        />
        <div>
          <label className="block mb-2">Profile Photo</label>
          {photoPreview && <img src={photoPreview} alt="Profile" className="w-32 h-32 mb-2 rounded-full object-cover" />}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full p-2 border rounded"
          />
        </div>
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
        <p>Rating: {profile.rating}/5</p>
        <h3 className="font-semibold">Trade History</h3>
        <ul className="list-disc pl-5">
          {(profile.trades || []).map((trade, idx) => ( // Added default empty array
            <li key={idx}>{trade}</li>
          ))}
        </ul>
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

export default UserProfilePage;