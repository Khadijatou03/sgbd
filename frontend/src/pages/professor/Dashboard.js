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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Fab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Rating,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  PendingActions as PendingIcon
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
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    consigne: '',
    date_echeance: '',
    file: null
  });
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Récupération des sujets
      try {
        const subjectsRes = await axios.get('/api/subjects');
        console.log('Réponse des sujets:', subjectsRes.data);
        console.log('Nombre de sujets récupérés:', subjectsRes.data.length);
        setSubjects(subjectsRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des sujets:', error.response?.data || error.message);
        enqueueSnackbar('Erreur lors du chargement des sujets', { variant: 'error' });
      }

      // Récupération des soumissions
      try {
        const submissionsRes = await axios.get('/api/submissions');
        console.log('Réponse des soumissions:', submissionsRes.data);
        setSubmissions(submissionsRes.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des soumissions:', error.response?.data || error.message);
        // On ne bloque pas l'affichage si les soumissions ne sont pas disponibles
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

  const handleOpenDialog = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        titre: subject.titre,
        consigne: subject.consigne,
        date_echeance: subject.date_echeance.split('T')[0],
        file: null
      });
    } else {
      setEditingSubject(null);
      setFormData({
        titre: '',
        consigne: '',
        date_echeance: '',
        file: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubject(null);
    setFormData({
      titre: '',
      consigne: '',
      date_echeance: '',
      file: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('consigne', formData.consigne);
    data.append('date_echeance', formData.date_echeance);
    if (formData.file) {
      data.append('file', formData.file);
    }

    console.log('Données du formulaire:', {
      titre: formData.titre,
      consigne: formData.consigne,
      date_echeance: formData.date_echeance,
      file: formData.file ? formData.file.name : null
    });

    try {
      if (editingSubject) {
        console.log('Modification du sujet:', editingSubject.id);
        const response = await axios.put(`/api/subjects/${editingSubject.id}`, data);
        console.log('Réponse de modification:', response.data);
        enqueueSnackbar('Sujet modifié avec succès', { variant: 'success' });
      } else {
        console.log('Création d\'un nouveau sujet');
        const response = await axios.post('/api/subjects', data);
        console.log('Réponse de création:', response.data);
        enqueueSnackbar('Sujet créé avec succès', { variant: 'success' });
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('Erreur détaillée lors de la soumission:', error.response?.data || error.message);
      enqueueSnackbar(error.response?.data?.message || 'Erreur lors de la soumission', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/subjects/${id}`);
      enqueueSnackbar('Sujet supprimé avec succès', { variant: 'success' });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  };

  const handleGrade = async (submissionId, note, commentaire) => {
    try {
      await axios.post(`/api/submissions/${submissionId}/grade`, { note, commentaire });
      enqueueSnackbar('Note attribuée avec succès', { variant: 'success' });
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la notation:', error);
      enqueueSnackbar('Erreur lors de la notation', { variant: 'error' });
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
        title="Tableau de bord professeur"
        userInfo={user}
      />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Fab
            color="primary"
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF8E53 30%, #FF6B6B 90%)',
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
                  <AssignmentIcon sx={{ color: '#1976D2', mr: 1 }} />
                  <Typography variant="h6">
                    Sujets actifs
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
                  <GradeIcon sx={{ color: '#388E3C', mr: 1 }} />
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

        {/* Liste des sujets */}
        <Typography variant="h5" sx={{ color: '#1976D2', mb: 3 }}>
          Mes sujets ({subjects.length})
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {subjects.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ color: '#333', textAlign: 'center' }}>
                Aucun sujet disponible
              </Typography>
            </Grid>
          ) : (
            subjects.map((subject) => {
              console.log('Affichage du sujet:', subject);
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
                      <Typography variant="h6" sx={{ color: '#333', mb: 2 }}>
                        {subject.titre || 'Sans titre'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                        {subject.consigne || 'Aucune consigne'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Date limite : {subject.date_echeance ? new Date(subject.date_echeance).toLocaleDateString() : 'Non définie'}
                      </Typography>
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
                      <IconButton
                        onClick={() => handleOpenDialog(subject)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(subject.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>

        {/* Liste des soumissions */}
        <Typography variant="h5" sx={{ color: '#1976D2', mb: 3 }}>
          Soumissions à évaluer
        </Typography>
        <TableContainer component={Paper} sx={{ bgcolor: 'white' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1976D2' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Étudiant</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sujet</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date de soumission</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fichier</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Note</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <TableCell sx={{ color: '#333' }}>{submission.student_name}</TableCell>
                  <TableCell sx={{ color: '#333' }}>{submission.subject_title}</TableCell>
                  <TableCell sx={{ color: '#333' }}>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {submission.file_path && (
                      <Button
                        startIcon={<DownloadIcon />}
                        href={`${axios.defaults.baseURL}${submission.file_path}`}
                        target="_blank"
                        sx={{ color: '#1976D2' }}
                      >
                        Télécharger
                      </Button>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: '#333' }}>{submission.grade || '-'}</TableCell>
                  <TableCell>
                    {submission.status !== 'evaluated' && (
                      <Tooltip title="Noter">
                        <IconButton
                          size="small"
                          onClick={() => {
                            const note = prompt('Note sur 20:');
                            const commentaire = prompt('Commentaire pour l\'étudiant:');
                            if (note !== null && commentaire !== null) {
                              handleGrade(submission.id, parseInt(note), commentaire);
                            }
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <GradeIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog de création/modification de sujet */}
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
            {editingSubject ? 'Modifier le sujet' : 'Créer un nouveau sujet'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              fullWidth
              label="Consigne"
              multiline
              rows={4}
              value={formData.consigne}
              onChange={(e) => setFormData({ ...formData, consigne: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="date"
              label="Date d'échéance"
              value={formData.date_echeance}
              onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingSubject ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard; 