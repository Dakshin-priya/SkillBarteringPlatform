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
  List, 
  ListItem,
  Autocomplete,
  Checkbox,
  TextField as MuiTextField,
  Chip
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    displayName: '',
    skillsOffered: [], // Array of skill names
    skillsNeeded: [],  // Array of skill names
    points: 0,
  });
  const [offerDescriptions, setOfferDescriptions] = useState({});
  const [needDescriptions, setNeedDescriptions] = useState({});

  // Predefined set of skills
  const skillOptions = [
    'Graphic Design',
    'Web Development',
    'Writing',
    'Photography',
    'Video Editing',
    'Music Production',
    'Cooking',
    'Tutoring (Math)',
    'Tutoring (Language)',
    'Fitness Training',
    'Gardening',
    'Carpentry',
    'Plumbing',
    'Electrical Work',
    'Sewing',
    'Painting',
    'Yoga Instruction',
    'Digital Marketing',
  ];

  useEffect(() => {
    if (currentUser) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            displayName: data.displayName || '',
            skillsOffered: data.skillsOffered.map(s => s.skill).filter(s => s) || [],
            skillsNeeded: data.skillsNeeded.map(s => s.skill).filter(s => s) || [],
            points: data.points || 0,
          });
          // Initialize descriptions
          const offerDesc = {};
          const needDesc = {};
          data.skillsOffered.forEach(s => { offerDesc[s.skill] = s.description || ''; });
          data.skillsNeeded.forEach(s => { needDesc[s.skill] = s.description || ''; });
          setOfferDescriptions(offerDesc);
          setNeedDescriptions(needDesc);
        } else {
          await setDoc(doc(db, 'users', currentUser.uid), {
            displayName: '',
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
      const validSkillsOffered = profile.skillsOffered.filter(skill => skill && skillOptions.includes(skill));
      const validSkillsNeeded = profile.skillsNeeded.filter(skill => skill && skillOptions.includes(skill));
      const updatedProfile = {
        ...profile,
        displayName: profile.displayName || currentUser.displayName,
        skillsOffered: validSkillsOffered.map(skill => ({ skill, description: offerDescriptions[skill] || '' })),
        skillsNeeded: validSkillsNeeded.map(skill => ({ skill, description: needDescriptions[skill] || '' })),
      };
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      alert('Profile updated!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert(error.message);
    }
  };

  const handleAddSkills = (type, newSkills) => {
    const validNewSkills = newSkills.filter(s => s && skillOptions.includes(s));
    setProfile(prev => ({
      ...prev,
      [type]: [...new Set([...prev[type], ...validNewSkills])], // Ensure no duplicates
    }));
  };

  const handleDescriptionChange = (type, skill, value) => {
    if (type === 'skillsOffered') {
      setOfferDescriptions(prev => ({ ...prev, [skill]: value }));
    } else {
      setNeedDescriptions(prev => ({ ...prev, [skill]: value }));
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
              <ListItem key={idx}>
                {skill} - <i>{offerDescriptions[skill] || 'No description'}</i>
              </ListItem>
            ))}
          </List>
          <Autocomplete
            multiple
            options={skillOptions}
            value={profile.skillsOffered.filter(s => s && skillOptions.includes(s))}
            onChange={(_, newValue) => handleAddSkills('skillsOffered', newValue)}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                />
                {option}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Skills Offered"
                variant="outlined"
                placeholder="Search or select skills"
                fullWidth
              />
            )}
            sx={{ marginTop: 1 }}
          />
          {profile.skillsOffered.filter(s => s && skillOptions.includes(s)).map((skill) => (
            <TextField
              key={skill}
              label={`Description for ${skill}`}
              value={offerDescriptions[skill] || ''}
              onChange={(e) => handleDescriptionChange('skillsOffered', skill, e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
            />
          ))}
        </Box>

        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h6">Skills Needed</Typography>
          <List>
            {profile.skillsNeeded.map((skill, idx) => (
              <ListItem key={idx}>
                {skill} - <i>{needDescriptions[skill] || 'No description'}</i>
              </ListItem>
            ))}
          </List>
          <Autocomplete
            multiple
            options={skillOptions}
            value={profile.skillsNeeded.filter(s => s && skillOptions.includes(s))}
            onChange={(_, newValue) => handleAddSkills('skillsNeeded', newValue)}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                />
                {option}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Skills Needed"
                variant="outlined"
                placeholder="Search or select skills"
                fullWidth
              />
            )}
            sx={{ marginTop: 1 }}
          />
          {profile.skillsNeeded.filter(s => s && skillOptions.includes(s)).map((skill) => (
            <TextField
              key={skill}
              label={`Description for ${skill}`}
              value={needDescriptions[skill] || ''}
              onChange={(e) => handleDescriptionChange('skillsNeeded', skill, e.target.value)}
              variant="outlined"
              fullWidth
              margin="normal"
            />
          ))}
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