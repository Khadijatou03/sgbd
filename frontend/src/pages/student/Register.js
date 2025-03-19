import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from '../../config/axios';

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    matricule: '',
    departement: '',
    classe: '',
    filiere: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const steps = [
    'Informations de connexion',
    'Informations personnelles',
    'Informations académiques'
  ];

  const handleNext = (e) => {
    e.preventDefault();
    
    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        enqueueSnackbar('Veuillez remplir tous les champs', { variant: 'warning' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar('Les mots de passe ne correspondent pas', { variant: 'error' });
        return;
      }
      if (formData.password.length < 6) {
        enqueueSnackbar('Le mot de passe doit contenir au moins 6 caractères', { variant: 'error' });
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.nom || !formData.prenom) {
        enqueueSnackbar('Veuillez remplir tous les champs', { variant: 'warning' });
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.matricule || !formData.departement || !formData.classe || !formData.filiere) {
      enqueueSnackbar('Veuillez remplir tous les champs', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      console.log('Données envoyées:', {
        ...formData,
        role: 'Student'
      });
      
      const response = await axios.post('/api/auth/register', {
        ...formData,
        role: 'Student'
      });
      
      console.log('Réponse du serveur:', response.data);
      enqueueSnackbar('Inscription réussie ! Vous pouvez maintenant vous connecter', { variant: 'success' });
      navigate('/login?role=student');
    } catch (error) {
      console.error('Erreur détaillée:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Réponse du serveur:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Une erreur est survenue lors de l\'inscription';
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 0:
        return <EmailIcon />;
      case 1:
        return <PersonAddIcon />;
      case 2:
        return <SchoolIcon />;
      default:
        return <BadgeIcon />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        py: 12
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            WebkitBackdropFilter: 'blur(10px)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.6s ease-out',
            '@keyframes fadeIn': {
              from: {
                opacity: 0,
                transform: 'translateY(20px)'
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)'
              }
            }
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: 'primary.main',
              width: 56,
              height: 56,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)'
                },
                '70%': {
                  boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)'
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)'
                }
              }
            }}
          >
            <PersonAddIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 4,
              color: 'white',
              fontWeight: 600,
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          >
            Inscription Étudiant
          </Typography>

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              width: '100%',
              mb: 4,
              '& .MuiStepLabel-label': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-active': {
                  color: 'white'
                }
              },
              '& .MuiStepIcon-root': {
                color: 'rgba(255, 255, 255, 0.3)',
                '&.Mui-active': {
                  color: 'primary.main'
                },
                '&.Mui-completed': {
                  color: 'success.main'
                }
              }
            }}
          >
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel StepIconComponent={() => getStepIcon(index)}>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            component="form"
            onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            sx={{
              width: '100%',
              '& .MuiTextField-root': {
                mb: 2
              }
            }}
          >
            {activeStep === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirmer le mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Matricule"
                    value={formData.matricule}
                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Département"
                    value={formData.departement}
                    onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Classe"
                    value={formData.classe}
                    onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Filière"
                    value={formData.filiere}
                    onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.5)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                aria-label="Retour à l'étape précédente"
              >
                Retour
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                aria-label={loading ? "Chargement en cours" : activeStep === steps.length - 1 ? "S'inscrire" : "Passer à l'étape suivante"}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    animation: 'shimmer 2s infinite',
                    '@keyframes shimmer': {
                      '100%': {
                        left: '100%'
                      }
                    }
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} aria-label="Chargement" />
                ) : activeStep === steps.length - 1 ? (
                  'S\'inscrire'
                ) : (
                  'Suivant'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 