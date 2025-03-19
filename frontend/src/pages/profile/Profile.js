import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from '../../contexts/SnackbarContext';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Nom requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis')
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Mot de passe actuel requis'),
  newPassword: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    )
    .required('Nouveau mot de passe requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Les mots de passe doivent correspondre')
    .required('Confirmation du mot de passe requise')
});

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [editing, setEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: user.name,
      email: user.email
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await updateProfile(values);
        showSuccess('Profil mis à jour avec succès');
        setEditing(false);
      } catch (error) {
        showError('Erreur lors de la mise à jour du profil');
      } finally {
        setLoading(false);
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await changePassword(values.currentPassword, values.newPassword);
        showSuccess('Mot de passe modifié avec succès');
        setPasswordDialogOpen(false);
        passwordFormik.resetForm();
      } catch (error) {
        showError('Erreur lors de la modification du mot de passe');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mon Profil
        </Typography>
        {!editing && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
          >
            Modifier
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto 16px',
                bgcolor: 'primary.main'
              }}
            >
              <PersonIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {user.name}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {user.role === 'teacher' ? 'Enseignant' : 'Étudiant'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setPasswordDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Changer le mot de passe
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Nom"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rôle"
                    value={user.role === 'teacher' ? 'Enseignant' : 'Étudiant'}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                {editing && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditing(false);
                          formik.resetForm();
                        }}
                        disabled={loading}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={loading}
                      >
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de changement de mot de passe */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Changer le mot de passe</DialogTitle>
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="currentPassword"
                  label="Mot de passe actuel"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordFormik.values.currentPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                  helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="newPassword"
                  label="Nouveau mot de passe"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordFormik.values.newPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                  helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirmer le nouveau mot de passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                  helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Annuler</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Modification...' : 'Modifier'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Profile; 