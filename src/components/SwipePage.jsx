import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Paper,
  IconButton,
  useTheme,
  Fade,
  Slide,
  Stack,
} from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';

function SwipePage() {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser?.uid) {
          userList.push({ id: doc.id, ...doc.data() });
        }
      });
      setUsers(userList);
    };
    fetchUsers();
  }, [currentUser]);

  const handleSwipe = async (direction) => {
    if (!currentUser || currentIndex >= users.length) return;
    const targetUser = users[currentIndex];
    if (direction === 'right') {
      await setDoc(doc(db, 'matches', `${currentUser.uid}_${targetUser.id}`), {
        user1: currentUser.uid,
        user2: targetUser.id,
        status: 'pending',
      });
    }
    setCurrentIndex(currentIndex + 1);
  };

  if (!currentUser) return <div>Please log in</div>;
  if (currentIndex >= users.length) return <div>No more users to swipe</div>;

  const currentUserProfile = users[currentIndex];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
        Swipe to Match
      </Typography>

      <Paper
        elevation={4}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 4,
          backgroundColor: theme.palette.background.paper,
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)', // Slight scaling effect on hover
            boxShadow: theme.shadows[6],
          },
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight="medium">
              {currentUserProfile?.displayName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Offers: {currentUserProfile?.skillsOffered?.join(', ')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Needs: {currentUserProfile?.skillsNeeded?.join(', ')}
            </Typography>
          </CardContent>

          <CardActions sx={{ justifyContent: 'center', gap: 4 }}>
            {/* Pass Button */}
            <Fade in={true} timeout={300}>
              <Button
                onClick={() => handleSwipe('left')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: theme.palette.error.main,
                  color: 'white',
                  padding: 1.5,
                  '&:hover': {
                    backgroundColor: theme.palette.error.dark,
                  },
                  transition: 'transform 0.2s ease',
                }}
                variant="contained"
              >
                <ThumbDown sx={{ marginRight: 1 }} />
                Pass
              </Button>
            </Fade>

            {/* Like Button */}
            <Fade in={true} timeout={300}>
              <Button
                onClick={() => handleSwipe('right')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: theme.palette.success.main,
                  color: 'white',
                  padding: 1.5,
                  '&:hover': {
                    backgroundColor: theme.palette.success.dark,
                  },
                  transition: 'transform 0.2s ease',
                }}
                variant="contained"
              >
                <ThumbUp sx={{ marginRight: 1 }} />
                Like
              </Button>
            </Fade>
          </CardActions>
        </Card>
      </Paper>
    </Container>
  );
}

export default SwipePage;
