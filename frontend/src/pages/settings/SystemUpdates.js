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
  Button,
  Divider,
  Alert,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  SystemUpdate as SystemUpdateIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  BugReport as BugReportIcon,
  NewReleases as NewReleasesIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const SystemUpdates = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [systemInfo, setSystemInfo] = useState({
    currentVersion: '',
    latestVersion: '',
    updateAvailable: false,
    updateType: '', // 'security', 'feature', 'bugfix'
    updateSize: 0,
    updateNotes: '',
    lastCheck: null,
    updateHistory: [],
    systemRequirements: {
      minVersion: '',
      recommendedVersion: '',
      dependencies: []
    }
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });
  const [expandedHistory, setExpandedHistory] = useState(false);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/system/updates/info');
      setSystemInfo(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des informations de mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckUpdates = async () => {
    try {
      setLoading(true);
      await axios.post('/api/system/updates/check');
      showSuccess('Vérification des mises à jour effectuée');
      fetchSystemInfo();
    } catch (error) {
      showError('Erreur lors de la vérification des mises à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallUpdate = () => {
    setConfirmDialog({
      open: true,
      title: 'Installation de la mise à jour',
      message: `Voulez-vous installer la version ${systemInfo.latestVersion} ? Cette action nécessitera un redémarrage du système.`,
      action: async () => {
        try {
          setUpdateProgress(0);
          await axios.post('/api/system/updates/install', {}, {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUpdateProgress(progress);
            }
          });
          showSuccess('Mise à jour installée avec succès');
          fetchSystemInfo();
        } catch (error) {
          showError('Erreur lors de l\'installation de la mise à jour');
        } finally {
          setUpdateProgress(0);
        }
      }
    });
  };

  const handleRollback = (version) => {
    setConfirmDialog({
      open: true,
      title: 'Retour à une version précédente',
      message: `Êtes-vous sûr de vouloir revenir à la version ${version} ? Cette action nécessitera un redémarrage du système.`,
      action: async () => {
        try {
          await axios.post(`/api/system/updates/rollback/${version}`);
          showSuccess('Retour à la version précédente effectué avec succès');
          fetchSystemInfo();
        } catch (error) {
          showError('Erreur lors du retour à la version précédente');
        }
      }
    });
  };

  const getUpdateTypeIcon = (type) => {
    switch (type) {
      case 'security':
        return <SecurityIcon color="error" />;
      case 'feature':
        return <NewReleasesIcon color="primary" />;
      case 'bugfix':
        return <BugReportIcon color="warning" />;
      default:
        return <InfoIcon />;
    }
  };

  const getUpdateTypeLabel = (type) => {
    switch (type) {
      case 'security':
        return 'Sécurité';
      case 'feature':
        return 'Nouvelle fonctionnalité';
      case 'bugfix':
        return 'Correction de bug';
      default:
        return 'Mise à jour';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          Mises à jour système
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleCheckUpdates}
          disabled={loading}
        >
          Vérifier les mises à jour
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* État actuel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="État actuel"
              avatar={<SystemUpdateIcon />}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Version actuelle
                  </Typography>
                  <Typography variant="h6">
                    {systemInfo.currentVersion}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dernière vérification
                  </Typography>
                  <Typography>
                    {systemInfo.lastCheck ? new Date(systemInfo.lastCheck).toLocaleString() : 'Jamais'}
                  </Typography>
                </Box>
                {systemInfo.updateAvailable && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Une mise à jour est disponible
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Mise à jour disponible */}
        {systemInfo.updateAvailable && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="Mise à jour disponible"
                avatar={getUpdateTypeIcon(systemInfo.updateType)}
                action={
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SystemUpdateIcon />}
                    onClick={handleInstallUpdate}
                    disabled={updateProgress > 0}
                  >
                    Installer
                  </Button>
                }
              />
              <CardContent>
                {updateProgress > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={updateProgress}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" align="center">
                      {updateProgress}%
                    </Typography>
                  </Box>
                )}
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Version
                    </Typography>
                    <Typography variant="h6">
                      {systemInfo.latestVersion}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type de mise à jour
                    </Typography>
                    <Chip
                      icon={getUpdateTypeIcon(systemInfo.updateType)}
                      label={getUpdateTypeLabel(systemInfo.updateType)}
                      color={systemInfo.updateType === 'security' ? 'error' : 'primary'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Taille
                    </Typography>
                    <Typography>
                      {formatBytes(systemInfo.updateSize)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Notes de mise à jour
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        mt: 1,
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}
                    >
                      {systemInfo.updateNotes}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Historique des mises à jour */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Historique des mises à jour"
              avatar={<HistoryIcon />}
              action={
                <IconButton onClick={() => setExpandedHistory(!expandedHistory)}>
                  <ExpandMoreIcon
                    sx={{
                      transform: expandedHistory ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }}
                  />
                </IconButton>
              }
            />
            <CardContent>
              <Collapse in={expandedHistory}>
                <List>
                  {systemInfo.updateHistory.map((update, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleRollback(update.version)}
                        >
                          Restaurer
                        </Button>
                      }
                    >
                      <ListItemIcon>
                        {getUpdateTypeIcon(update.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={`Version ${update.version}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {new Date(update.date).toLocaleString()}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              {update.notes}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Prérequis système */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Prérequis système"
              avatar={<InfoIcon />}
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Version minimale requise
                  </Typography>
                  <Typography>
                    {systemInfo.systemRequirements.minVersion}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Version recommandée
                  </Typography>
                  <Typography>
                    {systemInfo.systemRequirements.recommendedVersion}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Dépendances
                  </Typography>
                  <List dense>
                    {systemInfo.systemRequirements.dependencies.map((dep, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <InfoIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary={dep.name}
                          secondary={dep.version}
                        />
                      </ListItem>
                    ))}
                  </List>
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

export default SystemUpdates; 