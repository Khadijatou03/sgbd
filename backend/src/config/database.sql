USE ds_sgbd;

-- Désactiver les contraintes de clé étrangère
SET FOREIGN_KEY_CHECKS=0;

-- Création de la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('Student', 'Professor', 'Admin') NOT NULL DEFAULT 'Student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Création de la table etudiant si elle n'existe pas
CREATE TABLE IF NOT EXISTS etudiant (
  id INT PRIMARY KEY AUTO_INCREMENT,
  matricule VARCHAR(50) NOT NULL UNIQUE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  email VARCHAR(255) NOT NULL UNIQUE,
  departement VARCHAR(100) NOT NULL,
  classe VARCHAR(50) NOT NULL,
  filiere VARCHAR(100) NOT NULL,
  note DECIMAL(5,2) DEFAULT NULL,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (email) REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Réactiver les contraintes de clé étrangère
SET FOREIGN_KEY_CHECKS=1; 