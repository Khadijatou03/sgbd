import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Exercises = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialog, setFilterDialog] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    difficulty: '',
    status: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    title: '',
    description: '',
    difficulty: '',
    deadline: '',
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/exercises', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercises(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des exercices');
      console.error('Exercises fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterSubmit = () => {
    // Appliquer les filtres
    setFilterDialog(false);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (exercise) => {
    setSelectedExercise(exercise);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/exercises/${selectedExercise.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercises(exercises.filter((e) => e.id !== selectedExercise.id));
      setDeleteDialog(false);
    } catch (err) {
      setError('Erreur lors de la suppression de l\'exercice');
      console.error('Exercise delete error:', err);
    }
  };

  const handleEditClick = (exercise) => {
    setSelectedExercise(exercise);
    setExerciseForm({
      title: exercise.title,
      description: exercise.description,
      difficulty: exercise.difficulty,
      deadline: exercise.deadline,
    });
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/exercises/${selectedExercise.id}`,
        exerciseForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setExercises(
        exercises.map((e) =>
          e.id === selectedExercise.id ? response.data : e
        )
      );
      setEditDialog(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'exercice');
      console.error('Exercise update error:', err);
    }
  };

  const handleCreateClick = () => {
    setExerciseForm({
      title: '',
      description: '',
      difficulty: '',
      deadline: '',
    });
    setEditDialog(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/exercises', exerciseForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercises([...exercises, response.data]);
      setEditDialog(false);
    } catch (err) {
      setError('Erreur lors de la création de l\'exercice');
      console.error('Exercise create error:', err);
    }
  };

  const filteredExercises = exercises.filter((exercise) =>
    exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Exercices</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          onClick={handleCreateClick}
          >
            Nouvel exercice
          </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Box p={2} display="flex" gap={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un exercice..."
            value={searchQuery}
              onChange={handleSearch}
              InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Button
              variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFilterDialog(true)}
            >
              Filtres
            </Button>
      </Box>
      </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Difficulté</TableCell>
                  <TableCell>Date limite</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
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
                        exercise.difficulty === 'easy'
                          ? 'success'
                          : exercise.difficulty === 'medium'
                          ? 'warning'
                          : 'error'
                      }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(exercise.deadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={exercise.status}
                      color={
                        exercise.status === 'active'
                          ? 'success'
                          : exercise.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                      />
                    </TableCell>
                    <TableCell>
                    <Tooltip title="Modifier">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(exercise)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(exercise)}
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
        component="div"
        count={filteredExercises.length}
            page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Dialog de suppression */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer cet exercice ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de création/modification */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedExercise ? 'Modifier l\'exercice' : 'Nouvel exercice'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Titre"
              fullWidth
              value={exerciseForm.title}
              onChange={(e) =>
                setExerciseForm({ ...exerciseForm, title: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={exerciseForm.description}
              onChange={(e) =>
                setExerciseForm({ ...exerciseForm, description: e.target.value })
              }
            />
            <TextField
              select
              label="Difficulté"
              fullWidth
              value={exerciseForm.difficulty}
              onChange={(e) =>
                setExerciseForm({ ...exerciseForm, difficulty: e.target.value })
              }
            >
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </TextField>
            <TextField
              label="Date limite"
              type="date"
              fullWidth
              value={exerciseForm.deadline}
              onChange={(e) =>
                setExerciseForm({ ...exerciseForm, deadline: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button
            onClick={selectedExercise ? handleEditSubmit : handleCreateSubmit}
            variant="contained"
          >
            {selectedExercise ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de filtres */}
      <Dialog open={filterDialog} onClose={() => setFilterDialog(false)}>
        <DialogTitle>Filtres</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              select
              label="Difficulté"
              fullWidth
              name="difficulty"
              value={filterCriteria.difficulty}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              <option value="easy">Facile</option>
              <option value="medium">Moyen</option>
              <option value="hard">Difficile</option>
            </TextField>
            <TextField
              select
              label="Statut"
              fullWidth
              name="status"
              value={filterCriteria.status}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="completed">Terminé</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialog(false)}>Annuler</Button>
          <Button onClick={handleFilterSubmit} variant="contained">
            Appliquer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Exercises; 