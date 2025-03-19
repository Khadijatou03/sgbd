const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const { uploadFile } = require('../config/s3');
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

// Configuration de multer pour l'upload de fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Seuls les PDF sont acceptés.'));
    }
  }
});

// Middleware pour vérifier le rôle
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    next();
  };
};

// Créer un exercice
router.post('/',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const { title, description, content } = req.body;
      const teacherId = req.user.id;

      const [result] = await pool.query(
        'INSERT INTO exercises (title, description, content, teacher_id) VALUES (?, ?, ?, ?)',
        [title, description, content, teacherId]
      );

      logger.info(`Nouvel exercice créé par l'enseignant ${teacherId}: ${title}`);
      res.status(201).json({
        message: 'Exercice créé avec succès',
        exerciseId: result.insertId
      });
    } catch (error) {
      logger.error('Erreur lors de la création de l\'exercice:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'exercice' });
    }
  }
);

// Obtenir tous les exercices
router.get('/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const [exercises] = await pool.query(`
        SELECT e.*, u.name as teacher_name,
        (SELECT COUNT(*) FROM submissions WHERE exercise_id = e.id) as submission_count
        FROM exercises e
        JOIN users u ON e.teacher_id = u.id
        ORDER BY e.created_at DESC
      `);

      res.json(exercises);
    } catch (error) {
      logger.error('Erreur lors de la récupération des exercices:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des exercices' });
    }
  }
);

// Obtenir un exercice spécifique
router.get('/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const [exercises] = await pool.query(`
        SELECT e.*, u.name as teacher_name
        FROM exercises e
        JOIN users u ON e.teacher_id = u.id
        WHERE e.id = ?
      `, [req.params.id]);

      if (exercises.length === 0) {
        return res.status(404).json({ message: 'Exercice non trouvé' });
      }

      res.json(exercises[0]);
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'exercice:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'exercice' });
    }
  }
);

// Mettre à jour un exercice
router.put('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const { title, description, content } = req.body;
      const exerciseId = req.params.id;

      // Vérifier si l'enseignant est propriétaire de l'exercice
      const [exercises] = await pool.query(
        'SELECT * FROM exercises WHERE id = ? AND teacher_id = ?',
        [exerciseId, req.user.id]
      );

      if (exercises.length === 0) {
        return res.status(403).json({ message: 'Non autorisé à modifier cet exercice' });
      }

      await pool.query(
        'UPDATE exercises SET title = ?, description = ?, content = ? WHERE id = ?',
        [title, description, content, exerciseId]
      );

      logger.info(`Exercice ${exerciseId} mis à jour par l'enseignant ${req.user.id}`);
      res.json({ message: 'Exercice mis à jour avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de l\'exercice:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'exercice' });
    }
  }
);

// Supprimer un exercice
router.delete('/:id',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const exerciseId = req.params.id;

      // Vérifier si l'enseignant est propriétaire de l'exercice
      const [exercises] = await pool.query(
        'SELECT * FROM exercises WHERE id = ? AND teacher_id = ?',
        [exerciseId, req.user.id]
      );

      if (exercises.length === 0) {
        return res.status(403).json({ message: 'Non autorisé à supprimer cet exercice' });
      }

      await pool.query('DELETE FROM exercises WHERE id = ?', [exerciseId]);

      logger.info(`Exercice ${exerciseId} supprimé par l'enseignant ${req.user.id}`);
      res.json({ message: 'Exercice supprimé avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'exercice:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'exercice' });
    }
  }
);

// Ajouter une correction modèle
router.post('/:id/model-solutions',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const { content } = req.body;
      const exerciseId = req.params.id;

      // Vérifier si l'enseignant est propriétaire de l'exercice
      const [exercises] = await pool.query(
        'SELECT * FROM exercises WHERE id = ? AND teacher_id = ?',
        [exerciseId, req.user.id]
      );

      if (exercises.length === 0) {
        return res.status(403).json({ message: 'Non autorisé à ajouter une correction modèle' });
      }

      const [result] = await pool.query(
        'INSERT INTO model_solutions (exercise_id, content) VALUES (?, ?)',
        [exerciseId, content]
      );

      logger.info(`Correction modèle ajoutée pour l'exercice ${exerciseId}`);
      res.status(201).json({
        message: 'Correction modèle ajoutée avec succès',
        solutionId: result.insertId
      });
    } catch (error) {
      logger.error('Erreur lors de l\'ajout de la correction modèle:', error);
      res.status(500).json({ message: 'Erreur lors de l\'ajout de la correction modèle' });
    }
  }
);

// Obtenir les corrections modèles d'un exercice
router.get('/:id/model-solutions',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const [solutions] = await pool.query(
        'SELECT * FROM model_solutions WHERE exercise_id = ?',
        [req.params.id]
      );

      res.json(solutions);
    } catch (error) {
      logger.error('Erreur lors de la récupération des corrections modèles:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des corrections modèles' });
    }
  }
);

module.exports = router; 