const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('Connexion à la base de données...');
    
    // Création de la base de données si elle n'existe pas
    await pool.query('CREATE DATABASE IF NOT EXISTS ds_sgbd');
    console.log('Base de données ds_sgbd créée ou déjà existante');
    
    // Utilisation de la base de données
    await pool.query('USE ds_sgbd');
    console.log('Utilisation de la base de données ds_sgbd');

    // Création de la table users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('professor', 'student') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table users créée');

    // Création de la table etudiant
    await pool.query(`
      CREATE TABLE IF NOT EXISTS etudiant (
        matricule VARCHAR(20) PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20),
        email VARCHAR(255) NOT NULL UNIQUE,
        departement VARCHAR(100),
        classe VARCHAR(50),
        filiere VARCHAR(100),
        note DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (email) REFERENCES users(email)
      )
    `);
    console.log('Table etudiant créée');

    // Création de la table subjects
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(36) PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        consigne TEXT NOT NULL,
        date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_echeance TIMESTAMP NULL,
        file_path VARCHAR(255) NULL,
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    console.log('Table subjects créée');

    // Création de la table submissions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(36) PRIMARY KEY,
        subject_id VARCHAR(36) NOT NULL,
        student_id VARCHAR(20) NOT NULL,
        file_path VARCHAR(255) NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        note DECIMAL(5,2) NULL,
        commentaire TEXT NULL,
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (student_id) REFERENCES etudiant(matricule)
      )
    `);
    console.log('Table submissions créée');

    // Création de la table archives
    await pool.query(`
      CREATE TABLE IF NOT EXISTS archives (
        id VARCHAR(36) PRIMARY KEY,
        subject_id VARCHAR(36) NOT NULL,
        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
      )
    `);
    console.log('Table archives créée');

    // Hash du mot de passe admin123
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Insertion de l'utilisateur admin
    await pool.query(`
      INSERT INTO users (id, username, email, password, role) 
      VALUES (UUID(), ?, ?, ?, 'admin')
      ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, ['admin', 'admin@example.com', hashedPassword]);
    
    // Hash du mot de passe professor123
    const professorSalt = await bcrypt.genSalt(10);
    const professorHashedPassword = await bcrypt.hash('professor123', professorSalt);

    // Insertion de l'utilisateur professeur
    await pool.query(`
      INSERT INTO users (id, username, email, password, role) 
      VALUES (UUID(), ?, ?, ?, 'professor')
      ON DUPLICATE KEY UPDATE password = VALUES(password)
    `, ['professor', 'professor@example.com', professorHashedPassword]);
    
    console.log('Utilisateur admin créé ou mis à jour');
    console.log('Utilisateur professeur créé ou mis à jour');
    console.log('Initialisation de la base de données terminée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

console.log('Démarrage du script d\'initialisation...');
initializeDatabase(); 