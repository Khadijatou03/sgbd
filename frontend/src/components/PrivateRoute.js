import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === 'teacher') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 