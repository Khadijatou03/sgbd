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
  TextField,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Backup as BackupIcon,
  Storage as StorageIcon,
  Cleanup as CleanupIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const SystemMaintenance = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [backupProgress, setBackupProgress] = useState(0);
  const [systemStatus, setSystemStatus] = useState({
    diskSpace: {
      total: 0,
      used: 0,
      free: 0
    },
    databaseSize: 0,
    tempFiles: 0,
    lastBackup: null,
    backupSchedule: {
      enabled: false,
      frequency: 'daily',
      time: '00:00'
    }
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null
  });

  useEffect(() => {
    fetchSystemStatus();
    // Mettre à jour le statut toutes les 30 secondes
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/system/status');
      setSystemStatus(response.data);
    } catch (error) {
      showError('Erreur lors du chargement du statut système');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setBackupProgress(0);
      const response = await axios.post('/api/system/backup', {}, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setBackupProgress(progress);
        }
      });
      showSuccess('Sauvegarde créée avec succès');
      fetchSystemStatus();
    } catch (error) {
      showError('Erreur lors de la création de la sauvegarde');
    } finally {
      setBackupProgress(0);
    }
  };

  const handleCleanup = () => {
    setConfirmDialog({
      open: true,
      title: 'Nettoyage du système',
      message: 'Êtes-vous sûr de vouloir nettoyer les fichiers temporaires ? Cette action ne peut pas être annulée.',
      action: async () => {
        try {
          await axios.post('/api/system/cleanup');
          showSuccess('Nettoyage effectué avec succès');
          fetchSystemStatus();
        } catch (error) {
          showError('Erreur lors du nettoyage');
        }
      }
    });
  };

  const handleDownloadBackup = async (backupId) => {
    try {
      const response = await axios.get(`/api/system/backup/${backupId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${backupId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError('Erreur lors du téléchargement de la sauvegarde');
    }
  };

  const handleDeleteBackup = (backupId) => {
    setConfirmDialog({
      open: true,
      title: 'Supprimer la sauvegarde',
      message: 'Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action ne peut pas être annulée.',
      action: async () => {
        try {
          await axios.delete(`/api/system/backup/${backupId}`);
          showSuccess('Sauvegarde supprimée avec succès');
          fetchSystemStatus();
        } catch (error) {
          showError('Erreur lors de la suppression de la sauvegarde');
        }
      }
    });
  };

  const handleUpdateBackupSchedule = async (enabled, frequency, time) => {
    try {
      await axios.put('/api/system/backup-schedule', {
        enabled,
        frequency,
        time
      });
      showSuccess('Planification de sauvegarde mise à jour');
      fetchSystemStatus();
    } catch (error) {
      showError('Erreur lors de la mise à jour de la planification');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
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
      <Typography variant="h4" gutterBottom>
        Maintenance système
      </Typography>

      <Grid container spacing={3}>
        {/* État du système */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="État du système"
              avatar={<StorageIcon />}
            />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Espace disque
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(systemStatus.diskSpace.used / systemStatus.diskSpace.total) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatBytes(systemStatus.diskSpace.used)} / {formatBytes(systemStatus.diskSpace.total)}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Taille de la base de données
                  </Typography>
                  <Typography>
                    {formatBytes(systemStatus.databaseSize)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fichiers temporaires
                  </Typography>
                  <Typography>
                    {formatBytes(systemStatus.tempFiles)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sauvegardes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Sauvegardes"
              avatar={<BackupIcon />}
              action={
                <Button
                  variant="contained"
                  startIcon={<BackupIcon />}
                  onClick={handleBackup}
                  disabled={backupProgress > 0}
                >
                  Nouvelle sauvegarde
                </Button>
              }
            />
            <CardContent>
              {backupProgress > 0 && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={backupProgress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" align="center">
                    {backupProgress}%
                  </Typography>
                </Box>
              )}
              <List>
                {systemStatus.lastBackup && (
                  <ListItem
                    secondaryAction={
                      <Box>
                        <Tooltip title="Télécharger">
                          <IconButton
                            edge="end"
                            onClick={() => handleDownloadBackup(systemStatus.lastBackup.id)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteBackup(systemStatus.lastBackup.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  >
                    <ListItemIcon>
                      <BackupIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dernière sauvegarde"
                      secondary={new Date(systemStatus.lastBackup.date).toLocaleString()}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Planification des sauvegardes */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Planification des sauvegardes"
              avatar={<BackupIcon />}
            />
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemStatus.backupSchedule.enabled}
                        onChange={(e) => handleUpdateBackupSchedule(
                          e.target.checked,
                          systemStatus.backupSchedule.frequency,
                          systemStatus.backupSchedule.time
                        )}
                      />
                    }
                    label="Activer la sauvegarde automatique"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Fréquence"
                    value={systemStatus.backupSchedule.frequency}
                    onChange={(e) => handleUpdateBackupSchedule(
                      systemStatus.backupSchedule.enabled,
                      e.target.value,
                      systemStatus.backupSchedule.time
                    )}
                    disabled={!systemStatus.backupSchedule.enabled}
                  >
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Heure"
                    value={systemStatus.backupSchedule.time}
                    onChange={(e) => handleUpdateBackupSchedule(
                      systemStatus.backupSchedule.enabled,
                      systemStatus.backupSchedule.frequency,
                      e.target.value
                    )}
                    disabled={!systemStatus.backupSchedule.enabled}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Nettoyage */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Nettoyage"
              avatar={<CleanupIcon />}
              action={
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<CleanupIcon />}
                  onClick={handleCleanup}
                >
                  Nettoyer
                </Button>
              }
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                Cette action supprimera tous les fichiers temporaires et les anciens logs.
                Assurez-vous d'avoir effectué une sauvegarde avant de procéder.
              </Typography>
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

export default SystemMaintenance; 