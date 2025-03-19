const Log = require('../models/log.model');

// Classe personnalisée pour les erreurs de l'application
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de gestion des erreurs
const errorHandler = async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log de l'erreur
  await Log.error(err.message, {
    user: req.user?._id,
    ip: req.ip,
    path: req.path,
    method: req.method,
    stack: err.stack,
    statusCode: err.statusCode
  });

  // En développement, on renvoie plus de détails
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // En production, on ne renvoie que les informations essentielles
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Pour les erreurs non opérationnelles, on renvoie un message générique
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Une erreur est survenue sur le serveur'
      });
    }
  }
};

// Middleware pour gérer les erreurs 404
const notFoundHandler = (req, res, next) => {
  next(new AppError(`Impossible de trouver ${req.originalUrl} sur ce serveur`, 404));
};

// Middleware pour gérer les erreurs de validation Mongoose
const mongooseValidationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Données invalides: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Middleware pour gérer les erreurs de duplication Mongoose
const mongooseDuplicateKeyErrorHandler = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valeur dupliquée: ${value}. Veuillez utiliser une autre valeur.`;
  return new AppError(message, 400);
};

// Middleware pour gérer les erreurs de cast Mongoose
const mongooseCastErrorHandler = (err) => {
  const message = `ID invalide: ${err.value}`;
  return new AppError(message, 400);
};

// Middleware pour gérer les erreurs JWT
const jwtErrorHandler = (err) => {
  return new AppError('Token invalide. Veuillez vous reconnecter.', 401);
};

// Middleware pour gérer les erreurs d'expiration JWT
const jwtExpiredErrorHandler = (err) => {
  return new AppError('Votre token a expiré. Veuillez vous reconnecter.', 401);
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  mongooseValidationErrorHandler,
  mongooseDuplicateKeyErrorHandler,
  mongooseCastErrorHandler,
  jwtErrorHandler,
  jwtExpiredErrorHandler
}; 