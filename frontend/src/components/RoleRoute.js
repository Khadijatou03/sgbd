import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const { showError } = useSnackbar();
  const location = useLocation();

  if (loading) {
    return null; // ou un composant de chargement
  }

  if (!user) {
    // Rediriger vers la page de connexion avec l'URL de retour
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    showError('Accès non autorisé');
    // Rediriger vers le tableau de bord
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute; 