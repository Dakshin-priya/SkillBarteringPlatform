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
  useTheme,
} from '@mui/material';

function HomePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <Users size={32} color="#0078D4" />,
      title: 'Browse Services',
      description: 'Explore a wide range of skills you can exchange for your own.',
    },
    {
      icon: <Briefcase size={32} color="#0078D4" />,
      title: 'Offer Skills',
      description: 'List your skills and let others know what you can provide.',
    },
    {
      icon: <Handshake size={32} color="#0078D4" />,
      title: 'Match & Trade',
      description: 'Connect with users and make fair exchanges to grow together.',
    },
    {
      icon: <Users size={32} color="#0078D4" />,
      title: 'Build Your Network',
      description: 'Connect with like-minded individuals to collaborate and grow your skills together.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #b2f5ea, #ffffff)',
        color: 'text.primary',
      }}
    >
      <Box
        sx={{
          backgroundColor: '#0078D4',
          color: 'white',
          py: 10,
          textAlign: 'center',
          boxShadow: 3,
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
            color: '#0078D4',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          }}
        >
          Get Started
        </Button>
      </Box>

      <Container sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          Explore the Marketplace
        </Typography>

        <Grid container spacing={4} mt={2} justifyContent="center">
          {features.map((feature, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={6}
              lg={6}
              xl={6}
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  borderRadius: 12,
                  width: '100%',
                  maxWidth: 400,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transition: '0.3s',
                  '&:hover': {
                    boxShadow: '0 6px 12px rgba(0, 120, 212, 0.2)',
                    transform: 'translateY(-4px)',
                  },
                  backgroundColor: '#FFFFFF',
                }}
              >
                <Box display="flex" alignItems="center" mb={2} gap={2}>
                  {feature.icon}
                  <Typography
                    variant="h6"
                    fontWeight="medium"
                    color="#0078D4"
                  >
                    {feature.title}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="#333333"
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;