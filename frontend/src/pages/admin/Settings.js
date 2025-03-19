import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const Settings = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    allowRegistration: true,
    maintenanceMode: false,
    maxFileSize: 10,
    allowedFileTypes: '',
    emailNotifications: true
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings');
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

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put('/api/admin/settings', settings);
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
        Paramètres du système
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
              <TextField
                fullWidth
                label="Nom du site"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description du site"
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Fonctionnalités
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowRegistration}
                    onChange={handleChange}
                    name="allowRegistration"
                  />
                }
                label="Autoriser l'inscription de nouveaux utilisateurs"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    name="maintenanceMode"
                  />
                }
                label="Mode maintenance"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    name="emailNotifications"
                  />
                }
                label="Activer les notifications par email"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Paramètres de fichiers
              </Typography>
              <TextField
                fullWidth
                label="Taille maximale des fichiers (MB)"
                name="maxFileSize"
                value={settings.maxFileSize}
                onChange={handleChange}
                margin="normal"
                type="number"
                required
              />
              <TextField
                fullWidth
                label="Types de fichiers autorisés (séparés par des virgules)"
                name="allowedFileTypes"
                value={settings.allowedFileTypes}
                onChange={handleChange}
                margin="normal"
                helperText="Exemple: .pdf,.doc,.docx"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
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

export default Settings; 