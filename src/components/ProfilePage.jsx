import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TextField, Button, Typography, Box, Paper, List, ListItem } from '@mui/material';

function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    displayName: '',
    skillsOffered: [],
    skillsNeeded: [],
    points: 0,
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
        displayName: profile.displayName || currentUser.displayName,
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
        skillsOffered: [...profile.skillsOffered, newSkillOffer],
      });
      setNewSkillOffer('');
    }
  };

  const addSkillNeed = () => {
    if (newSkillNeed) {
      setProfile({
        ...profile,
        skillsNeeded: [...profile.skillsNeeded, newSkillNeed],
      });
      setNewSkillNeed('');
    }
  };

  if (!currentUser) return <Typography variant="h6">Please log in</Typography>;

  return (
    <Box sx={{ maxWidth: 600, margin: '2rem auto', padding: '2rem' }}>
      <Paper sx={{ padding: '2rem', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <TextField
          fullWidth
          label="Display Name"
          value={profile.displayName}
          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          variant="outlined"
          margin="normal"
        />

        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h6">Skills Offered</Typography>
          <List>
            {profile.skillsOffered.map((skill, idx) => (
              <ListItem key={idx}>{skill}</ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Add skill offered"
              value={newSkillOffer}
              onChange={(e) => setNewSkillOffer(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <Button onClick={addSkillOffer} variant="contained" color="primary">
              Add
            </Button>
          </Box>
        </Box>

        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h6">Skills Needed</Typography>
          <List>
            {profile.skillsNeeded.map((skill, idx) => (
              <ListItem key={idx}>{skill}</ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Add skill needed"
              value={newSkillNeed}
              onChange={(e) => setNewSkillNeed(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <Button onClick={addSkillNeed} variant="contained" color="primary">
              Add
            </Button>
          </Box>
        </Box>

        <Typography variant="body1">Points: {profile.points}</Typography>
        <Button
          onClick={handleUpdate}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Update Profile
        </Button>
      </Paper>
    </Box>
  );
}

export default ProfilePage;
