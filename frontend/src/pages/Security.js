import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useSnackbar } from '../contexts/SnackbarContext';
import axios from 'axios';

const Security = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      showError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      await axios.put('/api/security/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      showSuccess('Mot de passe mis à jour avec succès');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showError('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Sécurité
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mot de passe actuel"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmer le nouveau mot de passe"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  Mettre à jour le mot de passe
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Security; 