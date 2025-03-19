import React, { useState, useEffect, useCallback } from 'react';
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
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const Submissions = () => {
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [formData, setFormData] = useState({
    grade: '',
    feedback: '',
    status: 'pending'
  });

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/submissions');
      setSubmissions(response.data);
    } catch (error) {
      showError('Erreur lors du chargement des soumissions');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleOpenDialog = (submission) => {
    setSelectedSubmission(submission);
    setFormData({
      grade: submission?.grade || '',
      feedback: submission?.feedback || '',
      status: submission?.status || 'pending'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubmission(null);
    setFormData({
      grade: '',
      feedback: '',
      status: 'pending'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedSubmission) {
        await axios.put(`/api/admin/submissions/${selectedSubmission.id}`, formData);
        showSuccess('Soumission mise à jour avec succès');
      }
      handleCloseDialog();
      fetchSubmissions();
    } catch (error) {
      showError('Erreur lors de la mise à jour de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (submissionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette soumission ?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/admin/submissions/${submissionId}`);
        showSuccess('Soumission supprimée avec succès');
        fetchSubmissions();
      } catch (error) {
        showError('Erreur lors de la suppression de la soumission');
      } finally {
        setLoading(false);
      }
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Gestion des soumissions
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Étudiant</TableCell>
              <TableCell>Exercice</TableCell>
              <TableCell>Date de soumission</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.studentName}</TableCell>
                <TableCell>{submission.exerciseTitle}</TableCell>
                <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                <TableCell>{submission.status}</TableCell>
                <TableCell>{submission.grade || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(submission)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(submission.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          Évaluer la soumission
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Note"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              margin="normal"
              type="number"
              required
            />
            <TextField
              fullWidth
              label="Commentaires"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
            />
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
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="graded">Noté</MenuItem>
              <MenuItem value="rejected">Rejeté</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              Mettre à jour
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Submissions; 