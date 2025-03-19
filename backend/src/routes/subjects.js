const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subject.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Middleware de logging pour toutes les routes
router.use((req, res, next) => {
  console.log('\n=== Nouvelle requête sur /api/subjects ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.url);
  next();
});

// Routes protégées pour les sujets
router.post('/', 
  (req, res, next) => {
    console.log('1. Vérification du token...');
    verifyToken(req, res, next);
  },
  (req, res, next) => {
    console.log('2. Vérification du rôle...');
    checkRole('professor')(req, res, next);
  },
  (req, res, next) => {
    console.log('3. Upload du fichier...');
    subjectController.upload.single('file')(req, res, next);
  },
  (req, res, next) => {
    console.log('4. Création du sujet...');
    subjectController.createSubject(req, res, next);
  }
);

router.get('/', verifyToken, subjectController.getAllSubjects);
router.get('/:id', verifyToken, subjectController.getSubjectById);

// Route de mise à jour avec upload de fichier
router.put('/:id', 
  verifyToken,
  checkRole('professor'),
  subjectController.upload.single('file'),
  subjectController.updateSubject
);

router.delete('/:id', verifyToken, checkRole('professor'), subjectController.deleteSubject);

module.exports = router; 