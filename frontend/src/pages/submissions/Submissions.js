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
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Submissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialog, setFilterDialog] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    status: '',
    exercise: '',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    exerciseId: '',
    content: '',
    files: [],
  });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/submissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des soumissions');
      console.error('Submissions fetch error:', err);
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

  const handleDeleteClick = (submission) => {
    setSelectedSubmission(submission);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/submissions/${selectedSubmission.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(submissions.filter((s) => s.id !== selectedSubmission.id));
      setDeleteDialog(false);
    } catch (err) {
      setError('Erreur lors de la suppression de la soumission');
      console.error('Submission delete error:', err);
    }
  };

  const handleEditClick = (submission) => {
    setSelectedSubmission(submission);
    setSubmissionForm({
      exerciseId: submission.exerciseId,
      content: submission.content,
      files: submission.files,
    });
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/submissions/${selectedSubmission.id}`,
        submissionForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSubmissions(
        submissions.map((s) =>
          s.id === selectedSubmission.id ? response.data : s
        )
      );
      setEditDialog(false);
    } catch (err) {
      setError('Erreur lors de la mise à jour de la soumission');
      console.error('Submission update error:', err);
    }
  };

  const handleCreateClick = () => {
    setSubmissionForm({
      exerciseId: '',
      content: '',
      files: [],
    });
    setEditDialog(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/submissions', submissionForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions([...submissions, response.data]);
      setEditDialog(false);
    } catch (err) {
      setError('Erreur lors de la création de la soumission');
      console.error('Submission create error:', err);
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSubmissionForm((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const handleRemoveFile = (index) => {
    setSubmissionForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const filteredSubmissions = submissions.filter((submission) =>
    submission.exerciseTitle.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Typography variant="h4">Soumissions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Nouvelle soumission
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
              placeholder="Rechercher une soumission..."
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
              <TableCell>Exercice</TableCell>
              <TableCell>Date de soumission</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Commentaires</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>{submission.exerciseTitle}</TableCell>
                  <TableCell>
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={submission.status}
                      color={
                        submission.status === 'graded'
                          ? 'success'
                          : submission.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {submission.grade ? `${submission.grade}/20` : '-'}
                  </TableCell>
                  <TableCell>
                    {submission.comments ? submission.comments.length : 0}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Voir">
                      <IconButton
            color="primary"
                        onClick={() => navigate(`/submissions/${submission.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(submission)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(submission)}
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
        count={filteredSubmissions.length}
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
          Êtes-vous sûr de vouloir supprimer cette soumission ?
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedSubmission ? 'Modifier la soumission' : 'Nouvelle soumission'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              select
              label="Exercice"
              fullWidth
              value={submissionForm.exerciseId}
              onChange={(e) =>
                setSubmissionForm({ ...submissionForm, exerciseId: e.target.value })
              }
            >
              {/* Liste des exercices disponibles */}
            </TextField>
            <TextField
              label="Contenu"
              fullWidth
              multiline
              rows={6}
              value={submissionForm.content}
              onChange={(e) =>
                setSubmissionForm({ ...submissionForm, content: e.target.value })
              }
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mb: 1 }}
              >
                Ajouter des fichiers
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
              {submissionForm.files.map((file, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2">{file.name}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button
            onClick={selectedSubmission ? handleEditSubmit : handleCreateSubmit}
            variant="contained"
          >
            {selectedSubmission ? 'Modifier' : 'Soumettre'}
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
              label="Statut"
              fullWidth
              name="status"
              value={filterCriteria.status}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="graded">Corrigé</option>
              <option value="rejected">Rejeté</option>
            </TextField>
            <TextField
              select
              label="Exercice"
              fullWidth
              name="exercise"
              value={filterCriteria.exercise}
              onChange={handleFilterChange}
            >
              <option value="">Tous</option>
              {/* Liste des exercices */}
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

export default Submissions; 