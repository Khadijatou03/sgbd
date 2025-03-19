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
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const JobStatusChip = ({ status }) => {
  const getColor = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'disabled':
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

const CronJobs = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    schedule: '',
    command: '',
    enabled: true,
    retryCount: 3,
    timeout: 300,
    emailNotification: false
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/admin/cron-jobs');
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      showError('Erreur lors du chargement des tâches planifiées');
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    try {
      await axios.post('/api/admin/cron-jobs', newJob);
      showSuccess('Tâche créée avec succès');
      setCreateDialogOpen(false);
      fetchJobs();
    } catch (error) {
      showError('Erreur lors de la création de la tâche');
    }
  };

  const handleUpdateJob = async () => {
    try {
      await axios.put(`/api/admin/cron-jobs/${selectedJob.id}`, selectedJob);
      showSuccess('Tâche mise à jour avec succès');
      setEditDialogOpen(false);
      fetchJobs();
    } catch (error) {
      showError('Erreur lors de la mise à jour de la tâche');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/cron-jobs/${selectedJob.id}`);
      showSuccess('Tâche supprimée avec succès');
      setDeleteDialogOpen(false);
      fetchJobs();
    } catch (error) {
      showError('Erreur lors de la suppression de la tâche');
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      await axios.put(`/api/admin/cron-jobs/${job.id}/toggle-status`);
      showSuccess(`Tâche ${job.enabled ? 'désactivée' : 'activée'} avec succès`);
      fetchJobs();
    } catch (error) {
      showError('Erreur lors du changement de statut de la tâche');
    }
  };

  const handleRunNow = async (job) => {
    try {
      await axios.post(`/api/admin/cron-jobs/${job.id}/run`);
      showSuccess('Tâche exécutée avec succès');
      fetchJobs();
    } catch (error) {
      showError('Erreur lors de l\'exécution de la tâche');
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
          Tâches planifiées
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchJobs}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Nouvelle tâche
          </Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Planification</TableCell>
                <TableCell>Dernière exécution</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.name}</TableCell>
                  <TableCell>{job.description}</TableCell>
                  <TableCell>{job.schedule}</TableCell>
                  <TableCell>
                    {job.lastRun ? new Date(job.lastRun).toLocaleString('fr-FR') : '-'}
                  </TableCell>
                  <TableCell>
                    <JobStatusChip status={job.enabled ? 'active' : 'disabled'} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Exécuter maintenant">
                      <IconButton
                        onClick={() => handleRunNow(job)}
                        color="primary"
                        disabled={!job.enabled}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        onClick={() => {
                          setSelectedJob(job);
                          setEditDialogOpen(true);
                        }}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={job.enabled ? 'Désactiver' : 'Activer'}>
                      <IconButton
                        onClick={() => handleToggleStatus(job)}
                        color={job.enabled ? 'warning' : 'success'}
                      >
                        {job.enabled ? <StopIcon /> : <PlayIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        onClick={() => {
                          setSelectedJob(job);
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

      {/* Dialog de création de tâche */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nouvelle tâche planifiée</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nom"
              value={newJob.name}
              onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
            />

            <TextField
              fullWidth
              label="Planification (Cron)"
              value={newJob.schedule}
              onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
              helperText="Format: * * * * * (minute heure jour mois jour_semaine)"
            />

            <TextField
              fullWidth
              label="Commande"
              value={newJob.command}
              onChange={(e) => setNewJob({ ...newJob, command: e.target.value })}
            />

            <TextField
              fullWidth
              type="number"
              label="Nombre de tentatives"
              value={newJob.retryCount}
              onChange={(e) => setNewJob({ ...newJob, retryCount: parseInt(e.target.value) })}
            />

            <TextField
              fullWidth
              type="number"
              label="Timeout (secondes)"
              value={newJob.timeout}
              onChange={(e) => setNewJob({ ...newJob, timeout: parseInt(e.target.value) })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newJob.emailNotification}
                  onChange={(e) => setNewJob({ ...newJob, emailNotification: e.target.checked })}
                />
              }
              label="Notification par email"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateJob} variant="contained">
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'édition de tâche */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Modifier la tâche</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nom"
              value={selectedJob?.name}
              onChange={(e) => setSelectedJob({ ...selectedJob, name: e.target.value })}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={selectedJob?.description}
              onChange={(e) => setSelectedJob({ ...selectedJob, description: e.target.value })}
            />

            <TextField
              fullWidth
              label="Planification (Cron)"
              value={selectedJob?.schedule}
              onChange={(e) => setSelectedJob({ ...selectedJob, schedule: e.target.value })}
              helperText="Format: * * * * * (minute heure jour mois jour_semaine)"
            />

            <TextField
              fullWidth
              label="Commande"
              value={selectedJob?.command}
              onChange={(e) => setSelectedJob({ ...selectedJob, command: e.target.value })}
            />

            <TextField
              fullWidth
              type="number"
              label="Nombre de tentatives"
              value={selectedJob?.retryCount}
              onChange={(e) => setSelectedJob({ ...selectedJob, retryCount: parseInt(e.target.value) })}
            />

            <TextField
              fullWidth
              type="number"
              label="Timeout (secondes)"
              value={selectedJob?.timeout}
              onChange={(e) => setSelectedJob({ ...selectedJob, timeout: parseInt(e.target.value) })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={selectedJob?.emailNotification}
                  onChange={(e) => setSelectedJob({ ...selectedJob, emailNotification: e.target.checked })}
                />
              }
              label="Notification par email"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleUpdateJob} variant="contained">
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette tâche planifiée ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CronJobs; 