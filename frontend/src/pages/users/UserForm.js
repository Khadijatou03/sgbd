import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { useSnackbar } from '../../contexts/SnackbarContext';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: Yup.string()
    .required('L\'email est requis')
    .email('L\'email n\'est pas valide'),
  password: Yup.string()
    .required('Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),
  confirmPassword: Yup.string()
    .required('La confirmation du mot de passe est requise')
    .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas'),
  role: Yup.string()
    .required('Le rôle est requis')
    .oneOf(['admin', 'teacher', 'student'], 'Rôle invalide')
});

const UserForm = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      await axios.post('/api/users', {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role
      });
      showSuccess('Utilisateur créé avec succès');
      navigate('/users');
    } catch (error) {
      showError('Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Créer un nouvel utilisateur
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Nom"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="password"
                    label="Mot de passe"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="confirmPassword"
                    label="Confirmer le mot de passe"
                    type="password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Rôle</InputLabel>
                    <Select
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.role && Boolean(errors.role)}
                    >
                      <MenuItem value="admin">Administrateur</MenuItem>
                      <MenuItem value="teacher">Enseignant</MenuItem>
                      <MenuItem value="student">Étudiant</MenuItem>
                    </Select>
                    {touched.role && errors.role && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {errors.role}
                      </Alert>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/users')}
                      disabled={loading}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || isSubmitting}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Créer l\'utilisateur'
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default UserForm; 