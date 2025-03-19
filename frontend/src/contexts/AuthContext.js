import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Réponse de l\'API:', response.data);
      const { token, user } = response.data;
      
      console.log('Informations utilisateur:', user);
      console.log('Role utilisateur:', user.role);
      
      // Stockage du token
      localStorage.setItem('token', token);
      
      // Configuration du token dans les headers Axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Mise à jour de l'état utilisateur
      setUser(user);
      setLoading(false);
      
      return user;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default AuthContext; 