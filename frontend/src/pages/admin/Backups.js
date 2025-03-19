import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const BackupStatusChip = ({ status }) => {
  const getColor = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status}
      color={getColor()}
      size="small"
    />
  );
};

const Backups = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [newBackup, setNewBackup] = useState({
    type: 'full',
    description: '',
    includeFiles: true
  });

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await axios.get('/api/admin/backups');
      setBackups(response.data);
      setLoading(false);
    } catch (error) {
      showError('Erreur lors du chargement des sauvegardes');
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      await axios.post('/api/admin/backups', newBackup);
      showSuccess('Sauvegarde créée avec succès');
      setCreateDialogOpen(false);
      fetchBackups();
    } catch (error) {
      showError('Erreur lors de la création de la sauvegarde');
    }
  };

  const handleRestore = async () => {
    try {
      await axios.post(`/api/admin/backups/${selectedBackup.id}/restore`);
      showSuccess('Restauration lancée avec succès');
      setRestoreDialogOpen(false);
      fetchBackups();
    } catch (error) {
      showError('Erreur lors de la restauration');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/backups/${selectedBackup.id}`);
      showSuccess('Sauvegarde supprimée avec succès');
      setDeleteDialogOpen(false);
      fetchBackups();
    } catch (error) {
      showError('Erreur lors de la suppression de la sauvegarde');
    }
  };

  const handleDownload = async (backup) => {
    try {
      const response = await axios.get(`/api/admin/backups/${backup.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${backup.id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError('Erreur lors du téléchargement de la sauvegarde');
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
          Sauvegardes système
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBackups}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Nouvelle sauvegarde
          </Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Taille</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    {new Date(backup.created_at).toLocaleString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {backup.type === 'full' ? <StorageIcon /> : <FolderIcon />}
                      {backup.type === 'full' ? 'Complète' : 'Partielle'}
                    </Box>
                  </TableCell>
                  <TableCell>{backup.description}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>
                    <BackupStatusChip status={backup.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Télécharger">
                      <IconButton
                        onClick={() => handleDownload(backup)}
                        color="primary"
                        disabled={backup.status !== 'completed'}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Restaurer">
                      <IconButton
                        onClick={() => {
                          setSelectedBackup(backup);
                          setRestoreDialogOpen(true);
                        }}
                        color="primary"
                        disabled={backup.status !== 'completed'}
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        onClick={() => {
                          setSelectedBackup(backup);
                          setDeleteDialogOpen(true);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogs */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Nouvelle sauvegarde</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type de sauvegarde</InputLabel>
              <Select
                value={newBackup.type}
                label="Type de sauvegarde"
                onChange={(e) => setNewBackup({ ...newBackup, type: e.target.value })}
              >
                <MenuItem value="full">Complète</MenuItem>
                <MenuItem value="partial">Partielle</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              value={newBackup.description}
              onChange={(e) => setNewBackup({ ...newBackup, description: e.target.value })}
              multiline
              rows={2}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newBackup.includeFiles}
                  onChange={(e) => setNewBackup({ ...newBackup, includeFiles: e.target.checked })}
                />
              }
              label="Inclure les fichiers"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateBackup} variant="contained">
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>Restaurer la sauvegarde</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleRestore} variant="contained" color="warning">
            Restaurer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Supprimer la sauvegarde</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette sauvegarde ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Backups; 