const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-coder';

// Fonction pour générer une réponse avec le modèle
const generateResponse = async (prompt, options = {}) => {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model: MODEL,
      prompt,
      stream: false,
      ...options
    });

    logger.info('Réponse générée avec succès');
    return response.data.response;
  } catch (error) {
    logger.error('Erreur lors de la génération de la réponse:', error);
    throw error;
  }
};

// Fonction pour analyser une requête SQL
const analyzeSQL = async (sqlQuery) => {
  try {
    const prompt = `Analyse la requête SQL suivante et fournis une évaluation détaillée :
    ${sqlQuery}
    
    Points à évaluer :
    1. Syntaxe correcte
    2. Performance
    3. Bonnes pratiques
    4. Suggestions d'amélioration`;

    const response = await generateResponse(prompt);
    return response;
  } catch (error) {
    logger.error('Erreur lors de l\'analyse SQL:', error);
    throw error;
  }
};

// Fonction pour comparer deux solutions
const compareSolutions = async (studentSolution, modelSolution) => {
  try {
    const prompt = `Compare les deux solutions suivantes et fournis une évaluation détaillée :
    
    Solution de l'étudiant :
    ${studentSolution}
    
    Solution modèle :
    ${modelSolution}
    
    Points à évaluer :
    1. Similarité conceptuelle
    2. Différences clés
    3. Points forts et faibles
    4. Note sur 20 avec justification`;

    const response = await generateResponse(prompt);
    return response;
  } catch (error) {
    logger.error('Erreur lors de la comparaison des solutions:', error);
    throw error;
  }
};

// Fonction pour générer des commentaires de correction
const generateFeedback = async (solution, modelSolution) => {
  try {
    const prompt = `Génère des commentaires de correction détaillés pour la solution suivante :
    
    Solution à corriger :
    ${solution}
    
    Solution modèle :
    ${modelSolution}
    
    Format attendu :
    1. Points positifs
    2. Points à améliorer
    3. Suggestions concrètes
    4. Ressources pour approfondir`;

    const response = await generateResponse(prompt);
    return response;
  } catch (error) {
    logger.error('Erreur lors de la génération des commentaires:', error);
    throw error;
  }
};

module.exports = {
  generateResponse,
  analyzeSQL,
  compareSolutions,
  generateFeedback
}; 