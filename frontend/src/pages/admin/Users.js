import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const Users = () => {
  const { showSuccess, showError } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    status: ''
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/users/${selectedUser.id}`);
      setUsers(users.filter(user => user.id !== selectedUser.id));
      showSuccess('Utilisateur supprimé avec succès');
      setDeleteDialogOpen(false);
    } catch (error) {
      showError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || user.status === filters.status;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      role: user?.role || '',
      status: user?.status || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      status: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedUser) {
        await axios.put(`/api/admin/users/${selectedUser.id}`, formData);
        showSuccess('Utilisateur mis à jour avec succès');
      } else {
        await axios.post('/api/admin/users', formData);
        showSuccess('Utilisateur créé avec succès');
      }
      handleCloseDialog();
      fetchUsers();
    } catch (error) {
      showError('Erreur lors de la sauvegarde de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          Gestion des utilisateurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(null)}
        >
          Nouvel utilisateur
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilterOpen(true)}
              >
                Filtres
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date d'inscription</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        icon={<SchoolIcon />}
                        label={user.role === 'teacher' ? 'Enseignant' : 'Étudiant'}
                        color={user.role === 'teacher' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={user.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton
                          onClick={() => handleOpenDialog(user)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={() => {
                            setSelectedUser(user);
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'utilisateur "{selectedUser?.name}" ?
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

      {/* Dialog des filtres */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      >
        <DialogTitle>Filtres</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Rôle"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="teacher">Enseignant</MenuItem>
              <MenuItem value="student">Étudiant</MenuItem>
            </TextField>
            <TextField
              select
              label="Statut"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              fullWidth
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="active">Actif</MenuItem>
              <MenuItem value="inactive">Inactif</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'édition/création d'utilisateur */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Prénom"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Nom"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                type="email"
              />
              <TextField
                select
                fullWidth
                label="Rôle"
                name="role"
                value={formData.role}
                onChange={handleChange}
                margin="normal"
                required
              >
                <MenuItem value="teacher">Enseignant</MenuItem>
                <MenuItem value="student">Étudiant</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="Statut"
                name="status"
                value={formData.status}
                onChange={handleChange}
                margin="normal"
                required
              >
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="inactive">Inactif</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {selectedUser ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Users; 