import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const BackgroundBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const AuthLayout = () => {
  return (
    <BackgroundBox>
      <Container maxWidth="sm">
        <StyledPaper elevation={3}>
          <Typography
            component="h1"
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 4,
            }}
          >
            DS-SGBD
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Plateforme de gestion et correction automatique d'exercices de bases de données
          </Typography>
          <Outlet />
        </StyledPaper>
      </Container>
    </BackgroundBox>
  );
};

export default AuthLayout; 