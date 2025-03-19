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

// Obtenir les statistiques globales
router.get('/global',
  passport.authenticate('jwt', { session: false }),
  checkRole(['admin']),
  async (req, res) => {
    try {
      const [stats] = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
          (SELECT COUNT(*) FROM users WHERE role = 'teacher') as total_teachers,
          (SELECT COUNT(*) FROM exercises) as total_exercises,
          (SELECT COUNT(*) FROM submissions) as total_submissions,
          (SELECT AVG(grade) FROM submissions WHERE grade IS NOT NULL) as average_grade,
          (SELECT COUNT(*) FROM submissions WHERE plagiarism_score > 0.8) as plagiarism_count
      `);

      res.json(stats[0]);
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques globales:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques globales' });
    }
  }
);

// Obtenir les statistiques d'un exercice
router.get('/exercise/:exerciseId',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const [stats] = await pool.query(`
        SELECT
          COUNT(*) as total_submissions,
          AVG(grade) as average_grade,
          MAX(grade) as max_grade,
          MIN(grade) as min_grade,
          COUNT(CASE WHEN grade >= 10 THEN 1 END) as passing_count,
          COUNT(CASE WHEN grade < 10 THEN 1 END) as failing_count,
          AVG(plagiarism_score) as average_plagiarism_score,
          COUNT(CASE WHEN plagiarism_score > 0.8 THEN 1 END) as plagiarism_count
        FROM submissions
        WHERE exercise_id = ?
      `, [req.params.exerciseId]);

      // Obtenir la distribution des notes
      const [gradeDistribution] = await pool.query(`
        SELECT
          CASE
            WHEN grade >= 16 THEN '16-20'
            WHEN grade >= 12 THEN '12-15'
            WHEN grade >= 8 THEN '8-11'
            ELSE '0-7'
          END as grade_range,
          COUNT(*) as count
        FROM submissions
        WHERE exercise_id = ? AND grade IS NOT NULL
        GROUP BY grade_range
        ORDER BY grade_range
      `, [req.params.exerciseId]);

      res.json({
        ...stats[0],
        gradeDistribution
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques de l\'exercice:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques de l\'exercice' });
    }
  }
);

// Obtenir les statistiques d'un étudiant
router.get('/student/:studentId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Vérifier si l'utilisateur a accès à ces statistiques
      if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.studentId)) {
        return res.status(403).json({ message: 'Accès non autorisé' });
      }

      const [stats] = await pool.query(`
        SELECT
          COUNT(*) as total_submissions,
          AVG(grade) as average_grade,
          MAX(grade) as max_grade,
          MIN(grade) as min_grade,
          COUNT(CASE WHEN grade >= 10 THEN 1 END) as passing_count,
          COUNT(CASE WHEN grade < 10 THEN 1 END) as failing_count,
          AVG(plagiarism_score) as average_plagiarism_score
        FROM submissions
        WHERE student_id = ?
      `, [req.params.studentId]);

      // Obtenir l'évolution des notes dans le temps
      const [gradeEvolution] = await pool.query(`
        SELECT
          DATE(created_at) as date,
          AVG(grade) as average_grade
        FROM submissions
        WHERE student_id = ? AND grade IS NOT NULL
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [req.params.studentId]);

      res.json({
        ...stats[0],
        gradeEvolution
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques de l\'étudiant:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques de l\'étudiant' });
    }
  }
);

// Obtenir les statistiques d'un enseignant
router.get('/teacher/:teacherId',
  passport.authenticate('jwt', { session: false }),
  checkRole(['admin']),
  async (req, res) => {
    try {
      const [stats] = await pool.query(`
        SELECT
          COUNT(DISTINCT e.id) as total_exercises,
          COUNT(s.id) as total_submissions,
          AVG(s.grade) as average_grade,
          COUNT(CASE WHEN s.grade >= 10 THEN 1 END) as passing_count,
          COUNT(CASE WHEN s.grade < 10 THEN 1 END) as failing_count,
          AVG(s.plagiarism_score) as average_plagiarism_score
        FROM exercises e
        LEFT JOIN submissions s ON e.id = s.exercise_id
        WHERE e.teacher_id = ?
      `, [req.params.teacherId]);

      // Obtenir les statistiques par exercice
      const [exerciseStats] = await pool.query(`
        SELECT
          e.id,
          e.title,
          COUNT(s.id) as submission_count,
          AVG(s.grade) as average_grade,
          COUNT(CASE WHEN s.grade >= 10 THEN 1 END) as passing_count,
          COUNT(CASE WHEN s.grade < 10 THEN 1 END) as failing_count
        FROM exercises e
        LEFT JOIN submissions s ON e.id = s.exercise_id
        WHERE e.teacher_id = ?
        GROUP BY e.id, e.title
        ORDER BY e.created_at DESC
      `, [req.params.teacherId]);

      res.json({
        ...stats[0],
        exerciseStats
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques de l\'enseignant:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques de l\'enseignant' });
    }
  }
);

// Mettre à jour les statistiques d'un exercice
router.post('/exercise/:exerciseId/update',
  passport.authenticate('jwt', { session: false }),
  checkRole(['teacher', 'admin']),
  async (req, res) => {
    try {
      const exerciseId = req.params.exerciseId;

      // Calculer les nouvelles statistiques
      const [stats] = await pool.query(`
        SELECT
          COUNT(*) as total_submissions,
          AVG(grade) as average_grade,
          MAX(grade) as max_grade,
          MIN(grade) as min_grade
        FROM submissions
        WHERE exercise_id = ? AND grade IS NOT NULL
      `, [exerciseId]);

      // Mettre à jour la table des statistiques
      await pool.query(`
        INSERT INTO statistics (
          exercise_id,
          total_submissions,
          average_grade,
          max_grade,
          min_grade
        ) VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_submissions = VALUES(total_submissions),
          average_grade = VALUES(average_grade),
          max_grade = VALUES(max_grade),
          min_grade = VALUES(min_grade)
      `, [
        exerciseId,
        stats[0].total_submissions,
        stats[0].average_grade,
        stats[0].max_grade,
        stats[0].min_grade
      ]);

      logger.info(`Statistiques mises à jour pour l'exercice ${exerciseId}`);
      res.json({ message: 'Statistiques mises à jour avec succès' });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour des statistiques:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour des statistiques' });
    }
  }
);

module.exports = router; 