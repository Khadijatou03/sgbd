import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001'
});

// Intercepteur pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token ajouté aux headers:', token.substring(0, 20) + '...');
    } else {
      console.warn('Aucun token trouvé dans le localStorage');
    }

    // Ne pas définir Content-Type pour FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    console.log('Requête envoyée:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    });
    return config;
  },
  (error) => {
    console.error('Erreur lors de la préparation de la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Réponse reçue:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Erreur complète:', error);

    if (!error.response) {
      // Erreur réseau
      console.error('Erreur réseau:', error);
      return Promise.reject(new Error('Impossible de se connecter au serveur. Vérifiez que le serveur backend est bien démarré sur le port 3001.'));
    }

    // Gestion des erreurs HTTP
    const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
    console.error('Erreur HTTP:', {
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    });

    // Si c'est une erreur 401 sur la route de login, on ne redirige pas
    if (error.response?.status === 401 && error.config.url === '/api/auth/login') {
      return Promise.reject(new Error('Email ou mot de passe incorrect'));
    }

    // Pour les autres erreurs 401, on redirige vers la page de login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expirée. Veuillez vous reconnecter.'));
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance; 