import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

function MarketplacePage() {
  const { currentUser, userLocation } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(null); // State to control which service's dialog is open
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
                  latitude: data.latitude,
                  longitude: data.longitude,
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
                latitude: data.latitude,
                longitude: data.longitude,
              });
            }
          });
        }
      });

      setServices(serviceList);
    };

    const fetchRecommendations = async () => {
      if (currentUser && userLocation) {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const recommendations = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.uid !== currentUser.uid && data.latitude !== null && data.longitude !== null) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              data.latitude,
              data.longitude
            );
            if (distance <= 50) {
              const offeredSkills = data.skillsOffered || [];
              recommendations.push({
                userId: doc.id,
                userName: data.displayName || 'Unnamed User',
                points: data.points || 0,
                skillOffered: offeredSkills.map(s => s.skill).join(', '),
                offerDescription: offeredSkills.map(s => s.description).join(' | '),
                skillNeeded: (data.skillsNeeded || []).map(s => s.skill).join(', ') || 'Not specified',
                needDescription: (data.skillsNeeded || []).map(s => s.description).join(' | ') || '',
                latitude: data.latitude,
                longitude: data.longitude,
                distance,
              });
            }
          }
        });
        setRecommendedUsers(recommendations.sort((a, b) => a.distance - b.distance));
      }
    };

    fetchServices();
    fetchRecommendations();
  }, [currentUser, userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const filteredServices = services.filter((item) =>
    category ? item.skillOffered === category : true
  );

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const handleOffer = (userId) => {
    navigate(`/swipe?target=${userId}`);
  };

  const handleOpenDialog = (item) => {
    setOpenDialog(item);
  };

  const handleCloseDialog = () => {
    setOpenDialog(null);
  };

  if (!currentUser) return <Typography variant="h6" align="center">Please log in</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: '2rem auto', padding: '2rem' }}>
      <Paper sx={{ padding: '2rem', borderRadius: 2, boxShadow: 3 }}>
        {recommendedUsers.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              <FaMapMarkerAlt /> Nearby Recommendations
            </Typography>
            {recommendedUsers.map((item, idx) => (
              <Paper
                key={idx}
                sx={{ marginBottom: 2, padding: 2, borderRadius: 2, boxShadow: 2 }}
                onClick={() => toggleAccordion(`rec-${idx}`)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <Typography variant="h6" color="primary">
                    {item.skillOffered}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ marginRight: 1 }}>
                      by {item.userName}
                    </Typography>
                    {openIndex === `rec-${idx}` ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </Box>

                <Collapse in={openIndex === `rec-${idx}`}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button variant="contained" onClick={() => handleOpenDialog(item)}>
                      More
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => handleOffer(item.userId)}>
                      Offer Barter
                    </Button>
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>Location:</strong> {item.latitude}, {item.longitude}
                  </Typography>
                </Collapse>
              </Paper>
            ))}
          </Box>
        )}

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
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button variant="contained" onClick={() => handleOpenDialog(item)}>
                  More
                </Button>
                <Button variant="contained" color="primary" onClick={() => handleOffer(item.userId)}>
                  Offer Barter
                </Button>
              </Box>
              <Typography variant="body2" gutterBottom>
                <strong>Location:</strong> {item.latitude}, {item.longitude}
              </Typography>
            </Collapse>
          </Paper>
        ))}
      </Paper>

      <Dialog open={openDialog !== null} onClose={handleCloseDialog}>
        {openDialog && (
          <>
            <DialogTitle>
              {openDialog.skillOffered.split(', ').map((skill, index) => (
                <span key={index}>
                  {skill}
                  {index < openDialog.skillOffered.split(', ').length - 1 && <br />}
                </span>
              ))} by {openDialog.userName}
            </DialogTitle>
            <DialogContent>
              {openDialog.offerDescription && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <ul>
                    {openDialog.offerDescription.split(' | ').map((desc, index) => (
                      <li key={index}>
                        <strong>
                          {openDialog.skillOffered.split(', ')[index] || 'N/A'}: {desc.trim()}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Looking for
                </Typography>
                <ul>
                  {openDialog.needDescription
                    ? openDialog.needDescription.split(' | ').map((needDesc, index) => (
                        <li key={index}>
                          <strong>
                            {openDialog.skillNeeded.split(', ')[index] || 'N/A'}: {needDesc.trim()}
                          </strong>
                        </li>
                      ))
                    : <li><strong>{openDialog.skillNeeded}</strong></li>
                  }
                </ul>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>Points:</strong> {openDialog.points}
              </Typography>
              <Typography variant="body2">
                <strong>Location:</strong> {openDialog.latitude}, {openDialog.longitude}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default MarketplacePage;