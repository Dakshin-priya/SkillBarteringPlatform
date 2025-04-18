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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';

function MatchesPage() {
  const { currentUser } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const fetchMatches = async () => {
        const querySnapshot = await getDocs(collection(db, 'matches'));
        const matchList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.user1 === currentUser.uid || data.user2 === currentUser.uid) {
            matchList.push({ id: doc.id, ...data });
          }
        });
        setMatches(matchList);
      };
      fetchMatches();
    }
  }, [currentUser]);

  const handleAccept = async (matchId) => {
    await updateDoc(doc(db, 'matches', matchId), { status: 'accepted' });
    setMatches(matches.map((m) => (m.id === matchId ? { ...m, status: 'accepted' } : m)));
  };

  const handleComplete = async (matchId) => {
    await updateDoc(doc(db, 'matches', matchId), { status: 'completed' });
    const userDoc = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userDoc);
    await setDoc(userDoc, {
      ...userSnap.data(),
      points: (userSnap.data().points || 0) + 10,
    });
    setMatches(matches.map((m) => (m.id === matchId ? { ...m, status: 'completed' } : m)));
  };

  if (!currentUser) return <Typography variant="h6" align="center">Please log in</Typography>;

  const getStatusChip = (status) => {
    const colorMap = {
      pending: 'default',
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

  return (
    <Box sx={{ maxWidth: 800, margin: '2rem auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Your Matches
      </Typography>

      <Stack spacing={3}>
        {matches.map((match) => {
          const otherUserId = match.user1 === currentUser.uid ? match.user2 : match.user1;

          return (
            <Paper
              key={match.id}
              elevation={4}
              sx={{
                p: 3,
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.01)',
                  boxShadow: 6,
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    Match with: <strong>{otherUserId}</strong>
                  </Typography>
                  {getStatusChip(match.status)}
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={2}>
                {match.status === 'pending' && (
                  <Button
                    onClick={() => handleAccept(match.id)}
                    variant="contained"
                    color="primary"
                  >
                    Accept
                  </Button>
                )}

                {match.status === 'accepted' && (
                  <>
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
                      variant="outlined"
                      color="primary"
                      startIcon={<ChatIcon />}
                    >
                      Chat
                    </Button>
                  </>
                )}

                {match.status === 'completed' && (
                  <Typography variant="body2" color="text.secondary">
                    Trade Completed
                  </Typography>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}

export default MatchesPage;
