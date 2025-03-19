const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
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

// Obtenir tous les utilisateurs (admin uniquement)
router.get('/',
  passport.authenticate('jwt', { session: false }),
  checkRole(['admin']),
  async (req, res) => {
    try {
      const [users] = await pool.query(`
        SELECT id, email, name, role, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `);

      res.json(users);
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  }
);

// Obtenir un utilisateur spécifique
router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Vérifier si l'utilisateur a accès à ces informations
      if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const [users] = await pool.query(`
        SELECT id, email, name, role, created_at, updated_at
        FROM users
        WHERE id = ?
      `, [req.params.id]);

      if (users.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json(users[0]);
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  }
);

// Mettre à jour un utilisateur
router.put('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Vérifier si l'utilisateur a accès à modifier ces informations
      if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const { name, email, password } = req.body;
      const userId = req.params.id;

      // Vérifier si l'email est déjà utilisé
      if (email) {
        const [existingUsers] = await pool.query(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, userId]
        );

        if (existingUsers.length > 0) {
          return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
      }

      // Préparer la requête de mise à jour
      let updateQuery = 'UPDATE users SET ';
      const updateValues = [];

      if (name) {
        updateQuery += 'name = ?, ';
        updateValues.push(name);
      }

      if (email) {
        updateQuery += 'email = ?, ';
        updateValues.push(email);
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery += 'password = ?, ';
        updateValues.push(hashedPassword);
      }

      // Supprimer la dernière virgule et ajouter la clause WHERE
      updateQuery = updateQuery.slice(0, -2) + ' WHERE id = ?';
      updateValues.push(userId);

      await pool.query(updateQuery, updateValues);

      logger.info(`Utilisateur ${userId} mis à jour`);
      res.json({ message: 'Utilisateur mis à jour avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }
  }
);

// Supprimer un utilisateur
router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRole(['admin']),
  async (req, res) => {
    try {
      const userId = req.params.id;

      // Vérifier si l'utilisateur existe
      const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Supprimer l'utilisateur
      await pool.query('DELETE FROM users WHERE id = ?', [userId]);

      logger.info(`Utilisateur ${userId} supprimé`);
      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
  }
);

// Changer le rôle d'un utilisateur
router.put('/:id/role',
  passport.authenticate('jwt', { session: false }),
  checkRole(['admin']),
  async (req, res) => {
    try {
      const { role } = req.body;
      const userId = req.params.id;

      // Vérifier si le rôle est valide
      if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide' });
      }

      // Vérifier si l'utilisateur existe
      const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Mettre à jour le rôle
      await pool.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId]
      );

      logger.info(`Rôle de l'utilisateur ${userId} mis à jour en ${role}`);
      res.json({ message: 'Rôle mis à jour avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du rôle:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
    }
  }
);

// Obtenir les statistiques d'un utilisateur
router.get('/:id/stats',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Vérifier si l'utilisateur a accès à ces statistiques
      if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const userId = req.params.id;

      // Obtenir les statistiques de base
      const [userStats] = await pool.query(`
        SELECT
          COUNT(DISTINCT s.exercise_id) as total_exercises_attempted,
          COUNT(s.id) as total_submissions,
          AVG(s.grade) as average_grade,
          COUNT(CASE WHEN s.grade >= 10 THEN 1 END) as passing_count,
          COUNT(CASE WHEN s.grade < 10 THEN 1 END) as failing_count
        FROM submissions s
        WHERE s.student_id = ?
      `, [userId]);

      // Obtenir l'évolution des notes dans le temps
      const [gradeEvolution] = await pool.query(`
        SELECT
          DATE(s.created_at) as date,
          AVG(s.grade) as average_grade,
          COUNT(s.id) as submission_count
        FROM submissions s
        WHERE s.student_id = ? AND s.grade IS NOT NULL
        GROUP BY DATE(s.created_at)
        ORDER BY date
      `, [userId]);

      // Obtenir les exercices les plus récents
      const [recentExercises] = await pool.query(`
        SELECT
          e.id,
          e.title,
          s.grade,
          s.created_at as submission_date
        FROM submissions s
        JOIN exercises e ON s.exercise_id = e.id
        WHERE s.student_id = ?
        ORDER BY s.created_at DESC
        LIMIT 5
      `, [userId]);

      res.json({
        ...userStats[0],
        gradeEvolution,
        recentExercises
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
  }
);

module.exports = router; 