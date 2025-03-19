import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme
} from '@mui/material';
import {
  Person as StudentIcon,
  School as ProfessorIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Étudiant',
      description: 'Accédez aux exercices, soumettez vos solutions et suivez votre progression',
      icon: <StudentIcon sx={{ fontSize: 80, color: '#2196f3' }} />,
      registerButton: true,
      loginPath: '/login?role=student',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)'
    },
    {
      title: 'Professeur',
      description: 'Gérez les exercices, évaluez les soumissions et suivez la progression des étudiants',
      icon: <ProfessorIcon sx={{ fontSize: 80, color: '#4caf50' }} />,
      loginPath: '/login?role=professor',
      gradient: 'linear-gradient(135deg, #388e3c 0%, #81c784 100%)'
    },
    {
      title: 'Administrateur',
      description: 'Gérez les utilisateurs, les rôles et la configuration de la plateforme',
      icon: <AdminIcon sx={{ fontSize: 80, color: '#ff9800' }} />,
      loginPath: '/login?role=admin',
      gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)'
    }
  ];

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              textShadow: '0 0 40px rgba(33, 150, 243, 0.3)'
            }}
          >
            Plateforme d'Exercices SGBD
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Une plateforme dédiée à l'apprentissage et à l'évaluation des exercices de base de données
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {roles.map((role, index) => (
            <Grid item xs={12} sm={6} md={4} key={role.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: role.gradient,
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  transform: 'translateY(0)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
                    '& .card-content': {
                      transform: 'translateY(-5px)'
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                  },
                  '&:hover::before': {
                    opacity: 1
                  }
                }}
              >
                <CardContent 
                  className="card-content"
                  sx={{ 
                    flexGrow: 1, 
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    py: 4
                  }}
                >
                  <Box 
                    sx={{ 
                      mb: 3,
                      transform: 'scale(1)',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    {role.icon}
                  </Box>
                  <Typography 
                    variant="h4" 
                    component="h3" 
                    gutterBottom
                    sx={{ 
                      color: 'white',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    {role.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '1.1rem',
                      lineHeight: 1.6
                    }}
                  >
                    {role.description}
                  </Typography>
                </CardContent>
                <CardActions 
                  sx={{ 
                    justifyContent: 'center', 
                    pb: 4,
                    gap: 2
                  }}
                >
                  {role.registerButton && (
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/register')}
                      sx={{
                        color: 'white',
                        borderColor: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      S'inscrire
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    onClick={() => navigate(role.loginPath)}
                    sx={{
                      backgroundColor: 'white',
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    Se connecter
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 