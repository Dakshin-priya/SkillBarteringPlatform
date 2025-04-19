import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Handshake } from 'lucide-react';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  useTheme
} from '@mui/material';

function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <Users size={32} color={theme.palette.primary.main} />,
      title: 'Browse Services',
      description: 'Explore a wide range of skills you can exchange for your own.'
    },
    {
      icon: <Briefcase size={32} color={theme.palette.primary.main} />,
      title: 'Offer Skills',
      description: 'List your skills and let others know what you can provide.'
    },
    {
      icon: <Handshake size={32} color={theme.palette.primary.main} />,
      title: 'Match & Trade',
      description: 'Connect with users and make fair exchanges to grow together.'
    },
    {
      icon: <Users size={32} color={theme.palette.primary.main} />,
      title: 'Build Your Network',
      description: 'Connect with like-minded individuals to collaborate and grow your skills together.'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #b2f5ea, #ffffff)',
        color: 'text.primary'
      }}
    >
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 10,
          textAlign: 'center',
          boxShadow: 3
        }}
      >
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Skill Barter
        </Typography>
        <Typography variant="h6" gutterBottom>
          Exchange skills. Grow together.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{
            mt: 4,
            backgroundColor: 'white',
            color: 'primary.main',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#f0f0f0'
            }
          }}
        >
          Get Started
        </Button>
      </Box>

      <Container sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Explore the Marketplace
        </Typography>

        <Grid container spacing={4} mt={2}>
          {features.map((feature, index) => (
            <Grid
              item
              xs={12}  // 1 card per row on small screens
              sm={6}   // 2 cards per row on small and above
              md={6}   // 2 cards per row on medium and above
              lg={6}   // 2 cards per row on large and above
              xl={6}   // 2 cards per row on extra-large and above
              key={index}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',  // Ensures equal height
                    justifyContent: 'space-between',
                    p: 4,
                    borderRadius: 4,
                    transition: '0.3s',
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" mb={2} gap={2}>
                    {feature.icon}
                    <Typography variant="h6" fontWeight="medium">
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">{feature.description}</Typography>
                </Paper>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
