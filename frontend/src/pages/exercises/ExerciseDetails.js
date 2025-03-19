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
  Tabs
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Code as CodeIcon,
  Assessment as AssessmentIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { javascript } from '@codemirror/lang-javascript';

const ExerciseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [files, setFiles] = useState([]);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchExercise();
    if (user.role === 'student') {
      fetchSubmission();
    }
  }, [id, user]);

  const fetchExercise = async () => {
    try {
      const response = await axios.get(`/api/exercises/${id}`);
      setExercise(response.data);
      if (response.data.allowed_languages.length > 0) {
        setSelectedLanguage(response.data.allowed_languages[0]);
      }
    } catch (error) {
      showError('Erreur lors du chargement de l\'exercice');
      navigate('/exercises');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmission = async () => {
    try {
      const response = await axios.get(`/api/submissions/exercise/${id}/user/${user.id}`);
      if (response.data) {
        setSubmission(response.data);
        setCode(response.data.code);
        setSelectedLanguage(response.data.language);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la soumission:', error);
    }
  };

  const handleFileUpload = (event) => {
    const newFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('code', code);
      formData.append('language', selectedLanguage);
      files.forEach(file => {
        formData.append('files', file);
      });

      await axios.post(`/api/submissions/exercise/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showSuccess('Solution soumise avec succès');
      setSubmitDialogOpen(false);
      fetchSubmission();
    } catch (error) {
      showError('Erreur lors de la soumission de la solution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadFile = async (fileId) => {
    try {
      const response = await axios.get(`/api/exercises/${id}/files/${fileId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', response.headers['content-disposition'].split('filename=')[1]);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showError('Erreur lors du téléchargement du fichier');
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

  if (!exercise) {
    return (
      <Alert severity="error">
        Exercice non trouvé
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {exercise.title}
        </Typography>
        {user.role === 'student' && (
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => setSubmitDialogOpen(true)}
            disabled={new Date(exercise.deadline) < new Date()}
          >
            Soumettre une solution
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {exercise.description}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssessmentIcon sx={{ mr: 1 }} />
                    <Typography>
                      Points: {exercise.points}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1 }} />
                    <Typography>
                      Date limite: {new Date(exercise.deadline).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LanguageIcon sx={{ mr: 1 }} />
                    <Typography>
                      Langages autorisés:
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {exercise.allowed_languages.map(lang => (
                      <Chip key={lang} label={lang} color="primary" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AssessmentIcon sx={{ mr: 1 }} />
                    <Typography>
                      Difficulté: {exercise.difficulty}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Fichiers
              </Typography>
              <List>
                {exercise.files.map((file, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                      />
                      <Button
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadFile(file.id)}
                      >
                        Télécharger
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Paper>

          {user.role === 'student' && submission && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Votre dernière soumission
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Statut: {submission.status}
                </Typography>
                <Typography variant="subtitle1">
                  Note: {submission.grade || 'Non noté'}
                </Typography>
                <Typography variant="subtitle1">
                  Date de soumission: {new Date(submission.created_at).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <CodeMirror
                  value={submission.code}
                  height="300px"
                  extensions={[getLanguageExtension(submission.language)]}
                  editable={false}
                />
              </Box>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cas de test
            </Typography>
            <List>
              {exercise.test_cases.map((testCase, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Cas de test ${index + 1}`}
                      secondary={`Points: ${testCase.points}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialogue de soumission */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Soumettre une solution</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Langage</InputLabel>
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                label="Langage"
              >
                {exercise.allowed_languages.map(lang => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Code source
              </Typography>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <CodeMirror
                  value={code}
                  height="300px"
                  extensions={[getLanguageExtension(selectedLanguage)]}
                  onChange={setCode}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Fichiers supplémentaires
              </Typography>
              <input
                accept=".txt,.pdf,.zip"
                style={{ display: 'none' }}
                id="file-upload"
                multiple
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Ajouter des fichiers
                </Button>
              </label>
              <List>
                {files.map((file, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(2)} KB`}
                      />
                      <Button
                        color="error"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Supprimer
                      </Button>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !code.trim()}
          >
            {submitting ? (
              <CircularProgress size={24} />
            ) : (
              'Soumettre'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExerciseDetails; 