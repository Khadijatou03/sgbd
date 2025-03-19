-- Désactiver les contraintes de clé étrangère
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer la base de données si elle existe
DROP DATABASE IF EXISTS ds_sgbd;

-- Créer la base de données
CREATE DATABASE ds_sgbd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE ds_sgbd;

-- Table users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'professor', 'admin') DEFAULT 'student',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified TINYINT(1) DEFAULT 0,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table etudiant
CREATE TABLE etudiant (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    departement VARCHAR(100) NOT NULL,
    classe VARCHAR(50) NOT NULL,
    filiere VARCHAR(100) NOT NULL,
    note DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des sujets
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date_publication DATETIME NOT NULL,
    date_echeance DATETIME NOT NULL,
    status ENUM('active', 'archived') DEFAULT 'active',
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des corrections
CREATE TABLE IF NOT EXISTS corrections (
    id VARCHAR(36) PRIMARY KEY,
    id_sujet VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    note DECIMAL(5,2) NULL,
    feedback TEXT NULL,
    status ENUM('pending', 'corrected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sujet) REFERENCES subjects(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des exercices
CREATE TABLE IF NOT EXISTS exercises (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    initial_code TEXT NULL,
    solution TEXT NULL,
    test_cases JSON NULL,
    created_by VARCHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des soumissions
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(36) PRIMARY KEY,
    exercise_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failure')),
    results JSON NULL,
    score DECIMAL(5,2) NULL,
    feedback TEXT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Réactiver les contraintes de clé étrangère
SET FOREIGN_KEY_CHECKS = 1;

-- Insérer un utilisateur admin par défaut
INSERT INTO users (id, username, email, password, role) VALUES 
(UUID(), 'admin', 'admin@example.com', '$2a$10$NVsfXDWMgMqV9yGBRPkWO.Tn4ZegR0s.9.JUZRzMQDxFhaQF4EoqC', 'admin');

-- Insérer un utilisateur professeur par défaut
INSERT INTO users (id, username, email, password, role) VALUES 
(UUID(), 'professor', 'professor@example.com', '$2a$10$NVsfXDWMgMqV9yGBRPkWO.Tn4ZegR0s.9.JUZRzMQDxFhaQF4EoqC', 'professor'); 