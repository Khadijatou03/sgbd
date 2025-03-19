const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/subjects');
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
  // Extraire uniquement le nom du fichier et le dossier subjects
  const parts = filePath.split('subjects');
  if (parts.length > 1) {
    return `/uploads/subjects${parts[1].replace(/\\/g, '/')}`;
  }
  return null;
};

// Récupérer tous les sujets (pour les étudiants)
exports.getAllSubjects = async (req, res) => {
  try {
    const isStudent = req.user?.role === 'student';
    let query = `
      SELECT s.*, u.username as professor_name 
      FROM subjects s
      JOIN users u ON s.created_by = u.id
    `;

    // Construire la clause WHERE
    let whereClause = [];
    if (isStudent) {
      whereClause.push('s.date_echeance > NOW()');
    }
    if (req.user?.role === 'professor') {
      whereClause.push(`s.created_by = '${req.user.id}'`);
    }

    if (whereClause.length > 0) {
      query += ` WHERE ${whereClause.join(' AND ')}`;
    }

    query += ` ORDER BY s.created_at DESC`;

    const [subjects] = await pool.query(query);

    // Formater les chemins de fichiers dans les résultats
    subjects.forEach(subject => {
      if (subject.file_path) {
        subject.file_path = formatFilePath(subject.file_path);
      }
    });

    res.json(subjects);

  } catch (error) {
    logger.error('Erreur lors de la récupération des sujets', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la récupération des sujets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Récupérer un sujet spécifique
exports.getSubject = async (req, res) => {
  try {
    const [subjects] = await pool.query(
      `SELECT s.*, u.username as professor_name 
       FROM subjects s 
       JOIN users u ON s.created_by = u.id 
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (subjects.length === 0) {
      return res.status(404).json({
        message: 'Sujet non trouvé'
      });
    }

    res.json(subjects[0]);

  } catch (error) {
    logger.error('Erreur lors de la récupération du sujet', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la récupération du sujet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Créer un nouveau sujet (pour les professeurs)
exports.createSubject = async (req, res) => {
  try {
    // Accepter les deux versions des noms de champs (FR et EN)
    const titre = req.body.title || req.body.titre;
    const consigne = req.body.description || req.body.consigne;
    const date_echeance = req.body.due_date || req.body.date_echeance;
    const created_by = req.user.id;
    const file = req.file;

    // Vérifier les données requises
    if (!titre || !consigne || !date_echeance) {
      return res.status(400).json({
        message: 'Veuillez fournir tous les champs requis'
      });
    }

    let file_path = null;
    if (file) {
      file_path = formatFilePath(file.path);
      if (!file_path) {
        return res.status(400).json({
          message: 'Erreur lors du traitement du fichier'
        });
      }
    }

    const subject_id = uuidv4();

    // Insérer le sujet dans la base de données
    await pool.query(
      'INSERT INTO subjects (id, titre, consigne, date_echeance, file_path, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [subject_id, titre, consigne, date_echeance, file_path, created_by]
    );

    logger.info('Nouveau sujet créé', { subject_id, created_by });

    res.status(201).json({
      message: 'Sujet créé avec succès',
      subject: {
        id: subject_id,
        titre,
        consigne,
        date_echeance,
        file_path,
        created_by
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la création du sujet', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la création du sujet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mettre à jour un sujet (pour les professeurs)
exports.updateSubject = async (req, res) => {
  try {
    // Accepter les deux versions des noms de champs (FR et EN)
    const titre = req.body.title || req.body.titre;
    const consigne = req.body.description || req.body.consigne;
    const date_echeance = req.body.due_date || req.body.date_echeance;
    const subject_id = req.params.id;
    const created_by = req.user.id;

    // Vérifier si le sujet existe et appartient au professeur
    const [subjects] = await pool.query(
      'SELECT * FROM subjects WHERE id = ? AND created_by = ?',
      [subject_id, created_by]
    );

    if (subjects.length === 0) {
      return res.status(404).json({
        message: 'Sujet non trouvé ou non autorisé'
      });
    }

    const file = req.file;
    const file_path = file ? formatFilePath(file.path) : subjects[0].file_path;

    // Mettre à jour le sujet
    await pool.query(
      'UPDATE subjects SET titre = ?, consigne = ?, date_echeance = ?, file_path = ? WHERE id = ?',
      [titre, consigne, date_echeance, file_path, subject_id]
    );

    logger.info('Sujet mis à jour', { subject_id, created_by });

    res.json({
      message: 'Sujet mis à jour avec succès',
      subject: {
        id: subject_id,
        titre,
        consigne,
        date_echeance,
        file_path,
        created_by
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la mise à jour du sujet', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la mise à jour du sujet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Supprimer un sujet (pour les professeurs)
exports.deleteSubject = async (req, res) => {
  try {
    const subject_id = req.params.id;
    const created_by = req.user.id;

    // Vérifier si le sujet existe et appartient au professeur
    const [subjects] = await pool.query(
      'SELECT * FROM subjects WHERE id = ? AND created_by = ?',
      [subject_id, created_by]
    );

    if (subjects.length === 0) {
      return res.status(404).json({
        message: 'Sujet non trouvé ou non autorisé'
      });
    }

    // Supprimer le sujet
    await pool.query('DELETE FROM subjects WHERE id = ?', [subject_id]);

    logger.info('Sujet supprimé', { subject_id, created_by });

    res.json({
      message: 'Sujet supprimé avec succès'
    });

  } catch (error) {
    logger.error('Erreur lors de la suppression du sujet', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la suppression du sujet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 