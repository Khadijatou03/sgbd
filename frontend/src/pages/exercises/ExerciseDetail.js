import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Code as CodeIcon,
  AccessTime as AccessTimeIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const ExerciseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExercise();
  }, [id]);

  const fetchExercise = async () => {
    try {
      const response = await axios.get(`/api/exercises/${id}`);
      setExercise(response.data);
      setLoading(false);
    } catch (error) {
      showError('Erreur lors du chargement de l\'exercice');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/exercises/${id}`);
      showSuccess('Exercice supprimé avec succès');
      navigate('/exercises');
    } catch (error) {
      showError('Erreur lors de la suppression de l\'exercice');
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await axios.post(`/api/exercises/${id}/submissions`, {
        content: submissionContent
      });
      showSuccess('Soumission enregistrée avec succès');
      setSubmissionDialogOpen(false);
      setSubmissionContent('');
    } catch (error) {
      showError('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!exercise) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Exercice non trouvé
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {exercise.title}
        </Typography>
        <Box>
          {user.role === 'teacher' && (
            <>
              <Tooltip title="Modifier">
                <IconButton
                  onClick={() => navigate(`/exercises/${id}/edit`)}
                  color="primary"
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Supprimer">
                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          {user.role === 'student' && (
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setSubmissionDialogOpen(true)}
            >
              Soumettre une solution
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {exercise.description}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Énoncé
            </Typography>
            <Typography variant="body1" paragraph>
              {exercise.content}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon color="primary" />
                <Typography>
                  <strong>Enseignant :</strong> {exercise.teacher_name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon color="primary" />
                <Typography>
                  <strong>Date de création :</strong>{' '}
                  {new Date(exercise.created_at).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon color="primary" />
                <Typography>
                  <strong>Difficulté :</strong>{' '}
                  <Chip
                    label={exercise.difficulty}
                    color={
                      exercise.difficulty === 'easy'
                        ? 'success'
                        : exercise.difficulty === 'medium'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </Typography>
              </Box>
              <Box>
                <Typography>
                  <strong>Points :</strong> {exercise.points}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de soumission */}
      <Dialog
        open={submissionDialogOpen}
        onClose={() => setSubmissionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Soumettre une solution</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Solution"
            fullWidth
            multiline
            rows={10}
            value={submissionContent}
            onChange={(e) => setSubmissionContent(e.target.value)}
            placeholder="Entrez votre solution ici..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !submissionContent.trim()}
          >
            {submitting ? 'Soumission en cours...' : 'Soumettre'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExerciseDetail; 