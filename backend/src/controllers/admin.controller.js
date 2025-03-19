const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Créer un nouveau professeur
exports.createProfessor = async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      nom,
      prenom,
      telephone,
      departement
    } = req.body;

    // Vérifier si l'email existe déjà
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, 'professor']
    );

    // Créer le professeur
    const professorId = uuidv4();
    await pool.query(
      'INSERT INTO professor (id, user_id, nom, prenom, telephone, departement) VALUES (?, ?, ?, ?, ?, ?)',
      [professorId, userId, nom, prenom, telephone, departement]
    );

    logger.info('Nouveau professeur créé', { userId, email });

    res.status(201).json({
      message: 'Professeur créé avec succès',
      professor: {
        id: userId,
        email,
        username,
        nom,
        prenom,
        telephone,
        departement
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la création du professeur', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la création du professeur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.email, u.username, u.role, u.created_at,
             CASE 
               WHEN u.role = 'student' THEN e.matricule
               WHEN u.role = 'professor' THEN p.departement
             END as additional_info
      FROM users u
      LEFT JOIN etudiant e ON u.id = e.user_id
      LEFT JOIN professor p ON u.id = p.user_id
      ORDER BY u.created_at DESC
    `);

    res.json(users);

  } catch (error) {
    logger.error('Erreur lors de la récupération des utilisateurs', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la récupération des utilisateurs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Récupérer les statistiques
exports.getStats = async (req, res) => {
  try {
    // Nombre total d'étudiants
    const [students] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['student']
    );

    // Nombre total de professeurs
    const [professors] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['professor']
    );

    // Nombre total de sujets
    const [subjects] = await pool.query(
      'SELECT COUNT(*) as count FROM subjects'
    );

    // Nombre total de soumissions
    const [submissions] = await pool.query(
      'SELECT COUNT(*) as count FROM submissions'
    );

    // Moyenne des notes
    const [grades] = await pool.query(
      'SELECT AVG(grade) as average FROM submissions WHERE grade IS NOT NULL'
    );

    res.json({
      students: students[0].count,
      professors: professors[0].count,
      subjects: subjects[0].count,
      submissions: submissions[0].count,
      averageGrade: grades[0].average || 0
    });

  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques', { error: error.message });
    res.status(500).json({
      message: 'Erreur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 