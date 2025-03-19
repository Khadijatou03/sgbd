const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const { uploadFile } = require('../config/s3');
const { detectPlagiarism } = require('../config/plagiarism');
const { compareSolutions, generateFeedback } = require('../config/ollama');
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

// Soumettre une solution
router.post('/:exerciseId',
  passport.authenticate('jwt', { session: false }),
  upload.single('file'),
  async (req, res) => {
    try {
      const exerciseId = req.params.exerciseId;
      const studentId = req.user.id;

      // Vérifier si l'exercice existe
      const [exercises] = await pool.query(
        'SELECT * FROM exercises WHERE id = ?',
        [exerciseId]
      );

      if (exercises.length === 0) {
        return res.status(404).json({ message: 'Exercice non trouvé' });
      }

      // Upload du fichier PDF
      const fileKey = `submissions/${exerciseId}/${studentId}/${Date.now()}.pdf`;
      const fileUrl = await uploadFile(req.file, fileKey);

      // Créer la soumission
      const [result] = await pool.query(
        'INSERT INTO submissions (exercise_id, student_id, file_url) VALUES (?, ?, ?)',
        [exerciseId, studentId, fileUrl]
      );

      logger.info(`Nouvelle soumission créée pour l'exercice ${exerciseId} par l'étudiant ${studentId}`);
      res.status(201).json({
        message: 'Soumission créée avec succès',
        submissionId: result.insertId
      });
    } catch (error) {
      logger.error('Erreur lors de la création de la soumission:', error);
      res.status(500).json({ message: 'Erreur lors de la création de la soumission' });
    }
  }
);

// Obtenir les soumissions d'un exercice (pour les enseignants)
router.get('/exercise/:exerciseId',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const [submissions] = await pool.query(`
        SELECT s.*, u.name as student_name, u.email as student_email
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        WHERE s.exercise_id = ?
        ORDER BY s.created_at DESC
      `, [req.params.exerciseId]);

      res.json(submissions);
    } catch (error) {
      logger.error('Erreur lors de la récupération des soumissions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des soumissions' });
    }
  }
);

// Obtenir les soumissions d'un étudiant
router.get('/student/:studentId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Vérifier si l'utilisateur a accès à ces soumissions
      if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.studentId)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const [submissions] = await pool.query(`
        SELECT s.*, e.title as exercise_title
        FROM submissions s
        JOIN exercises e ON s.exercise_id = e.id
        WHERE s.student_id = ?
        ORDER BY s.created_at DESC
      `, [req.params.studentId]);

      res.json(submissions);
    } catch (error) {
      logger.error('Erreur lors de la récupération des soumissions:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des soumissions' });
    }
  }
);

// Corriger une soumission
router.post('/:submissionId/grade',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const submissionId = req.params.submissionId;
      const { grade, feedback } = req.body;

      // Vérifier si la soumission existe
      const [submissions] = await pool.query(
        'SELECT * FROM submissions WHERE id = ?',
        [submissionId]
      );

      if (submissions.length === 0) {
        return res.status(404).json({ message: 'Soumission non trouvée' });
      }

      // Mettre à jour la soumission
      await pool.query(
        'UPDATE submissions SET grade = ?, feedback = ?, status = ? WHERE id = ?',
        [grade, feedback, 'graded', submissionId]
      );

      logger.info(`Soumission ${submissionId} corrigée par l'enseignant ${req.user.id}`);
      res.json({ message: 'Soumission corrigée avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la correction de la soumission:', error);
      res.status(500).json({ message: 'Erreur lors de la correction de la soumission' });
    }
  }
);

// Corriger automatiquement une soumission
router.post('/:submissionId/auto-grade',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const submissionId = req.params.submissionId;

      // Récupérer la soumission et l'exercice
      const [submissions] = await pool.query(`
        SELECT s.*, e.content as exercise_content
        FROM submissions s
        JOIN exercises e ON s.exercise_id = e.id
        WHERE s.id = ?
      `, [submissionId]);

      if (submissions.length === 0) {
        return res.status(404).json({ message: 'Soumission non trouvé' });
      }

      const submission = submissions[0];

      // Récupérer les corrections modèles
      const [modelSolutions] = await pool.query(
        'SELECT content FROM model_solutions WHERE exercise_id = ?',
        [submission.exercise_id]
      );

      if (modelSolutions.length === 0) {
        return res.status(400).json({ message: 'Aucune correction modèle disponible' });
      }

      // Comparer avec les solutions modèles
      const comparisonResults = await Promise.all(
        modelSolutions.map(solution =>
          compareSolutions(submission.content, solution.content)
        )
      );

      // Calculer la note moyenne
      const grades = comparisonResults.map(result => {
        const gradeMatch = result.match(/Note sur 20: (\d+)/);
        return gradeMatch ? parseInt(gradeMatch[1]) : 0;
      });

      const averageGrade = grades.reduce((a, b) => a + b, 0) / grades.length;

      // Générer le feedback
      const feedback = await generateFeedback(
        submission.content,
        modelSolutions[0].content
      );

      // Mettre à jour la soumission
      await pool.query(
        'UPDATE submissions SET grade = ?, feedback = ?, status = ? WHERE id = ?',
        [averageGrade, feedback, 'graded', submissionId]
      );

      logger.info(`Soumission ${submissionId} corrigée automatiquement`);
      res.json({
        message: 'Soumission corrigée automatiquement',
        grade: averageGrade,
        feedback
      });
    } catch (error) {
      logger.error('Erreur lors de la correction automatique:', error);
      res.status(500).json({ message: 'Erreur lors de la correction automatique' });
    }
  }
);

// Vérifier le plagiat
router.post('/:submissionId/check-plagiarism',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const submissionId = req.params.submissionId;

      // Récupérer la soumission
      const [submissions] = await pool.query(
        'SELECT * FROM submissions WHERE id = ?',
        [submissionId]
      );

      if (submissions.length === 0) {
        return res.status(404).json({ message: 'Soumission non trouvé' });
      }

      const submission = submissions[0];

      // Récupérer les autres soumissions de l'exercice
      const [otherSubmissions] = await pool.query(
        'SELECT * FROM submissions WHERE exercise_id = ? AND id != ?',
        [submission.exercise_id, submissionId]
      );

      // Détecter le plagiat
      const plagiarismResults = await detectPlagiarism(
        submission.content,
        otherSubmissions.map(s => ({
          studentId: s.student_id,
          text: s.content
        }))
      );

      // Mettre à jour le score de plagiat
      const maxSimilarity = Math.max(...plagiarismResults.map(r => r.similarity));
      await pool.query(
        'UPDATE submissions SET plagiarism_score = ? WHERE id = ?',
        [maxSimilarity, submissionId]
      );

      logger.info(`Vérification de plagiat effectuée pour la soumission ${submissionId}`);
      res.json({
        message: 'Vérification de plagiat effectuée',
        results: plagiarismResults
      });
    } catch (error) {
      logger.error('Erreur lors de la vérification de plagiat:', error);
      res.status(500).json({ message: 'Erreur lors de la vérification de plagiat' });
    }
  }
);

module.exports = router; 