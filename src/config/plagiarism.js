const natural = require('natural');
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

// Fonction pour calculer la similarité de Jaccard
const calculateJaccardSimilarity = (set1, set2) => {
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
};

// Fonction pour extraire les tokens d'un texte
const extractTokens = (text) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return new Set(tokens.filter(token => token.length > 2));
};

// Fonction pour calculer le TF-IDF
const calculateTFIDF = (documents) => {
  const tfidf = new natural.TfIdf();
  
  documents.forEach(doc => {
    tfidf.addDocument(doc);
  });

  return tfidf;
};

// Fonction pour détecter le plagiat
const detectPlagiarism = async (studentSolution, otherSolutions) => {
  try {
    const results = [];
    const studentTokens = extractTokens(studentSolution);
    
    for (const solution of otherSolutions) {
      const solutionTokens = extractTokens(solution.text);
      const similarity = calculateJaccardSimilarity(studentTokens, solutionTokens);
      
      results.push({
        studentId: solution.studentId,
        similarity: similarity,
        isPlagiarized: similarity > 0.8 // Seuil de similarité pour considérer comme plagiat
      });
    }

    // Calculer le TF-IDF pour une analyse plus approfondie
    const documents = [studentSolution, ...otherSolutions.map(s => s.text)];
    const tfidf = calculateTFIDF(documents);

    // Ajouter les scores TF-IDF aux résultats
    results.forEach((result, index) => {
      if (index > 0) { // Skip student's own solution
        const tfidfSimilarity = tfidf.tfidf(studentSolution, index);
        result.tfidfScore = tfidfSimilarity;
      }
    });

    logger.info('Analyse de plagiat effectuée avec succès');
    return results;
  } catch (error) {
    logger.error('Erreur lors de la détection de plagiat:', error);
    throw error;
  }
};

// Fonction pour analyser la structure du code
const analyzeCodeStructure = (code) => {
  try {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(code);
    
    // Analyse de la structure basique
    const structure = {
      lineCount: code.split('\n').length,
      tokenCount: tokens.length,
      uniqueTokens: new Set(tokens).size,
      complexity: calculateComplexity(code)
    };

    return structure;
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de la structure du code:', error);
    throw error;
  }
};

// Fonction pour calculer la complexité du code
const calculateComplexity = (code) => {
  let complexity = 0;
  
  // Compter les structures de contrôle
  const controlStructures = [
    'if', 'else', 'for', 'while', 'do', 'switch',
    'case', 'break', 'continue', 'return'
  ];

  controlStructures.forEach(structure => {
    const regex = new RegExp(`\\b${structure}\\b`, 'g');
    const matches = code.match(regex) || [];
    complexity += matches.length;
  });

  return complexity;
};

module.exports = {
  detectPlagiarism,
  analyzeCodeStructure,
  calculateJaccardSimilarity,
  calculateTFIDF
}; 