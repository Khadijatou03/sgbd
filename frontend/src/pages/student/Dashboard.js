import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../config/axios';
import Header from '../../components/Header';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    file: null
  });
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Récupération des sujets disponibles
      try {
        const subjectsRes = await axios.get('/api/subjects');
        console.log('Réponse des sujets:', subjectsRes.data);
        setSubjects(subjectsRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des sujets:', error.response?.data || error.message);
        enqueueSnackbar('Erreur lors du chargement des sujets', { variant: 'error' });
      }

      // Récupération des soumissions de l'étudiant
      try {
        const submissionsRes = await axios.get('/api/submissions/student');
        console.log('Réponse des soumissions:', submissionsRes.data);
        setSubmissions(submissionsRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des soumissions:', error.response?.data || error.message);
        setSubmissions([]);
      }

    } catch (error) {
      console.error('Erreur générale:', error);
      enqueueSnackbar('Erreur lors du chargement des données', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (subject) => {
    setSelectedSubject(subject);
    setFormData({ file: null });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
    setFormData({ file: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('subject_id', selectedSubject.id);
    if (formData.file) {
      data.append('file', formData.file);
    }

    try {
      const response = await axios.post('/api/submissions', data);
      console.log('Réponse de soumission:', response.data);
      enqueueSnackbar('Soumission envoyée avec succès', { variant: 'success' });
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error.response?.data || error.message);
      enqueueSnackbar(error.response?.data?.message || 'Erreur lors de la soumission', { variant: 'error' });
    }
  };

  const getSubmissionStatus = (subjectId) => {
    const submission = submissions.find(s => s.subject_id === subjectId);
    if (!submission) return null;
    return submission.status;
  };

  const getSubmissionGrade = (subjectId) => {
    const submission = submissions.find(s => s.subject_id === subjectId);
    if (!submission) return null;
    return submission.grade;
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
        title="Tableau de bord étudiant"
        userInfo={user}
      />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Statistiques */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#E3F2FD', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ color: '#1976D2', mr: 1 }} />
                  <Typography variant="h6">
                    Épreuves disponibles
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#1976D2' }}>
                  {subjects.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#E8F5E9', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon sx={{ color: '#388E3C', mr: 1 }} />
                  <Typography variant="h6">
                    Soumissions évaluées
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#388E3C' }}>
                  {submissions.filter(s => s.status === 'evaluated').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: '#FFF3E0', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PendingIcon sx={{ color: '#F57C00', mr: 1 }} />
                  <Typography variant="h6">
                    En attente
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ color: '#F57C00' }}>
                  {submissions.filter(s => s.status !== 'evaluated').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Liste des épreuves */}
        <Typography variant="h5" sx={{ color: '#1976D2', mb: 3 }}>
          Épreuves disponibles ({subjects.length})
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {subjects.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ color: '#333', textAlign: 'center' }}>
                Aucune épreuve disponible
              </Typography>
            </Grid>
          ) : (
            subjects.map((subject) => {
              const status = getSubmissionStatus(subject.id);
              const grade = getSubmissionGrade(subject.id);
              const isLate = new Date(subject.date_echeance) < new Date();

              return (
                <Grid item xs={12} md={6} key={subject.id}>
                  <Card
                    sx={{
                      height: '100%',
                      bgcolor: 'white',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: '#333' }}>
                          {subject.titre}
                        </Typography>
                        {status && (
                          <Chip
                            label={status === 'evaluated' ? 'Évalué' : 'En attente'}
                            color={status === 'evaluated' ? 'success' : 'warning'}
                            size="small"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        {subject.consigne}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: isLate ? 'error.main' : '#999' }}>
                          Date limite : {new Date(subject.date_echeance).toLocaleDateString()}
                        </Typography>
                        {grade && (
                          <Typography variant="h6" sx={{ color: grade >= 10 ? 'success.main' : 'error.main' }}>
                            Note : {grade}/20
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions>
                      {subject.file_path && (
                        <Button
                          startIcon={<DownloadIcon />}
                          href={`${axios.defaults.baseURL}${subject.file_path}`}
                          target="_blank"
                          sx={{ color: 'primary.main' }}
                        >
                          Télécharger
                        </Button>
                      )}
                      {!status && !isLate && (
                        <Button
                          startIcon={<UploadIcon />}
                          onClick={() => handleOpenDialog(subject)}
                          variant="contained"
                          color="primary"
                        >
                          Soumettre
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>

        {/* Dialog de soumission */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Soumettre une réponse
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedSubject?.titre}
            </Typography>
            <TextField
              fullWidth
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={!formData.file}
            >
              Soumettre
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard; 