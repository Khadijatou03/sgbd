const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Fonction pour exécuter le code SQL
const executeCode = async (code, databaseConfig) => {
  try {
    // Créer un fichier temporaire pour le code SQL
    const tempFile = path.join(__dirname, `temp_${Date.now()}.sql`);
    await fs.writeFile(tempFile, code);

    // Construire la commande MySQL
    const command = `mysql -u${databaseConfig.user} -p${databaseConfig.password} ${databaseConfig.database} < "${tempFile}"`;

    return new Promise((resolve, reject) => {
      exec(command, async (error, stdout, stderr) => {
        // Supprimer le fichier temporaire
        try {
          await fs.unlink(tempFile);
        } catch (unlinkError) {
          console.error('Erreur lors de la suppression du fichier temporaire:', unlinkError);
        }

        if (error) {
          reject(error);
          return;
        }

        if (stderr) {
          reject(new Error(stderr));
          return;
        }

        resolve(stdout);
      });
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  executeCode
}; 