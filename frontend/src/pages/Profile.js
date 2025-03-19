import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress
} from '@mui/material';
import { useSnackbar } from '../contexts/SnackbarContext';
import axios from 'axios';

const Profile = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    institution: '',
    department: ''
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/profile');
      setProfile(response.data);
    } catch (error) {
      showError('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put('/api/profile', profile);
      showSuccess('Profil mis à jour avec succès');
    } catch (error) {
      showError('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Mon Profil
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Institution"
                name="institution"
                value={profile.institution}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Département"
                name="department"
                value={profile.department}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  Enregistrer les modifications
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile; 