import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Chip,
  Autocomplete,
  Checkbox,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    linkedin: '',
    instagram: '',
    profilePicture: '',
    skillsOffered: [],
    skillsNeeded: [],
    points: 0,
  });
  const [offerDescriptions, setOfferDescriptions] = useState({});
  const [needDescriptions, setNeedDescriptions] = useState({});
  const [editing, setEditing] = useState(false);

  const skillOptions = [
    'Graphic Design', 'Web Development', 'Writing', 'Photography', 'Video Editing', 'Music Production',
    'Cooking', 'Tutoring (Math)', 'Tutoring (Language)', 'Fitness Training', 'Gardening', 'Carpentry',
    'Plumbing', 'Electrical Work', 'Sewing', 'Painting', 'Yoga Instruction', 'Digital Marketing',
  ];

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const migratedSkillsOffered = (data.skillsOffered || []).map(skillObj =>
            typeof skillObj === 'string' ? { skill: skillObj, description: '' } : skillObj
          );
          const migratedSkillsNeeded = (data.skillsNeeded || []).map(skillObj =>
            typeof skillObj === 'string' ? { skill: skillObj, description: '' } : skillObj
          );
          setProfile({
            displayName: data.displayName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            linkedin: data.linkedin || '',
            instagram: data.instagram || '',
            profilePicture: data.profilePicture || '',
            skillsOffered: migratedSkillsOffered,
            skillsNeeded: migratedSkillsNeeded,
            points: data.points || 0,
          });
          const offerDesc = {};
          const needDesc = {};
          migratedSkillsOffered.forEach(s => { offerDesc[s.skill] = s.description || ''; });
          migratedSkillsNeeded.forEach(s => { needDesc[s.skill] = s.description || ''; });
          setOfferDescriptions(offerDesc);
          setNeedDescriptions(needDesc);
        } else {
          await setDoc(doc(db, 'users', currentUser.uid), {
            displayName: '',
            email: '',
            phoneNumber: '',
            linkedin: '',
            instagram: '',
            profilePicture: '',
            skillsOffered: [],
            skillsNeeded: [],
            points: 0,
          });
        }
      };
      fetchProfile().catch(console.error);
    }
  }, [currentUser]);

  const handleUpdate = async () => {
    if (!currentUser) return;
    try {
      const validSkillsOffered = profile.skillsOffered.filter(s => s.skill && skillOptions.includes(s.skill));
      const validSkillsNeeded = profile.skillsNeeded.filter(s => s.skill && skillOptions.includes(s.skill));
      const updatedProfile = {
        ...profile,
        displayName: profile.displayName || currentUser.displayName,
        skillsOffered: validSkillsOffered.map(s => ({
          skill: s.skill,
          description: offerDescriptions[s.skill] || '',
        })),
        skillsNeeded: validSkillsNeeded.map(s => ({
          skill: s.skill,
          description: needDescriptions[s.skill] || '',
        })),
      };
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      alert('Profile updated!');
      setEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.message);
    }
  };

  const updateSkills = (type, newSkillArray) => {
    const updatedSkills = newSkillArray.map(skill => ({
      skill,
      description: type === 'skillsOffered' ? offerDescriptions[skill] || '' : needDescriptions[skill] || '',
    }));
    setProfile(prev => ({ ...prev, [type]: updatedSkills }));
  };

  const handleDescriptionChange = (type, skill, value) => {
    if (type === 'skillsOffered') {
      setOfferDescriptions(prev => ({ ...prev, [skill]: value }));
    } else {
      setNeedDescriptions(prev => ({ ...prev, [skill]: value }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, profilePicture: URL.createObjectURL(file) });
    }
  };

  if (!currentUser) return <Typography variant="h6">Please log in</Typography>;

  return (
    <Box sx={{ maxWidth: 1000, margin: '2rem auto', padding: '2rem' }}>
      <Paper
        sx={{
          padding: '2rem',
          borderRadius: 3,
          boxShadow: 10,
          background: '#FFFFFF',
          position: 'relative',
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        {!editing && (
          <IconButton
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: '#000',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
            }}
            onClick={() => setEditing(true)}
          >
            <EditIcon />
          </IconButton>
        )}

        {editing ? (
          <>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#000', marginBottom: 3 }}>
              Edit Profile
            </Typography>

            <Box sx={{ marginBottom: 3, textAlign: 'center', position: 'relative' }}>
              <img
                src={profile.profilePicture || 'default-profile.jpg'}
                alt="Profile"
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid #E0E0E0',
                  marginBottom: '20px',
                }}
              />
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '6px 12px',
                }}
              >
                Upload Profile Picture
                <input type="file" hidden onChange={handleProfilePictureChange} />
              </Button>
            </Box>

            <TextField fullWidth label="Display Name" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} variant="outlined" margin="normal" sx={{ backgroundColor: '#fff', borderRadius: 2 }} />
            <TextField fullWidth label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} variant="outlined" margin="normal" sx={{ backgroundColor: '#fff', borderRadius: 2 }} />
            <TextField fullWidth label="Phone Number" value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} variant="outlined" margin="normal" sx={{ backgroundColor: '#fff', borderRadius: 2 }} />
            <TextField fullWidth label="LinkedIn" value={profile.linkedin} onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })} variant="outlined" margin="normal" sx={{ backgroundColor: '#fff', borderRadius: 2 }} />
            <TextField fullWidth label="Instagram" value={profile.instagram} onChange={(e) => setProfile({ ...profile, instagram: e.target.value })} variant="outlined" margin="normal" sx={{ backgroundColor: '#fff', borderRadius: 2 }} />

            {/* Skills Offered */}
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="h6" sx={{ color: '#000' }}>Skills Offered</Typography>
              <Autocomplete
                multiple
                options={skillOptions}
                value={profile.skillsOffered.map(s => s.skill)}
                onChange={(_, newValue) => updateSkills('skillsOffered', newValue)}
                disableCloseOnSelect
                getOptionLabel={(option) => option}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                    {option}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Select Skills Offered" placeholder="Search or select skills" fullWidth />
                )}
                sx={{ backgroundColor: '#fff', borderRadius: 2 }}
              />
              {profile.skillsOffered.map((item) => (
                <TextField
                  key={item.skill}
                  label={`Description for ${item.skill}`}
                  value={offerDescriptions[item.skill] || ''}
                  onChange={(e) => handleDescriptionChange('skillsOffered', item.skill, e.target.value)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  sx={{ backgroundColor: '#fff', borderRadius: 2 }}
                />
              ))}
            </Box>

            {/* Skills Needed */}
            <Box sx={{ marginBottom: 3 }}>
              <Typography variant="h6" sx={{ color: '#000' }}>Skills Needed</Typography>
              <Autocomplete
                multiple
                options={skillOptions}
                value={profile.skillsNeeded.map(s => s.skill)}
                onChange={(_, newValue) => updateSkills('skillsNeeded', newValue)}
                disableCloseOnSelect
                getOptionLabel={(option) => option}
                renderOption={(props, option, { selected }) => (
                  <li {...props}>
                    <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                    {option}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip label={option} {...getTagProps({ index })} key={option} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Select Skills Needed" placeholder="Search or select skills" fullWidth />
                )}
                sx={{ backgroundColor: '#fff', borderRadius: 2 }}
              />
              {profile.skillsNeeded.map((item) => (
                <TextField
                  key={item.skill}
                  label={`Description for ${item.skill}`}
                  value={needDescriptions[item.skill] || ''}
                  onChange={(e) => handleDescriptionChange('skillsNeeded', item.skill, e.target.value)}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  sx={{ backgroundColor: '#fff', borderRadius: 2 }}
                />
              ))}
            </Box>

            <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ marginTop: 2 }}>
              Save Changes
            </Button>
          </>
        ) : (
          <>
            {/* Profile Picture on Top */}
            <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
              {profile.profilePicture && (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '3px solid #E0E0E0',
                    marginBottom: '16px',
                  }}
                />
              )}
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#000', marginBottom: 1 }}>
                {profile.displayName || currentUser.displayName}
              </Typography>
              <Typography variant="h6">Email: {profile.email}</Typography>
              <Typography variant="h6">Phone: {profile.phoneNumber}</Typography>
              <Typography variant="h6">LinkedIn: {profile.linkedin}</Typography>
              <Typography variant="h6">Instagram: {profile.instagram}</Typography>
            </Box>

            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="h6">Skills Offered:</Typography>
              {profile.skillsOffered.map((item) => (
                <Typography key={item.skill} variant="body1">{`${item.skill}: ${offerDescriptions[item.skill]}`}</Typography>
              ))}
            </Box>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="h6">Skills Needed:</Typography>
              {profile.skillsNeeded.map((item) => (
                <Typography key={item.skill} variant="body1">{`${item.skill}: ${needDescriptions[item.skill]}`}</Typography>
              ))}
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default ProfilePage;
