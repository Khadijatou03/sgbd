-- Création de la base de données
CREATE DATABASE IF NOT EXISTS ds_sgbd;
USE ds_sgbd;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL DEFAULT 'student',
    google_id VARCHAR(255),
    github_id VARCHAR(255),
    microsoft_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des exercices
CREATE TABLE IF NOT EXISTS exercises (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    teacher_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- Table des corrections modèles
CREATE TABLE IF NOT EXISTS model_solutions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Table des soumissions d'étudiants
CREATE TABLE IF NOT EXISTS submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_id INT NOT NULL,
    student_id INT NOT NULL,
    content TEXT,
    file_url VARCHAR(255),
    grade DECIMAL(4,2),
    feedback TEXT,
    plagiarism_score DECIMAL(4,2),
    status ENUM('pending', 'graded', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des statistiques
CREATE TABLE IF NOT EXISTS statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exercise_id INT NOT NULL,
    total_submissions INT DEFAULT 0,
    average_grade DECIMAL(4,2),
    max_grade DECIMAL(4,2),
    min_grade DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

-- Table des logs
CREATE TABLE IF NOT EXISTS logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour optimiser les performances
CREATE INDEX idx_exercises_teacher ON exercises(teacher_id);
CREATE INDEX idx_submissions_exercise ON submissions(exercise_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_model_solutions_exercise ON model_solutions(exercise_id);
CREATE INDEX idx_statistics_exercise ON statistics(exercise_id);
CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_action ON logs(action);

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (email, password, name, role) 
VALUES ('admin@example.com', '$2a$10$YourHashedPasswordHere', 'Administrateur', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin'; 