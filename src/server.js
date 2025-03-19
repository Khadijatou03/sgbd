require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const { createServer } = require('http');
const { Server } = require('socket.io');
const winston = require('winston');

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API DS-SGBD' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    message: 'Une erreur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Configuration Socket.IO
io.on('connection', (socket) => {
  logger.info('Nouveau client connecté');
  
  socket.on('disconnect', () => {
    logger.info('Client déconnecté');
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
}); 