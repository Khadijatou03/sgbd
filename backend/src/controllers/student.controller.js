const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload des réponses
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
});

// Inscription d'un étudiant
const registerStudent = async (req, res) => {
  try {
    console.log('\n=== Début de l\'inscription d\'un étudiant ===');
    const { matricule, nom, prenom, telephone, email, password, departement, classe, filiere } = req.body;

    // Vérifier si l'email existe déjà
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier si le matricule existe déjà
    const [existingStudents] = await pool.query('SELECT * FROM etudiant WHERE matricule = ?', [matricule]);
    if (existingStudents.length > 0) {
      return res.status(400).json({ message: 'Ce matricule est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur dans la table users
    const [userResult] = await pool.query(
      'INSERT INTO users (id, username, email, password, role) VALUES (UUID(), ?, ?, ?, ?)',
      [email, email, hashedPassword, 'student']
    );

    // Récupérer l'ID de l'utilisateur créé
    const [newUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (newUser.length === 0) {
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }

    // Créer l'étudiant dans la table etudiant
    await pool.query(
      'INSERT INTO etudiant (id, user_id, matricule, nom, prenom, telephone, departement, classe, filiere) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)',
      [newUser[0].id, matricule, nom, prenom, telephone, departement, classe, filiere]
    );

    console.log('✅ Étudiant inscrit avec succès');
    console.log('=== Fin de l\'inscription d\'un étudiant ===\n');

    res.status(201).json({ message: 'Étudiant inscrit avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

// Soumettre une réponse
const submitResponse = async (req, res) => {
  try {
    console.log('\n=== Début de la soumission d\'une réponse ===');
    const { subject_id } = req.body;
    const student_id = req.user.matricule;

    // Vérifier si le sujet existe et n'est pas archivé
    const [subjects] = await pool.query(`
      SELECT s.*, 
        DATEDIFF(s.date_echeance, NOW()) as jours_restants
      FROM subjects s
      LEFT JOIN archives a ON s.id = a.subject_id
      WHERE s.id = ? AND a.id IS NULL
    `, [subject_id]);

    if (subjects.length === 0) {
      return res.status(404).json({ message: 'Sujet non trouvé ou déjà archivé' });
    }

    const subject = subjects[0];
    if (subject.jours_restants < 0) {
      return res.status(400).json({ message: 'La date limite est dépassée' });
    }

    // Vérifier si l'étudiant a déjà soumis une réponse
    const [existingSubmissions] = await pool.query(
      'SELECT * FROM submissions WHERE subject_id = ? AND student_id = ?',
      [subject_id, student_id]
    );

    if (existingSubmissions.length > 0) {
      return res.status(400).json({ message: 'Vous avez déjà soumis une réponse' });
    }

    const filePath = req.file ? `/uploads/submissions/${req.file.filename}` : null;

    // Créer la soumission
    await pool.query(
      'INSERT INTO submissions (id, subject_id, student_id, file_path) VALUES (UUID(), ?, ?, ?)',
      [subject_id, student_id, filePath]
    );

    console.log('✅ Réponse soumise avec succès');
    console.log('=== Fin de la soumission d\'une réponse ===\n');

    res.status(201).json({ message: 'Réponse soumise avec succès' });
  } catch (error) {
    console.error('❌ Erreur lors de la soumission:', error);
    res.status(500).json({ message: 'Erreur lors de la soumission' });
  }
};

// Récupérer les sujets disponibles pour un étudiant
const getAvailableSubjects = async (req, res) => {
  try {
    console.log('\n=== Récupération des sujets disponibles ===');
    const student_id = req.user.matricule;

    const [subjects] = await pool.query(`
      SELECT s.*, 
        DATEDIFF(s.date_echeance, NOW()) as jours_restants,
        CASE 
          WHEN sub.id IS NOT NULL THEN 'submitted'
          WHEN s.date_echeance < NOW() THEN 'expired'
          ELSE 'active'
        END as status
      FROM subjects s
      LEFT JOIN archives a ON s.id = a.subject_id
      LEFT JOIN submissions sub ON s.id = sub.subject_id AND sub.student_id = ?
      WHERE a.id IS NULL
      ORDER BY s.date_publication DESC
    `, [student_id]);

    console.log(`✅ ${subjects.length} sujets récupérés`);
    console.log('=== Fin de la récupération des sujets ===\n');

    res.json(subjects);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des sujets:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sujets' });
  }
};

// Récupérer les archives
const getArchives = async (req, res) => {
  try {
    console.log('\n=== Récupération des archives ===');
    const student_id = req.user.matricule;

    const [archives] = await pool.query(`
      SELECT s.*, 
        CASE 
          WHEN sub.id IS NOT NULL THEN 'submitted'
          WHEN s.date_echeance < NOW() THEN 'expired'
          ELSE 'active'
        END as status
      FROM subjects s
      JOIN archives a ON s.id = a.subject_id
      LEFT JOIN submissions sub ON s.id = sub.subject_id AND sub.student_id = ?
      ORDER BY a.archived_at DESC
    `, [student_id]);

    console.log(`✅ ${archives.length} archives récupérées`);
    console.log('=== Fin de la récupération des archives ===\n');

    res.json(archives);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des archives:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des archives' });
  }
};

// Récupérer les notes d'un étudiant
const getStudentGrades = async (req, res) => {
  try {
    console.log('\n=== Récupération des notes ===');
    const student_id = req.user.matricule;

    const [grades] = await pool.query(`
      SELECT s.titre, sub.note, sub.commentaire, sub.submitted_at
      FROM submissions sub
      JOIN subjects s ON sub.subject_id = s.id
      WHERE sub.student_id = ? AND sub.note IS NOT NULL
      ORDER BY sub.submitted_at DESC
    `, [student_id]);

    console.log(`✅ ${grades.length} notes récupérées`);
    console.log('=== Fin de la récupération des notes ===\n');

    res.json(grades);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des notes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notes' });
  }
};

module.exports = {
  upload,
  registerStudent,
  submitResponse,
  getAvailableSubjects,
  getArchives,
  getStudentGrades
}; 