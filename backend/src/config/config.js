require('dotenv').config();

module.exports = {
  // Configuration de la base de données
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ds_sgbd'
  },
  
  // Configuration JWT
  jwtSecret: process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
  jwtExpiresIn: '24h',
  
  // Configuration du serveur
  port: process.env.PORT || 3000,
  
  // URL du frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Configuration du stockage des fichiers
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024, // 5MB

  // Configuration CORS
  corsOrigin: process.env.FRONTEND_URL || 'http://localhost:5173'
}; 