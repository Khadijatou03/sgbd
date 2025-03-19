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
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const RoleChip = ({ role }) => {
  const getColor = () => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'primary';
      case 'student':
        return 'success';
      default:
        return 'default';
    }
  };

  const getIcon = () => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <AdminIcon />;
      case 'teacher':
        return <PersonIcon />;
      case 'student':
        return <GroupIcon />;
      default:
        return <SecurityIcon />;
    }
  };

  return (
    <Chip
      icon={getIcon()}
      label={role}
      color={getColor()}
      size="small"
    />
  );
};

const Roles = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [],
    isDefault: false
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/admin/roles');
      setRoles(response.data);
      setLoading(false);
    } catch (error) {
      showError('Erreur lors du chargement des rôles');
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get('/api/admin/permissions');
      setPermissions(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des permissions');
    }
  };

  const handleCreateRole = async () => {
    try {
      await axios.post('/api/admin/roles', newRole);
      showSuccess('Rôle créé avec succès');
      setCreateDialogOpen(false);
      fetchRoles();
    } catch (error) {
      showError('Erreur lors de la création du rôle');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await axios.put(`/api/admin/roles/${selectedRole.id}`, selectedRole);
      showSuccess('Rôle mis à jour avec succès');
      setEditDialogOpen(false);
      fetchRoles();
    } catch (error) {
      showError('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/roles/${selectedRole.id}`);
      showSuccess('Rôle supprimé avec succès');
      setDeleteDialogOpen(false);
      fetchRoles();
    } catch (error) {
      showError('Erreur lors de la suppression du rôle');
    }
  };

  const handlePermissionToggle = (permissionId, role) => {
    const updatedPermissions = role.permissions.includes(permissionId)
      ? role.permissions.filter(id => id !== permissionId)
      : [...role.permissions, permissionId];
    
    setSelectedRole({ ...role, permissions: updatedPermissions });
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
          Rôles et permissions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRoles}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Nouveau rôle
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Rôles
            </Typography>
            <List>
              {roles.map((role) => (
                <React.Fragment key={role.id}>
                  <ListItem
                    button
                    selected={selectedRole?.id === role.id}
                    onClick={() => setSelectedRole(role)}
                  >
                    <ListItemIcon>
                      <RoleChip role={role.name} />
                    </ListItemIcon>
                    <ListItemText
                      primary={role.name}
                      secondary={role.description}
                    />
                    <Box>
                      <Tooltip title="Modifier">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRole(role);
                            setEditDialogOpen(true);
                          }}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRole(role);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                          disabled={role.isDefault}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedRole && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Permissions du rôle {selectedRole.name}
              </Typography>
              <List>
                {permissions.map((permission) => (
                  <ListItem key={permission.id}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedRole.permissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id, selectedRole)}
                        disabled={selectedRole.isDefault}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={permission.name}
                      secondary={permission.description}
                    />
                  </ListItem>
                ))}
              </List>
              {!selectedRole.isDefault && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdateRole}
                  >
                    Enregistrer les modifications
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Dialog de création de rôle */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nouveau rôle</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Nom"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newRole.isDefault}
                  onChange={(e) => setNewRole({ ...newRole, isDefault: e.target.checked })}
                />
              }
              label="Rôle par défaut"
            />

            <Typography variant="subtitle1" gutterBottom>
              Permissions
            </Typography>
            <List>
              {permissions.map((permission) => (
                <ListItem key={permission.id}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={newRole.permissions.includes(permission.id)}
                      onChange={(e) => {
                        const updatedPermissions = e.target.checked
                          ? [...newRole.permissions, permission.id]
                          : newRole.permissions.filter(id => id !== permission.id);
                        setNewRole({ ...newRole, permissions: updatedPermissions });
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={permission.name}
                    secondary={permission.description}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleCreateRole} variant="contained">
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
            Êtes-vous sûr de vouloir supprimer ce rôle ?
            Cette action est irréversible et affectera tous les utilisateurs ayant ce rôle.
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

export default Roles; 