import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const Security = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    // Authentification
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    passwordExpiryDays: 90,
    preventPasswordReuse: true,
    twoFactorAuth: false,
    twoFactorAuthMethods: ['email', 'sms'],
    
    // Session
    sessionTimeout: 30,
    concurrentSessions: 1,
    rememberMe: true,
    secureCookies: true,
    httpOnlyCookies: true,
    
    // IP et accès
    allowedIPs: [],
    blockedIPs: [],
    geoRestrictions: false,
    allowedCountries: [],
    
    // Journalisation
    logLoginAttempts: true,
    logSecurityEvents: true,
    logRetentionDays: 90,
    
    // Protection contre les attaques
    rateLimiting: true,
    rateLimitRequests: 100,
    rateLimitWindow: 15,
    xssProtection: true,
    csrfProtection: true,
    sqlInjectionProtection: true,
    
    // Notifications
    notifyLoginAttempts: true,
    notifySecurityEvents: true,
    notifyAdmins: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [ipDialogOpen, setIpDialogOpen] = useState(false);
  const [ipType, setIpType] = useState('allowed'); // 'allowed' ou 'blocked'
  const [newIP, setNewIP] = useState('');
  const [countries, setCountries] = useState([]);

  const fetchSecuritySettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/security-settings');
      setSecuritySettings(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des paramètres de sécurité');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchCountries = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/countries');
      setCountries(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des pays');
    }
  }, [showError]);

  useEffect(() => {
    fetchSecuritySettings();
    fetchCountries();
  }, [fetchSecuritySettings, fetchCountries]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/admin/security-settings', securitySettings);
      showSuccess('Paramètres de sécurité mis à jour avec succès');
    } catch (error) {
      showError('Erreur lors de la mise à jour des paramètres de sécurité');
    }
    setSaving(false);
  };

  const handleAddIP = () => {
    if (ipType === 'allowed') {
      setSecuritySettings({
        ...securitySettings,
        allowedIPs: [...securitySettings.allowedIPs, newIP]
      });
    } else {
      setSecuritySettings({
        ...securitySettings,
        blockedIPs: [...securitySettings.blockedIPs, newIP]
      });
    }
    setNewIP('');
    setIpDialogOpen(false);
  };

  const handleRemoveIP = (ip, type) => {
    if (type === 'allowed') {
      setSecuritySettings({
        ...securitySettings,
        allowedIPs: securitySettings.allowedIPs.filter(i => i !== ip)
      });
    } else {
      setSecuritySettings({
        ...securitySettings,
        blockedIPs: securitySettings.blockedIPs.filter(i => i !== ip)
      });
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Paramètres de sécurité
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSecuritySettings}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Authentification */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <LockIcon sx={{ mr: 1 }} />
              Authentification
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Tentatives de connexion maximales"
                  secondary="Nombre de tentatives avant verrouillage"
                />
                <ListItemSecondaryAction>
                  <TextField
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      maxLoginAttempts: parseInt(e.target.value)
                    })}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Durée de verrouillage (minutes)"
                  secondary="Temps de verrouillage après trop de tentatives"
                />
                <ListItemSecondaryAction>
                  <TextField
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      lockoutDuration: parseInt(e.target.value)
                    })}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Longueur minimale du mot de passe"
                  secondary="Nombre minimum de caractères requis"
                />
                <ListItemSecondaryAction>
                  <TextField
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      passwordMinLength: parseInt(e.target.value)
                    })}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Exigences du mot de passe"
                  secondary="Caractéristiques requises pour les mots de passe"
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.requireSpecialChars}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            requireSpecialChars: e.target.checked
                          })}
                        />
                      }
                      label="Caractères spéciaux"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.requireNumbers}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            requireNumbers: e.target.checked
                          })}
                        />
                      }
                      label="Chiffres"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.requireUppercase}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            requireUppercase: e.target.checked
                          })}
                        />
                      }
                      label="Majuscules"
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Expiration du mot de passe"
                  secondary="Durée de validité en jours"
                />
                <ListItemSecondaryAction>
                  <TextField
                    type="number"
                    value={securitySettings.passwordExpiryDays}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      passwordExpiryDays: parseInt(e.target.value)
                    })}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Authentification à deux facteurs"
                  secondary="Méthodes d'authentification supplémentaires"
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            twoFactorAuth: e.target.checked
                          })}
                        />
                      }
                      label="Activer 2FA"
                    />
                    {securitySettings.twoFactorAuth && (
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Méthodes</InputLabel>
                        <Select
                          multiple
                          value={securitySettings.twoFactorAuthMethods}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            twoFactorAuthMethods: e.target.value
                          })}
                          label="Méthodes"
                        >
                          <MenuItem value="email">Email</MenuItem>
                          <MenuItem value="sms">SMS</MenuItem>
                          <MenuItem value="authenticator">Application d'authentification</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Session et cookies */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1 }} />
              Session et cookies
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Délai d'expiration de session (minutes)"
                  secondary="Temps d'inactivité avant déconnexion"
                />
                <ListItemSecondaryAction>
                  <TextField
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      sessionTimeout: parseInt(e.target.value)
                    })}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Sessions simultanées"
                  secondary="Nombre de sessions autorisées par utilisateur"
                />
                <ListItemSecondaryAction>
                  <TextField
                    type="number"
                    value={securitySettings.concurrentSessions}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      concurrentSessions: parseInt(e.target.value)
                    })}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Options de sécurité des cookies"
                  secondary="Paramètres de protection des cookies"
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.secureCookies}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            secureCookies: e.target.checked
                          })}
                        />
                      }
                      label="Cookies sécurisés"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.httpOnlyCookies}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            httpOnlyCookies: e.target.checked
                          })}
                        />
                      }
                      label="Cookies HTTP-only"
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* IP et restrictions géographiques */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1 }} />
              IP et restrictions géographiques
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="IPs autorisées"
                  secondary="Liste des adresses IP autorisées"
                />
                <ListItemSecondaryAction>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setIpType('allowed');
                      setIpDialogOpen(true);
                    }}
                  >
                    Ajouter
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              {securitySettings.allowedIPs.map((ip) => (
                <ListItem key={ip}>
                  <ListItemText primary={ip} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveIP(ip, 'allowed')}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              <Divider />
              <ListItem>
                <ListItemText
                  primary="IPs bloquées"
                  secondary="Liste des adresses IP bloquées"
                />
                <ListItemSecondaryAction>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setIpType('blocked');
                      setIpDialogOpen(true);
                    }}
                  >
                    Ajouter
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
              {securitySettings.blockedIPs.map((ip) => (
                <ListItem key={ip}>
                  <ListItemText primary={ip} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveIP(ip, 'blocked')}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Restrictions géographiques"
                  secondary="Limiter l'accès par pays"
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.geoRestrictions}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            geoRestrictions: e.target.checked
                          })}
                        />
                      }
                      label="Activer les restrictions"
                    />
                    {securitySettings.geoRestrictions && (
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Pays autorisés</InputLabel>
                        <Select
                          multiple
                          value={securitySettings.allowedCountries}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            allowedCountries: e.target.value
                          })}
                          label="Pays autorisés"
                        >
                          {countries.map((country) => (
                            <MenuItem key={country.code} value={country.code}>
                              {country.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Protection contre les attaques */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              <SecurityIcon sx={{ mr: 1 }} />
              Protection contre les attaques
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Limitation de débit"
                  secondary="Protection contre les attaques par force brute"
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.rateLimiting}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            rateLimiting: e.target.checked
                          })}
                        />
                      }
                      label="Activer la limitation"
                    />
                    {securitySettings.rateLimiting && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          type="number"
                          label="Requêtes"
                          value={securitySettings.rateLimitRequests}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            rateLimitRequests: parseInt(e.target.value)
                          })}
                          size="small"
                          sx={{ width: 100 }}
                        />
                        <TextField
                          type="number"
                          label="Période (minutes)"
                          value={securitySettings.rateLimitWindow}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            rateLimitWindow: parseInt(e.target.value)
                          })}
                          size="small"
                          sx={{ width: 100 }}
                        />
                      </Box>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Protection XSS"
                  secondary="Protection contre les attaques XSS"
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.xssProtection}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          xssProtection: e.target.checked
                        })}
                      />
                    }
                    label="Activer"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Protection CSRF"
                  secondary="Protection contre les attaques CSRF"
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.csrfProtection}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          csrfProtection: e.target.checked
                        })}
                      />
                    }
                    label="Activer"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Protection SQL Injection"
                  secondary="Protection contre les injections SQL"
                />
                <ListItemSecondaryAction>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.sqlInjectionProtection}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          sqlInjectionProtection: e.target.checked
                        })}
                      />
                    }
                    label="Activer"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog d'ajout d'IP */}
      <Dialog
        open={ipDialogOpen}
        onClose={() => setIpDialogOpen(false)}
      >
        <DialogTitle>
          Ajouter une IP {ipType === 'allowed' ? 'autorisée' : 'bloquée'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Adresse IP"
            value={newIP}
            onChange={(e) => setNewIP(e.target.value)}
            placeholder="Ex: 192.168.1.1"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIpDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleAddIP} variant="contained">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Security; 