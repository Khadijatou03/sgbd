import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Titre requis')
    .min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: Yup.string()
    .required('Description requise')
    .min(10, 'La description doit contenir au moins 10 caractères'),
  content: Yup.string()
    .required('Contenu requis')
    .min(20, 'Le contenu doit contenir au moins 20 caractères'),
  difficulty: Yup.string()
    .required('Difficulté requise')
    .oneOf(['easy', 'medium', 'hard'], 'Difficulté invalide'),
  points: Yup.number()
    .required('Points requis')
    .min(0, 'Les points doivent être positifs')
    .max(20, 'Les points ne peuvent pas dépasser 20'),
  deadline: Yup.date()
    .min(new Date(), 'La date limite doit être dans le futur')
});

const ExerciseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    title: '',
    description: '',
    content: '',
    difficulty: 'medium',
    points: 10,
    deadline: ''
  });

  useEffect(() => {
    if (id) {
      fetchExercise();
    }
  }, [id]);

  const fetchExercise = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/exercises/${id}`);
      const exercise = response.data;
      setInitialValues({
        title: exercise.title,
        description: exercise.description,
        content: exercise.content,
        difficulty: exercise.difficulty,
        points: exercise.points,
        deadline: exercise.deadline ? new Date(exercise.deadline).toISOString().split('T')[0] : ''
      });
    } catch (error) {
      showError('Erreur lors du chargement de l\'exercice');
      navigate('/exercises');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (id) {
          await axios.put(`/api/exercises/${id}`, values);
          showSuccess('Exercice mis à jour avec succès');
        } else {
          await axios.post('/api/exercises', values);
          showSuccess('Exercice créé avec succès');
        }
        navigate('/exercises');
      } catch (error) {
        showError(error.response?.data?.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }
  });

  if (loading && id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Modifier l\'exercice' : 'Créer un exercice'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Titre"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="content"
                name="content"
                label="Contenu"
                multiline
                rows={10}
                value={formik.values.content}
                onChange={formik.handleChange}
                error={formik.touched.content && Boolean(formik.errors.content)}
                helperText={formik.touched.content && formik.errors.content}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="difficulty-label">Difficulté</InputLabel>
                <Select
                  labelId="difficulty-label"
                  id="difficulty"
                  name="difficulty"
                  value={formik.values.difficulty}
                  onChange={formik.handleChange}
                  error={formik.touched.difficulty && Boolean(formik.errors.difficulty)}
                  label="Difficulté"
                >
                  <MenuItem value="easy">Facile</MenuItem>
                  <MenuItem value="medium">Moyen</MenuItem>
                  <MenuItem value="hard">Difficile</MenuItem>
                </Select>
                {formik.touched.difficulty && formik.errors.difficulty && (
                  <Typography color="error" variant="caption">
                    {formik.errors.difficulty}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="points"
                name="points"
                label="Points"
                type="number"
                value={formik.values.points}
                onChange={formik.handleChange}
                error={formik.touched.points && Boolean(formik.errors.points)}
                helperText={formik.touched.points && formik.errors.points}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="deadline"
                name="deadline"
                label="Date limite"
                type="date"
                value={formik.values.deadline}
                onChange={formik.handleChange}
                error={formik.touched.deadline && Boolean(formik.errors.deadline)}
                helperText={formik.touched.deadline && formik.errors.deadline}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/exercises')}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : id ? 'Mettre à jour' : 'Créer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default ExerciseForm; 