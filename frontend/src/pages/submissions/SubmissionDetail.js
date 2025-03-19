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
  Tooltip,
  Rating
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Grade as GradeIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [grade, setGrade] = useState(0);
  const [comment, setComment] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(`/api/submissions/${id}`);
      setSubmission(response.data);
      setLoading(false);
    } catch (error) {
      showError('Erreur lors du chargement de la soumission');
      setLoading(false);
    }
  };

  const handleGrade = async () => {
    try {
      setGrading(true);
      await axios.put(`/api/submissions/${id}/grade`, {
        grade,
        comment
      });
      showSuccess('Note enregistrée avec succès');
      setGradeDialogOpen(false);
      fetchSubmission();
    } catch (error) {
      showError('Erreur lors de l\'enregistrement de la note');
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!submission) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Soumission non trouvée
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/submissions')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Détail de la soumission
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Solution soumise
            </Typography>
            <Typography
              variant="body1"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1
              }}
            >
              {submission.content}
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
                <AssignmentIcon color="primary" />
                <Typography>
                  <strong>Exercice :</strong> {submission.exercise_title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Typography>
                  <strong>Étudiant :</strong> {submission.student_name}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon color="primary" />
                <Typography>
                  <strong>Date de soumission :</strong>{' '}
                  {new Date(submission.created_at).toLocaleDateString('fr-FR')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GradeIcon color="primary" />
                <Typography>
                  <strong>Statut :</strong>{' '}
                  <Chip
                    label={submission.status}
                    color={
                      submission.status === 'graded'
                        ? 'success'
                        : submission.status === 'pending'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </Typography>
              </Box>
              {submission.grade && (
                <Box>
                  <Typography>
                    <strong>Note :</strong> {submission.grade}/20
                  </Typography>
                  {submission.comment && (
                    <Typography sx={{ mt: 1 }}>
                      <strong>Commentaire :</strong>
                    </Typography>
                  )}
                  {submission.comment && (
                    <Typography
                      variant="body2"
                      sx={{
                        backgroundColor: '#f5f5f5',
                        p: 2,
                        borderRadius: 1,
                        mt: 1
                      }}
                    >
                      {submission.comment}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de notation */}
      {user.role === 'teacher' && submission.status === 'pending' && (
        <Dialog
          open={gradeDialogOpen}
          onClose={() => setGradeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Noter la soumission</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography>Note :</Typography>
                <Rating
                  value={grade}
                  onChange={(event, newValue) => setGrade(newValue)}
                  max={20}
                  precision={0.5}
                  size="large"
                />
                <Typography>{grade}/20</Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Commentaire"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGradeDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handleGrade}
              variant="contained"
              disabled={grading || grade === 0}
            >
              {grading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Bouton de notation pour les enseignants */}
      {user.role === 'teacher' && submission.status === 'pending' && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<GradeIcon />}
            onClick={() => setGradeDialogOpen(true)}
          >
            Noter la soumission
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SubmissionDetail; 