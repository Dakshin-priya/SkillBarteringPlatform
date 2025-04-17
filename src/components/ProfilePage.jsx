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
  Chip,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    displayName: '',
    skillsOffered: [],
    skillsNeeded: [],
    points: 0,
  });
  const [offerDescriptions, setOfferDescriptions] = useState({});
  const [needDescriptions, setNeedDescriptions] = useState({});

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
          const migratedSkillsOffered = (data.skillsOffered || []).map(skillObj =>
            typeof skillObj === 'string'
              ? { skill: skillObj, description: '' }
              : skillObj
          );
          const migratedSkillsNeeded = (data.skillsNeeded || []).map(skillObj =>
            typeof skillObj === 'string'
              ? { skill: skillObj, description: '' }
              : skillObj
          );
          setProfile({
            displayName: data.displayName || '',
            skillsOffered: migratedSkillsOffered,
            skillsNeeded: migratedSkillsNeeded,
            points: data.points || 0,
          });

          const offerDesc = {};
          const needDesc = {};
          migratedSkillsOffered.forEach(s => {
            offerDesc[s.skill] = s.description || '';
          });
          migratedSkillsNeeded.forEach(s => {
            needDesc[s.skill] = s.description || '';
          });
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

        {/* Skills Offered */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h6">Skills Offered</Typography>
          <Autocomplete
            multiple
            options={skillOptions}
            value={profile.skillsOffered.map(s => s.skill)}
            onChange={(_, newValue) => updateSkills('skillsOffered', newValue)}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option}
              </li>
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Skills Offered"
                placeholder="Search or select skills"
                fullWidth
              />
            )}
            sx={{ marginTop: 1 }}
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
            />
          ))}
        </Box>

        {/* Skills Needed */}
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h6">Skills Needed</Typography>
          <Autocomplete
            multiple
            options={skillOptions}
            value={profile.skillsNeeded.map(s => s.skill)}
            onChange={(_, newValue) => updateSkills('skillsNeeded', newValue)}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option}
              </li>
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={option} {...getTagProps({ index })} key={option} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Skills Needed"
                placeholder="Search or select skills"
                fullWidth
              />
            )}
            sx={{ marginTop: 1 }}
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
