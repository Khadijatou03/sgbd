import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Stack,
  InputAdornment,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Code as CodeIcon,
  Help as HelpIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const SystemSettings = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      maxFileSize: 10,
      allowedFileTypes: '',
      maintenanceMode: false
    },
    security: {
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      requireTwoFactor: false,
      passwordMinLength: 8,
      passwordRequireSpecial: true,
      passwordRequireNumbers: true
    },
    notifications: {
      emailNotifications: true,
      submissionNotifications: true,
      gradeNotifications: true,
      systemNotifications: true,
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPass: ''
    },
    api: {
      apiEnabled: true,
      apiKey: '',
      rateLimit: 100,
      corsEnabled: true,
      allowedOrigins: ''
    }
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/settings');
      setSettings(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put('/api/settings', settings);
      showSuccess('Paramètres sauvegardés avec succès');
    } catch (error) {
      showError('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const handleResetApiKey = () => {
    setConfirmDialog({
      open: true,
      title: 'Réinitialiser la clé API',
      message: 'Êtes-vous sûr de vouloir réinitialiser la clé API ? Cette action ne peut pas être annulée.',
      action: async () => {
        try {
          const response = await axios.post('/api/settings/reset-api-key');
          setSettings(prev => ({
            ...prev,
            api: {
              ...prev.api,
              apiKey: response.data.apiKey
            }
          }));
          showSuccess('Clé API réinitialisée avec succès');
        } catch (error) {
          showError('Erreur lors de la réinitialisation de la clé API');
        }
      }
    });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Paramètres système
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Configuration générale */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Configuration générale"
              avatar={<SettingsIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom du site"
                    value={settings.general.siteName}
                    onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description du site"
                    value={settings.general.siteDescription}
                    onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Taille maximale des fichiers (MB)"
                    value={settings.general.maxFileSize}
                    onChange={(e) => handleChange('general', 'maxFileSize', parseInt(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">MB</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Types de fichiers autorisés"
                    value={settings.general.allowedFileTypes}
                    onChange={(e) => handleChange('general', 'allowedFileTypes', e.target.value)}
                    helperText="Séparés par des virgules (ex: .pdf,.doc,.docx)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => handleChange('general', 'maintenanceMode', e.target.checked)}
                      />
                    }
                    label="Mode maintenance"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sécurité */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Sécurité"
              avatar={<SecurityIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tentatives de connexion maximales"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Délai d'expiration de session (minutes)"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">min</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.requireTwoFactor}
                        onChange={(e) => handleChange('security', 'requireTwoFactor', e.target.checked)}
                      />
                    }
                    label="Authentification à deux facteurs requise"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Longueur minimale du mot de passe"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">caractères</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.passwordRequireSpecial}
                        onChange={(e) => handleChange('security', 'passwordRequireSpecial', e.target.checked)}
                      />
                    }
                    label="Caractères spéciaux requis"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.passwordRequireNumbers}
                        onChange={(e) => handleChange('security', 'passwordRequireNumbers', e.target.checked)}
                      />
                    }
                    label="Chiffres requis"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Notifications"
              avatar={<NotificationsIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                    }
                    label="Activer les notifications par email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.submissionNotifications}
                        onChange={(e) => handleChange('notifications', 'submissionNotifications', e.target.checked)}
                      />
                    }
                    label="Notifications de soumission"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.gradeNotifications}
                        onChange={(e) => handleChange('notifications', 'gradeNotifications', e.target.checked)}
                      />
                    }
                    label="Notifications de notation"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.systemNotifications}
                        onChange={(e) => handleChange('notifications', 'systemNotifications', e.target.checked)}
                      />
                    }
                    label="Notifications système"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Configuration SMTP
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Serveur SMTP"
                    value={settings.notifications.smtpHost}
                    onChange={(e) => handleChange('notifications', 'smtpHost', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Port SMTP"
                    value={settings.notifications.smtpPort}
                    onChange={(e) => handleChange('notifications', 'smtpPort', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Utilisateur SMTP"
                    value={settings.notifications.smtpUser}
                    onChange={(e) => handleChange('notifications', 'smtpUser', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type={showSmtpPass ? 'text' : 'password'}
                    label="Mot de passe SMTP"
                    value={settings.notifications.smtpPass}
                    onChange={(e) => handleChange('notifications', 'smtpPass', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowSmtpPass(!showSmtpPass)}
                            edge="end"
                          >
                            {showSmtpPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* API */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Configuration API"
              avatar={<CodeIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.api.apiEnabled}
                        onChange={(e) => handleChange('api', 'apiEnabled', e.target.checked)}
                      />
                    }
                    label="Activer l'API"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Clé API"
                    value={settings.api.apiKey}
                    type={showApiKey ? 'text' : 'password'}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowApiKey(!showApiKey)}
                            edge="end"
                          >
                            {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleResetApiKey}
                  >
                    Réinitialiser la clé API
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Limite de requêtes par minute"
                    value={settings.api.rateLimit}
                    onChange={(e) => handleChange('api', 'rateLimit', parseInt(e.target.value))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">req/min</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.api.corsEnabled}
                        onChange={(e) => handleChange('api', 'corsEnabled', e.target.checked)}
                      />
                    }
                    label="Activer CORS"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Origines autorisées"
                    value={settings.api.allowedOrigins}
                    onChange={(e) => handleChange('api', 'allowedOrigins', e.target.value)}
                    helperText="Séparées par des virgules (ex: http://localhost:3000,https://example.com)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogue de confirmation */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
            Annuler
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              confirmDialog.action();
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings; 