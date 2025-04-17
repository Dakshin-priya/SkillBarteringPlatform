import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Collapse,
  Divider,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

function MarketplacePage() {
  const { currentUser } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

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
    const fetchServices = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const serviceList = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.skillsOffered?.length && doc.id !== currentUser?.uid) {
          const offeredSkills = data.skillsOffered;
          const neededSkills = data.skillsNeeded || [];

          offeredSkills.forEach((offered) => {
            if (neededSkills.length > 0) {
              neededSkills.forEach((needed) => {
                serviceList.push({
                  userId: doc.id,
                  userName: data.displayName || 'Unnamed User',
                  points: data.points || 0,
                  skillOffered: offered.skill,
                  offerDescription: offered.description,
                  skillNeeded: needed.skill,
                  needDescription: needed.description,
                });
              });
            } else {
              serviceList.push({
                userId: doc.id,
                userName: data.displayName || 'Unnamed User',
                points: data.points || 0,
                skillOffered: offered.skill,
                offerDescription: offered.description,
                skillNeeded: 'Not specified',
                needDescription: '',
              });
            }
          });
        }
      });

      setServices(serviceList);
    };

    fetchServices();
  }, [currentUser]);

  const filteredServices = services.filter((item) =>
    category ? item.skillOffered === category : true
  );

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleOffer = (userId) => {
    navigate(`/swipe?target=${userId}`);
  };

  if (!currentUser) return <Typography variant="h6" align="center">Please log in</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: '2rem auto', padding: '2rem' }}>
      <Paper sx={{ padding: '2rem', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          🌐 Explore the Skill Marketplace
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, marginBottom: 3 }}>
          <TextField
            fullWidth
            select
            variant="outlined"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {skillOptions.map((skill) => (
              <MenuItem key={skill} value={skill}>
                {skill}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {filteredServices.map((item, idx) => (
          <Paper
            key={idx}
            sx={{ marginBottom: 2, padding: 2, borderRadius: 2, boxShadow: 2 }}
            onClick={() => toggleAccordion(idx)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <Typography variant="h6" color="primary">
                {item.skillOffered}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ marginRight: 1 }}>
                  by {item.userName}
                </Typography>
                {openIndex === idx ? <ExpandLess /> : <ExpandMore />}
              </Box>
            </Box>

            <Collapse in={openIndex === idx}>
              <Divider sx={{ my: 2 }} />
              {item.offerDescription && (
                <Typography variant="body2" gutterBottom>
                  <strong>Description:</strong> {item.offerDescription}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                <strong>Looking for:</strong> {item.skillNeeded}
                {item.needDescription && (
                  <span> ({item.needDescription})</span>
                )}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Points:</strong> {item.points}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => handleOffer(item.userId)}
              >
                Offer Barter
              </Button>
            </Collapse>
          </Paper>
        ))}
      </Paper>
    </Box>
  );
}

export default MarketplacePage;
