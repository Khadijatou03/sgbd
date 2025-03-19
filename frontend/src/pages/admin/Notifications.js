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
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const NotificationTypeChip = ({ type }) => {
  const getColor = () => {
    switch (type.toLowerCase()) {
      case 'email':
        return 'primary';
      case 'in_app':
        return 'secondary';
      case 'both':
        return 'success';
      default:
        return 'default';
    }
  };

  const getIcon = () => {
    switch (type.toLowerCase()) {
      case 'email':
        return <EmailIcon />;
      case 'in_app':
        return <NotificationsIcon />;
      case 'both':
        return <SendIcon />;
      default:
        return null;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={type}
      color={getColor()}
      size="small"
    />
  );
};

const Notifications = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'both',
    priority: 'normal',
    recipients: [],
    scheduledFor: null,
    repeat: false,
    repeatInterval: 'daily'
  });

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/admin/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      showError('Erreur lors du chargement des notifications');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des utilisateurs');
    }
  };

  const handleCreateNotification = async () => {
    try {
      await axios.post('/api/admin/notifications', newNotification);
      showSuccess('Notification créée avec succès');
      setCreateDialogOpen(false);
      fetchNotifications();
    } catch (error) {
      showError('Erreur lors de la création de la notification');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/notifications/${selectedNotification.id}`);
      showSuccess('Notification supprimée avec succès');
      setDeleteDialogOpen(false);
      fetchNotifications();
    } catch (error) {
      showError('Erreur lors de la suppression de la notification');
    }
  };

  const handleSendNow = async (notification) => {
    try {
      await axios.post(`/api/admin/notifications/${notification.id}/send`);
      showSuccess('Notification envoyée avec succès');
      fetchNotifications();
    } catch (error) {
      showError('Erreur lors de l\'envoi de la notification');
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
          Notifications système
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNotifications}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Nouvelle notification
          </Button>
        </Box>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Priorité</TableCell>
                <TableCell>Destinataires</TableCell>
                <TableCell>Date d'envoi</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>
                    <NotificationTypeChip type={notification.type} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notification.priority}
                      color={notification.priority === 'high' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {notification.recipients.length} destinataire(s)
                  </TableCell>
                  <TableCell>
                    {notification.scheduledFor ? new Date(notification.scheduledFor).toLocaleString('fr-FR') : 'Immédiat'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={notification.status}
                      color={notification.status === 'sent' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Envoyer maintenant">
                      <IconButton
                        onClick={() => handleSendNow(notification)}
                        color="primary"
                        disabled={notification.status === 'sent'}
                      >
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        onClick={() => {
                          setSelectedNotification(notification);
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

      {/* Dialog de création de notification */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nouvelle notification</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Titre"
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
            />

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={newNotification.message}
              onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Type de notification</InputLabel>
              <Select
                value={newNotification.type}
                label="Type de notification"
                onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="in_app">Dans l'application</MenuItem>
                <MenuItem value="both">Les deux</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priorité</InputLabel>
              <Select
                value={newNotification.priority}
                label="Priorité"
                onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
              >
                <MenuItem value="low">Basse</MenuItem>
                <MenuItem value="normal">Normale</MenuItem>
                <MenuItem value="high">Haute</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => option.name}
              value={newNotification.recipients}
              onChange={(event, newValue) => {
                setNewNotification({ ...newNotification, recipients: newValue });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destinataires"
                  placeholder="Sélectionner les destinataires"
                />
              )}
            />

            <TextField
              fullWidth
              type="datetime-local"
              label="Date d'envoi"
              value={newNotification.scheduledFor || ''}
              onChange={(e) => setNewNotification({ ...newNotification, scheduledFor: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newNotification.repeat}
                  onChange={(e) => setNewNotification({ ...newNotification, repeat: e.target.checked })}
                />
              }
              label="Répéter la notification"
            />

            {newNotification.repeat && (
              <FormControl fullWidth>
                <InputLabel>Intervalle de répétition</InputLabel>
                <Select
                  value={newNotification.repeatInterval}
                  label="Intervalle de répétition"
                  onChange={(e) => setNewNotification({ ...newNotification, repeatInterval: e.target.value })}
                >
                  <MenuItem value="hourly">Toutes les heures</MenuItem>
                  <MenuItem value="daily">Tous les jours</MenuItem>
                  <MenuItem value="weekly">Toutes les semaines</MenuItem>
                  <MenuItem value="monthly">Tous les mois</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateNotification} variant="contained">
            Créer
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
            Êtes-vous sûr de vouloir supprimer cette notification ?
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

export default Notifications; 