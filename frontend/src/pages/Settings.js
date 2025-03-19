import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Grid,
  CircularProgress
} from '@mui/material';
import { useSnackbar } from '../contexts/SnackbarContext';
import axios from 'axios';

const Settings = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    darkMode: false,
    language: 'fr',
    accessibility: false
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = async (e) => {
    const { name, checked } = e.target;
    try {
      setLoading(true);
      await axios.put('/api/settings', {
        ...settings,
        [name]: checked
      });
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
      showSuccess('Paramètres mis à jour avec succès');
    } catch (error) {
      showError('Erreur lors de la mise à jour des paramètres');
    } finally {
      setLoading(false);
    }
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
        Paramètres
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  name="emailNotifications"
                  disabled={loading}
                />
              }
              label="Notifications par email"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={handleChange}
                  name="darkMode"
                  disabled={loading}
                />
              }
              label="Mode sombre"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.accessibility}
                  onChange={handleChange}
                  name="accessibility"
                  disabled={loading}
                />
              }
              label="Mode accessibilité"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Settings; 