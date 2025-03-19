require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/database');
const logger = require('./utils/logger');

console.log('Port configuré:', process.env.PORT);

// Configuration CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  logger.error('Erreur non capturée:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Promesse rejetée non gérée:', err);
  logger.error('Promesse rejetée non gérée:', err);
});

// Import des routes avec chemin absolu
console.log('Chargement des routes...');
try {
  const authRouter = require(path.join(__dirname, './routes/auth.routes'));
  console.log('Routes d\'authentification chargées');
  const studentRouter = require(path.join(__dirname, './routes/student.routes'));
  console.log('Routes des étudiants chargées');
  const subjectRouter = require(path.join(__dirname, './routes/subject.routes'));
  console.log('Routes des matières chargées');
  const submissionRouter = require(path.join(__dirname, './routes/submission.routes'));
  console.log('Routes des soumissions chargées');

  const app = express();

  // Middleware pour parser le JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware de logging
  app.use((req, res, next) => {
    console.log('Nouvelle requête:', req.method, req.url);
    logger.info('=== Nouvelle requête ===', {
      url: req.url,
      method: req.method,
      body: req.body,
      headers: req.headers
    });
    next();
  });

  // Configuration CORS
  app.use(cors(corsOptions));

  // Configuration des fichiers statiques
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Middleware pour logger les requêtes de fichiers
  app.use('/uploads', (req, res, next) => {
    logger.info('=== Requête de fichier ===', {
      url: req.url,
      method: req.method
    });
    next();
  });

  // Routes
  console.log('Montage des routes...');
  app.use('/api/auth', authRouter);
  console.log('Routes d\'authentification montées sur /api/auth');
  app.use('/api/student', studentRouter);
  console.log('Routes des étudiants montées sur /api/student');
  app.use('/api/subjects', subjectRouter);
  console.log('Routes des matières montées sur /api/subjects');
  app.use('/api/submissions', submissionRouter);
  console.log('Routes des soumissions montées sur /api/submissions');

  // Gestion des erreurs 404
  app.use((req, res) => {
    console.log('Route non trouvée:', req.method, req.url);
    logger.warn('=== Route non trouvée ===', {
      url: req.url,
      method: req.method
    });
    res.status(404).json({ message: 'Route non trouvée' });
  });

  // Gestion globale des erreurs
  app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    logger.error('=== Erreur serveur ===', {
      url: req.url,
      method: req.method,
      error: err.stack
    });
    res.status(500).json({ message: 'Erreur serveur' });
  });

  const PORT = process.env.PORT || 3001;
  console.log('Port utilisé:', PORT);
  const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    logger.info(`Serveur démarré sur le port ${PORT}`);
    logger.info(`Dossier des uploads: ${path.join(__dirname, '../uploads')}`);
    
    // Afficher les routes enregistrées
    console.log('\nRoutes enregistrées :');
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            console.log(`${Object.keys(handler.route.methods)} ${handler.route.path}`);
          }
        });
      }
    });
  });

  // Gestion de l'arrêt gracieux
  process.on('SIGTERM', () => {
    console.log('Signal SIGTERM reçu. Arrêt gracieux...');
    server.close(() => {
      console.log('Serveur arrêté');
      process.exit(0);
    });
  });

} catch (error) {
  console.error('Erreur lors du démarrage du serveur:', error);
  logger.error('Erreur lors du démarrage du serveur:', error);
  process.exit(1);
} 