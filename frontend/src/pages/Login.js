import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      const user = response;
      console.log('Utilisateur connecté:', user);

      // Redirection selon le rôle
      switch (user.role) {
        case 'Student':
          navigate('/student/dashboard');
          break;
        case 'Professor':
          navigate('/professor/dashboard');
          break;
        case 'Admin':
          navigate('/admin/dashboard');
          break;
        default:
          console.error('Rôle non reconnu:', user.role);
          enqueueSnackbar('Erreur de redirection : rôle non reconnu', { variant: 'error' });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      enqueueSnackbar(error.message || 'Erreur lors de la connexion', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#f5f5f5',
        py: 12
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#fff',
            borderRadius: 2
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: 'primary.main',
              width: 56,
              height: 56
            }}
          >
            <LockIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ mb: 4, color: 'text.primary', fontWeight: 600 }}>
            Connexion
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                position: 'relative',
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Se connecter'
              )}
            </Button>

            <Button
              fullWidth
              onClick={() => navigate('/register')}
              sx={{ textTransform: 'none', color: 'text.secondary' }}
            >
              Pas encore inscrit ? Créer un compte
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 