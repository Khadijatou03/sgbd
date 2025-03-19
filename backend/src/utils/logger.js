const winston = require('winston');
const path = require('path');
const config = require('../config/config');

// Configuration des formats
const formats = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuration des transports
const transports = [
  // Transport pour les erreurs
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: formats
  }),
  // Transport pour tous les logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: formats
  })
];

// Ajout du transport console en développement
if (config.nodeEnv !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

// Création du logger
const logger = winston.createLogger({
  level: config.logLevel,
  format: formats,
  transports,
  // Gestion des exceptions non capturées
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
      format: formats
    })
  ],
  // Gestion des rejets de promesses non capturés
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log'),
      format: formats
    })
  ]
});

// Création du stream pour Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger; 