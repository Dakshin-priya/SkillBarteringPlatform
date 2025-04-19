import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Avatar,
  Chip,
  Divider,
  Collapse,
  Tabs,
  Tab,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function MatchesPage() {
  const { currentUser } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const fetchMatches = async () => {
        const querySnapshot = await getDocs(collection(db, 'matches'));
        const matchList = [];
        for (const docSnap of querySnapshot.docs) {
          const data = docSnap.data();
          if (data.user1 === currentUser.uid || data.user2 === currentUser.uid) {
            const otherUserId = data.user1 === currentUser.uid ? data.user2 : data.user1;
            const user1Doc = await getDoc(doc(db, 'users', data.user1));
            const user2Doc = await getDoc(doc(db, 'users', data.user2));
            const user1Name = user1Doc.exists() ? user1Doc.data().displayName || data.user1 : data.user1;
            const user2Name = user2Doc.exists() ? user2Doc.data().displayName || data.user2 : data.user2;
            const otherUserName = data.user1 === currentUser.uid ? user2Name : user1Name;
            const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
            const otherUserData = otherUserDoc.exists() ? otherUserDoc.data() : {};
            const skillsOffered = otherUserData.skillsOffered || [];
            const offerDescription = skillsOffered.map(s => s.description).join(' | ') || 'No description available';
            matchList.push({ id: docSnap.id, ...data, otherUserName, otherUserData, offerDescription });
          }
        }
        setMatches(matchList);
      };
      fetchMatches();
    }
  }, [currentUser]);

  const handleAccept = async (matchId) => {
    await updateDoc(doc(db, 'matches', matchId), { status: 'accepted' });
    setMatches(matches.map((m) => (m.id === matchId ? { ...m, status: 'accepted' } : m)));
  };

  const handleReject = async (matchId) => {
    await updateDoc(doc(db, 'matches', matchId), { status: 'rejected' });
    setMatches(matches.map((m) => (m.id === matchId ? { ...m, status: 'rejected' } : m)));
  };

  const handleComplete = async (matchId) => {
    await updateDoc(doc(db, 'matches', matchId), { status: 'completed' });
    const userDoc = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userDoc);
    await setDoc(userDoc, {
      ...userSnap.data(),
      points: (userSnap.data().points || 0) + 10,
    }, { merge: true });
    setMatches(matches.map((m) => (m.id === matchId ? { ...m, status: 'completed' } : m)));
  };

  const getStatusChip = (status) => {
    const colorMap = {
      pending: 'default',
      rejected: 'error',
      accepted: 'primary',
      completed: 'success',
    };
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={colorMap[status] || 'default'}
        size="small"
        variant="outlined"
      />
    );
  };

  const toggleExpand = (matchId) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!currentUser) return <Typography variant="h6" align="center">Please log in</Typography>;

  return (
    <Box sx={{ maxWidth: 800, margin: '2rem auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Your Matches
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="match status tabs">
          <Tab label="Pending" {...a11yProps(0)} />
          <Tab label="Rejected" {...a11yProps(1)} />
          <Tab label="Accepted" {...a11yProps(2)} />
          <Tab label="Completed" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3}>
          {matches
            .filter((match) => match.status === 'pending')
            .map((match) => {
              const otherUserId = match.user1 === currentUser.uid ? match.user2 : match.user1;
              return (
                <Paper
                  key={match.id}
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'scale(1.01)', boxShadow: 6 },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        Match with: <strong>{match.otherUserName}</strong>
                      </Typography>
                      {getStatusChip(match.status)}
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={2}>
                    <Button
                      onClick={() => handleAccept(match.id)}
                      variant="contained"
                      color="success"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleReject(match.id)}
                      variant="contained"
                      color="error"
                    >
                      Reject
                    </Button>
                    <Button
                      component={Link}
                      to={`/chat/${match.id}`}
                      variant="contained"
                      color="primary"
                      startIcon={<ChatIcon />}
                    >
                      Chat
                    </Button>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => toggleExpand(match.id)}
                      endIcon={expandedMatch === match.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      View Details
                    </Button>
                    <Collapse in={expandedMatch === match.id}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Offer Details
                        </Typography>
                        <ul>
                          {match.offerDescription.split(' | ').map((desc, index) => (
                            <li key={index}><strong>{desc.trim()}</strong></li>
                          ))}
                        </ul>
                      </Box>
                    </Collapse>
                  </Box>
                </Paper>
              );
            })}
        </Stack>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3}>
          {matches
            .filter((match) => match.status === 'rejected')
            .map((match) => {
              const otherUserId = match.user1 === currentUser.uid ? match.user2 : match.user1;
              return (
                <Paper
                  key={match.id}
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'scale(1.01)', boxShadow: 6 },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        Match with: <strong>{match.otherUserName}</strong>
                      </Typography>
                      {getStatusChip(match.status)}
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={2}>
                    <Button
                      component={Link}
                      to={`/chat/${match.id}`}
                      variant="contained"
                      color="primary"
                      startIcon={<ChatIcon />}
                    >
                      Chat
                    </Button>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => toggleExpand(match.id)}
                      endIcon={expandedMatch === match.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      View Details
                    </Button>
                    <Collapse in={expandedMatch === match.id}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Offer Details
                        </Typography>
                        <ul>
                          {match.offerDescription.split(' | ').map((desc, index) => (
                            <li key={index}><strong>{desc.trim()}</strong></li>
                          ))}
                        </ul>
                      </Box>
                    </Collapse>
                  </Box>
                </Paper>
              );
            })}
        </Stack>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Stack spacing={3}>
          {matches
            .filter((match) => match.status === 'accepted')
            .map((match) => {
              const otherUserId = match.user1 === currentUser.uid ? match.user2 : match.user1;
              return (
                <Paper
                  key={match.id}
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'scale(1.01)', boxShadow: 6 },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        Match with: <strong>{match.otherUserName}</strong>
                      </Typography>
                      {getStatusChip(match.status)}
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={2}>
                    <Button
                      onClick={() => handleComplete(match.id)}
                      variant="contained"
                      color="success"
                    >
                      Complete Trade
                    </Button>
                    <Button
                      component={Link}
                      to={`/chat/${match.id}`}
                      variant="contained"
                      color="primary"
                      startIcon={<ChatIcon />}
                    >
                      Chat
                    </Button>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => toggleExpand(match.id)}
                      endIcon={expandedMatch === match.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      View Details
                    </Button>
                    <Collapse in={expandedMatch === match.id}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Offer Details
                        </Typography>
                        <ul>
                          {match.offerDescription.split(' | ').map((desc, index) => (
                            <li key={index}><strong>{desc.trim()}</strong></li>
                          ))}
                        </ul>
                      </Box>
                    </Collapse>
                  </Box>
                </Paper>
              );
            })}
        </Stack>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Stack spacing={3}>
          {matches
            .filter((match) => match.status === 'completed')
            .map((match) => {
              const otherUserId = match.user1 === currentUser.uid ? match.user2 : match.user1;
              return (
                <Paper
                  key={match.id}
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'scale(1.01)', boxShadow: 6 },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        Match with: <strong>{match.otherUserName}</strong>
                      </Typography>
                      {getStatusChip(match.status)}
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Trade Completed
                    </Typography>
                    <Button
                      component={Link}
                      to={`/chat/${match.id}`}
                      variant="contained"
                      color="primary"
                      startIcon={<ChatIcon />}
                    >
                      Chat
                    </Button>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => toggleExpand(match.id)}
                      endIcon={expandedMatch === match.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    >
                      View Details
                    </Button>
                    <Collapse in={expandedMatch === match.id}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Offer Details
                        </Typography>
                        <ul>
                          {match.offerDescription.split(' | ').map((desc, index) => (
                            <li key={index}><strong>{desc.trim()}</strong></li>
                          ))}
                        </ul>
                      </Box>
                    </Collapse>
                  </Box>
                </Paper>
              );
            })}
        </Stack>
      </TabPanel>
    </Box>
  );
}

export default MatchesPage;