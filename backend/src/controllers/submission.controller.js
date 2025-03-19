const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/submissions');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
}).single('file');

// Fonction utilitaire pour formater le chemin du fichier
const formatFilePath = (filePath) => {
  if (!filePath) return null;
  const parts = filePath.split('submissions');
  if (parts.length > 1) {
    return `/uploads/submissions${parts[1].replace(/\\/g, '/')}`;
  }
  return null;
};

// Récupérer les soumissions d'un étudiant
exports.getStudentSubmissions = async (req, res) => {
  try {
    const student_id = req.user.id;

    const [submissions] = await pool.query(
      `SELECT s.*, sub.title as subject_title, sub.description as subject_description, u.username as professor_name
       FROM submissions s
       JOIN subjects sub ON s.subject_id = sub.id
       JOIN users u ON sub.professor_id = u.id
       WHERE s.student_id = ?
       ORDER BY s.submitted_at DESC`,
      [student_id]
    );

    // Formater les chemins de fichiers
    submissions.forEach(submission => {
      if (submission.file_path) {
        submission.file_path = formatFilePath(submission.file_path);
      }
    });

    res.json(submissions);

  } catch (error) {
    logger.error('Erreur lors de la récupération des soumissions', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la récupération des soumissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Créer une nouvelle soumission
exports.createSubmission = async (req, res) => {
  try {
    const { subject_id } = req.body;
    const student_id = req.user.id;
    const file = req.file;

    if (!subject_id || !file) {
      return res.status(400).json({
        message: 'Veuillez fournir tous les champs requis'
      });
    }

    // Vérifier si l'étudiant a déjà soumis pour ce sujet
    const [existingSubmissions] = await pool.query(
      'SELECT * FROM submissions WHERE subject_id = ? AND student_id = ?',
      [subject_id, student_id]
    );

    if (existingSubmissions.length > 0) {
      return res.status(400).json({
        message: 'Vous avez déjà soumis un devoir pour ce sujet'
      });
    }

    const file_path = formatFilePath(file.path);
    const submission_id = uuidv4();

    await pool.query(
      'INSERT INTO submissions (id, subject_id, student_id, file_path) VALUES (?, ?, ?, ?)',
      [submission_id, subject_id, student_id, file_path]
    );

    logger.info('Nouvelle soumission créée', { submission_id, student_id, subject_id });

    res.status(201).json({
      message: 'Soumission créée avec succès',
      submission: {
        id: submission_id,
        subject_id,
        student_id,
        file_path
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la création de la soumission', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la création de la soumission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Récupérer les soumissions pour un professeur
exports.getProfessorSubmissions = async (req, res) => {
  try {
    const professor_id = req.user.id;

    const [submissions] = await pool.query(
      `SELECT s.*, sub.title as subject_title, u.username as student_name
       FROM submissions s
       JOIN subjects sub ON s.subject_id = sub.id
       JOIN users u ON s.student_id = u.id
       WHERE sub.professor_id = ?
       ORDER BY s.submitted_at DESC`,
      [professor_id]
    );

    // Formater les chemins de fichiers
    submissions.forEach(submission => {
      if (submission.file_path) {
        submission.file_path = formatFilePath(submission.file_path);
      }
    });

    res.json(submissions);

  } catch (error) {
    logger.error('Erreur lors de la récupération des soumissions', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la récupération des soumissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Noter une soumission
exports.gradeSubmission = async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission_id = req.params.id;
    const professor_id = req.user.id;

    if (!grade) {
      return res.status(400).json({
        message: 'Veuillez fournir une note'
      });
    }

    // Vérifier si la soumission existe et appartient à un sujet du professeur
    const [submissions] = await pool.query(
      `SELECT s.* FROM submissions s
       JOIN subjects sub ON s.subject_id = sub.id
       WHERE s.id = ? AND sub.professor_id = ?`,
      [submission_id, professor_id]
    );

    if (submissions.length === 0) {
      return res.status(404).json({
        message: 'Soumission non trouvée ou non autorisée'
      });
    }

    // Mettre à jour la note
    await pool.query(
      'UPDATE submissions SET grade = ?, feedback = ? WHERE id = ?',
      [grade, feedback, submission_id]
    );

    logger.info('Soumission notée', { submission_id, professor_id, grade });

    res.json({
      message: 'Note attribuée avec succès',
      submission: {
        id: submission_id,
        grade,
        feedback
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la notation de la soumission', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la notation de la soumission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 