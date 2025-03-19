import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Tooltip,
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
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const Exercises = () => {
  const { showSuccess, showError } = useSnackbar();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    status: 'all'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    status: ''
  });

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/exercises');
      setExercises(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des exercices');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/admin/exercises/${selectedExercise.id}`);
      setExercises(exercises.filter(exercise => exercise.id !== selectedExercise.id));
      showSuccess('Exercice supprimé avec succès');
      setDeleteDialogOpen(false);
    } catch (error) {
      showError('Erreur lors de la suppression de l\'exercice');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = 
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDifficulty = filters.difficulty === 'all' || exercise.difficulty === filters.difficulty;
    const matchesStatus = filters.status === 'all' || exercise.status === filters.status;
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const handleOpenDialog = (exercise) => {
    setSelectedExercise(exercise);
    setFormData({
      title: exercise?.title || '',
      description: exercise?.description || '',
      difficulty: exercise?.difficulty || '',
      status: exercise?.status || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedExercise(null);
    setFormData({
      title: '',
      description: '',
      difficulty: '',
      status: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedExercise) {
        await axios.put(`/api/admin/exercises/${selectedExercise.id}`, formData);
        showSuccess('Exercice mis à jour avec succès');
      } else {
        await axios.post('/api/admin/exercises', formData);
        showSuccess('Exercice créé avec succès');
      }
      handleCloseDialog();
      fetchExercises();
    } catch (error) {
      showError('Erreur lors de la sauvegarde de l\'exercice');
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
          Gestion des exercices
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog(null)}
        >
          Nouvel exercice
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un exercice..."
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
                <TableCell>Titre</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Difficulté</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date de création</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredExercises
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell>{exercise.title}</TableCell>
                    <TableCell>{exercise.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={exercise.difficulty}
                        color={
                          exercise.difficulty === 'easy' ? 'success' :
                          exercise.difficulty === 'medium' ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={exercise.status}
                        color={exercise.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(exercise.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton
                          onClick={() => handleOpenDialog(exercise)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={() => {
                            setSelectedExercise(exercise);
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
          count={filteredExercises.length}
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
            Êtes-vous sûr de vouloir supprimer l'exercice "{selectedExercise?.title}" ?
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
              label="Difficulté"
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              fullWidth
            >
              <MenuItem value="all">Toutes</MenuItem>
              <MenuItem value="easy">Facile</MenuItem>
              <MenuItem value="medium">Moyen</MenuItem>
              <MenuItem value="hard">Difficile</MenuItem>
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

      {/* Dialog d'édition/création d'exercice */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedExercise ? 'Modifier l\'exercice' : 'Nouvel exercice'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Titre"
                name="title"
                value={formData.title}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                required
              />
              <TextField
                select
                fullWidth
                label="Difficulté"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                margin="normal"
                required
              >
                <MenuItem value="easy">Facile</MenuItem>
                <MenuItem value="medium">Moyen</MenuItem>
                <MenuItem value="hard">Difficile</MenuItem>
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
              {selectedExercise ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Exercises; 