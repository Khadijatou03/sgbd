import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';

const SubmissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [grading, setGrading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(`/api/submissions/${id}`);
      setSubmission(response.data);
      setExercise(response.data.exercise);
      if (response.data.grade) {
        setGrade(response.data.grade.toString());
      }
      if (response.data.comment) {
        setComment(response.data.comment);
      }
    } catch (error) {
      showError('Erreur lors du chargement de la soumission');
      navigate('/submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async () => {
    try {
      setGrading(true);
      await axios.put(`/api/submissions/${id}/grade`, {
        grade: parseFloat(grade),
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'graded':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <WarningIcon />;
      case 'graded':
        return <CheckCircleIcon />;
      case 'failed':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  const getLanguageExtension = (language) => {
    switch (language) {
      case 'python':
        return python();
      case 'java':
        return java();
      case 'cpp':
        return cpp();
      case 'javascript':
        return javascript();
      default:
        return python();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!submission || !exercise) {
    return (
      <Alert severity="error">
        Soumission non trouvée
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/submissions')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Détails de la soumission
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssessmentIcon sx={{ mr: 1 }} />
                    <Typography>
                      Exercice: {exercise.title}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    <Typography>
                      Date de soumission: {new Date(submission.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LanguageIcon sx={{ mr: 1 }} />
                    <Typography>
                      Langage: {submission.language}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssessmentIcon sx={{ mr: 1 }} />
                    <Typography>
                      Statut: <Chip
                        icon={getStatusIcon(submission.status)}
                        label={submission.status}
                        color={getStatusColor(submission.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Code source
              </Typography>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <CodeMirror
                  value={submission.code}
                  height="400px"
                  extensions={[getLanguageExtension(submission.language)]}
                  editable={false}
                />
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Résultats des tests
            </Typography>
            <List>
              {submission.test_results.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {result.passed ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Test ${index + 1}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Entrée: {exercise.test_cases[index].input}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Sortie attendue: {exercise.test_cases[index].expected_output}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Sortie obtenue: {result.output}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Points: {result.points}/{exercise.test_cases[index].points}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Note et commentaire
            </Typography>
            {submission.status === 'graded' ? (
              <Box>
                <Typography variant="h4" gutterBottom>
                  {submission.grade}/20
                </Typography>
                <Typography variant="body1" paragraph>
                  {submission.comment}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" paragraph>
                  Cette soumission n'a pas encore été notée.
                </Typography>
                {user.role === 'teacher' && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setGradeDialogOpen(true)}
                  >
                    Noter la soumission
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogue de notation */}
      <Dialog
        open={gradeDialogOpen}
        onClose={() => setGradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Noter la soumission</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Note"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              inputProps={{ min: 0, max: 20, step: 0.5 }}
              sx={{ mb: 2 }}
            />
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
          <Button onClick={() => setGradeDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleGradeSubmit}
            variant="contained"
            disabled={grading || !grade || grade < 0 || grade > 20}
          >
            {grading ? (
              <CircularProgress size={24} />
            ) : (
              'Enregistrer'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmissionDetails; 