const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  // Configuration de la base de données
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    // Création de la base de données si elle n'existe pas
    await connection.query('CREATE DATABASE IF NOT EXISTS ds_sgbd');
    console.log('Base de données créée ou déjà existante');

    // Utilisation de la base de données
    await connection.query('USE ds_sgbd');
    console.log('Utilisation de la base de données ds_sgbd');

    // Lecture du fichier SQL
    const sqlFile = path.join(__dirname, 'database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Exécution des commandes SQL
    await connection.query(sql);
    console.log('Structure de la base de données créée avec succès');

  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Exécution du script
initializeDatabase()
  .then(() => {
    console.log('Initialisation de la base de données terminée');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur:', error);
    process.exit(1);
  }); 