const axios = require('axios');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const BASE_URL = 'http://localhost:3001';

async function testLogin() {
  try {
    console.log('\n=== Test de connexion ===');
    const loginData = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    console.log('Données de connexion:', loginData);

    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    console.log('Réponse:', response.data);
  } catch (error) {
    console.error('Erreur:', error.response ? error.response.data : error.message);
  }
}

async function testHash() {
  const storedHash = '$2a$10$Ak6tPty32LG98VahxFscvepqGNUpMlcG6Srz0iQfNdb1qPtU03X6e';
  const password = 'admin123';
  
  const isMatch = await bcrypt.compare(password, storedHash);
  console.log('Le mot de passe correspond:', isMatch);
  
  if (!isMatch) {
    // Générer un nouveau hash avec le même sel
    const salt = storedHash.split('$')[3].substring(0, 22);
    const newHash = await bcrypt.hash(password, 10, { salt });
    console.log('Nouveau hash généré:', newHash);
  }
}

async function updateAdminPassword() {
  try {
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ds_sgbd'
    });

    await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@example.com']
    );

    console.log('Mot de passe administrateur mis à jour avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

async function updateProfessorPassword() {
  try {
    const password = 'prof123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ds_sgbd'
    });

    await pool.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'professor@example.com']
    );

    console.log('Mot de passe professeur mis à jour avec succès');

    // Test de connexion
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'professor@example.com',
      password: 'prof123'
    });
    console.log('Réponse:', response.data);

    process.exit(0);
  } catch (error) {
    console.error('Erreur:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

async function testRegisterStudent() {
  try {
    const studentData = {
      email: 'etudiant3@example.com',
      password: 'etudiant123',
      username: 'etudiant3',
      nom: 'Diallo',
      prenom: 'Fatou',
      matricule: 'MAT2024003',
      telephone: '771234567',
      departement: 'Informatique',
      classe: 'M1',
      filiere: 'GLSI',
      role: 'student'
    };

    console.log('\n=== Test d\'inscription d\'un nouvel étudiant ===');
    console.log('Données envoyées:', studentData);

    const response = await axios.post(`${BASE_URL}/api/auth/register`, studentData);
    console.log('\nRéponse du serveur:', response.data);

    if (response.data.token) {
      console.log('\n=== Test de connexion avec le nouveau compte ===');
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: studentData.email,
        password: studentData.password
      });
      console.log('Connexion réussie:', loginResponse.data);
    }

  } catch (error) {
    console.error('\nErreur:', error.response ? error.response.data : error.message);
  }
}

async function testAllLogins() {
  try {
    console.log('URL de base:', BASE_URL);

    console.log('\n=== Test de connexion administrateur ===');
    const adminLoginData = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    console.log('URL complète:', `${BASE_URL}/api/auth/login`);
    console.log('Données de connexion admin:', adminLoginData);
    try {
      const adminResponse = await axios.post(`${BASE_URL}/api/auth/login`, adminLoginData);
      console.log('Réponse admin:', adminResponse.data);
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        code: error.code
      });
    }

    console.log('\n=== Test de connexion professeur ===');
    const profLoginData = {
      email: 'professor@example.com',
      password: 'prof123'
    };
    console.log('Données de connexion professeur:', profLoginData);
    try {
      const profResponse = await axios.post(`${BASE_URL}/api/auth/login`, profLoginData);
      console.log('Réponse professeur:', profResponse.data);
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        code: error.code
      });
    }

    console.log('\n=== Test de connexion étudiant ===');
    const studentLoginData = {
      email: 'etudiant3@example.com',
      password: 'etudiant123'
    };
    console.log('Données de connexion étudiant:', studentLoginData);
    try {
      const studentResponse = await axios.post(`${BASE_URL}/api/auth/login`, studentLoginData);
      console.log('Réponse étudiant:', studentResponse.data);
    } catch (error) {
      console.error('Erreur détaillée:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        code: error.code
      });
    }

  } catch (error) {
    console.error('Erreur générale:', error.message);
  }
}

// Exécuter les tests dans l'ordre
async function runTests() {
  try {
    console.log('\n=== Début des tests ===');
    
    // Test de connexion pour tous les utilisateurs
    await testAllLogins();
    
    console.log('\n=== Fin des tests ===');
  } catch (error) {
    console.error('\nErreur lors des tests:', error);
  }
}

runTests(); 