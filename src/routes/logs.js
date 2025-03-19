const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../config/database');
const winston = require('winston');

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

// Middleware pour vérifier le rôle
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    next();
  };
};

// Obtenir tous les logs (admin uniquement)
router.get('/',
  passport.authenticate('jwt', { session: false }),
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, action, startDate, endDate } = req.query;
      const offset = (page - 1) * limit;

      // Construire la requête de base
      let query = `
        SELECT l.*, u.name as user_name, u.email as user_email
        FROM logs l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE 1=1
      `;
      const queryParams = [];

      // Ajouter les filtres
      if (action) {
        query += ' AND l.action = ?';
        queryParams.push(action);
      }

      if (startDate) {
        query += ' AND l.created_at >= ?';
        queryParams.push(startDate);
      }

      if (endDate) {
        query += ' AND l.created_at <= ?';
        queryParams.push(endDate);
      }

      // Ajouter le tri et la pagination
      query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(parseInt(limit), offset);

      // Exécuter la requête
      const [logs] = await pool.query(query, queryParams);

      // Obtenir le nombre total de logs
      let countQuery = 'SELECT COUNT(*) as total FROM logs WHERE 1=1';
      const countParams = [];

      if (action) {
        countQuery += ' AND action = ?';
        countParams.push(action);
      }

      if (startDate) {
        countQuery += ' AND created_at >= ?';
        countParams.push(startDate);
      }

      if (endDate) {
        countQuery += ' AND created_at <= ?';
        countParams.push(endDate);
      }

      const [countResult] = await pool.query(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des logs:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des logs' });
    }
  }
);

// Obtenir les logs d'un utilisateur spécifique
router.get('/user/:userId',
  passport.authenticate('jwt', { session: false }),
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const [logs] = await pool.query(`
        SELECT l.*, u.name as user_name, u.email as user_email
        FROM logs l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.user_id = ?
        ORDER BY l.created_at DESC
        LIMIT ? OFFSET ?
      `, [req.params.userId, parseInt(limit), offset]);

      // Obtenir le nombre total de logs pour cet utilisateur
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM logs WHERE user_id = ?',
        [req.params.userId]
      );

      const total = countResult[0].total;

      res.json({
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des logs utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des logs utilisateur' });
    }
  }
);

// Obtenir les statistiques des logs
router.get('/stats',
  passport.authenticate('jwt', { session: false }),
  checkRole(['admin']),
  async (req, res) => {
    try {
      // Obtenir le nombre total de logs
      const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM logs');
      const total = totalResult[0].total;

      // Obtenir le nombre de logs par action
      const [actionStats] = await pool.query(`
        SELECT action, COUNT(*) as count
        FROM logs
        GROUP BY action
        ORDER BY count DESC
      `);

      // Obtenir le nombre de logs par jour
      const [dailyStats] = await pool.query(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM logs
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `);

      // Obtenir le nombre de logs par heure
      const [hourlyStats] = await pool.query(`
        SELECT
          HOUR(created_at) as hour,
          COUNT(*) as count
        FROM logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY HOUR(created_at)
        ORDER BY hour
      `);

      res.json({
        total,
        actionStats,
        dailyStats,
        hourlyStats
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques des logs:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques des logs' });
    }
  }
);

// Supprimer les logs (admin uniquement)
router.delete('/',
  passport.authenticate('jwt', { session: false }),
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { beforeDate } = req.query;

      let query = 'DELETE FROM logs';
      const queryParams = [];

      if (beforeDate) {
        query += ' WHERE created_at < ?';
        queryParams.push(beforeDate);
      }

      const [result] = await pool.query(query, queryParams);

      logger.info(`${result.affectedRows} logs supprimés`);
      res.json({
        message: 'Logs supprimés avec succès',
        deletedCount: result.affectedRows
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression des logs:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression des logs' });
    }
  }
);

// Middleware pour logger les actions
const logAction = (action) => {
  return async (req, res, next) => {
    try {
      await pool.query(
        'INSERT INTO logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
        [
          req.user.id,
          action,
          JSON.stringify(req.body),
          req.ip
        ]
      );
      next();
    } catch (error) {
      logger.error('Erreur lors de l\'enregistrement du log:', error);
      next();
    }
  };
};

module.exports = {
  router,
  logAction
}; 