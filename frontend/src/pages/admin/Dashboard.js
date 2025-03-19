import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SupervisorAccount as SupervisorIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../config/axios';
import Header from '../../components/Header';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProfessors: 0,
    totalSubjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    nom: '',
    prenom: '',
    matricule: '',
    departement: '',
    classe: '',
    filiere: ''
  });
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/stats')
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      enqueueSnackbar('Erreur lors du chargement des données', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: '',
        role: user.role,
        nom: user.nom || '',
        prenom: user.prenom || '',
        matricule: user.matricule || '',
        departement: user.departement || '',
        classe: user.classe || '',
        filiere: user.filiere || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        role: '',
        nom: '',
        prenom: '',
        matricule: '',
        departement: '',
        classe: '',
        filiere: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      role: '',
      nom: '',
      prenom: '',
      matricule: '',
      departement: '',
      classe: '',
      filiere: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`/api/admin/users/${editingUser.id}`, formData);
        enqueueSnackbar('Utilisateur modifié avec succès', { variant: 'success' });
      } else {
        await axios.post('/api/admin/users', formData);
        enqueueSnackbar('Utilisateur créé avec succès', { variant: 'success' });
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      enqueueSnackbar(error.response?.data?.message || 'Erreur lors de la soumission', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`/api/admin/users/${id}`);
        enqueueSnackbar('Utilisateur supprimé avec succès', { variant: 'success' });
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student':
        return <PersonIcon />;
      case 'professor':
        return <SchoolIcon />;
      case 'admin':
        return <AdminIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student':
        return 'info';
      case 'professor':
        return 'success';
      case 'admin':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Header 
        title="Tableau de bord administrateur"
        userInfo={user}
      />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Fab
            color="primary"
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(45deg, #9C27B0 30%, #E040FB 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #E040FB 30%, #9C27B0 90%)',
                transform: 'scale(1.05)'
              }
            }}
          >
            <AddIcon />
          </Fab>
        </Box>

        {/* Statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#E3F2FD', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ color: '#1976D2', mr: 1 }} />
                  <Typography variant="h6">
                    Étudiants
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#1976D2' }}>
                  {stats.totalStudents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#E8F5E9', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ color: '#388E3C', mr: 1 }} />
                  <Typography variant="h6">
                    Professeurs
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#388E3C' }}>
                  {stats.totalProfessors}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#FFF3E0', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ color: '#F57C00', mr: 1 }} />
                  <Typography variant="h6">
                    Sujets
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#F57C00' }}>
                  {stats.totalSubjects}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Liste des utilisateurs */}
        <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
          Gestion des utilisateurs
        </Typography>
        <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Utilisateur</TableCell>
                <TableCell sx={{ color: 'white' }}>Rôle</TableCell>
                <TableCell sx={{ color: 'white' }}>Détails</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getRoleIcon(user.role)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ color: 'white' }}>
                          {user.nom} {user.prenom}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {user.role === 'student' ? (
                      <>
                        Matricule: {user.matricule}<br />
                        {user.departement} - {user.classe} - {user.filiere}
                      </>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                        sx={{ color: 'primary.main', mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user.id)}
                        sx={{ color: 'error.main' }}
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

        {/* Dialog de création/modification d'utilisateur */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }
          }}
        >
          <DialogTitle>
            {editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              {!editingUser && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mot de passe"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Rôle"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <MenuItem value="student">Étudiant</MenuItem>
                  <MenuItem value="professor">Professeur</MenuItem>
                  <MenuItem value="admin">Administrateur</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </Grid>
              {formData.role === 'student' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Matricule"
                      value={formData.matricule}
                      onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Département"
                      value={formData.departement}
                      onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Classe"
                      value={formData.classe}
                      onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Filière"
                      value={formData.filiere}
                      onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingUser ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard; 