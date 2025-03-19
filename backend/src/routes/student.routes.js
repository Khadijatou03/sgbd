const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Route d'inscription (publique)
router.post('/register', studentController.registerStudent);

// Routes protégées
router.get('/subjects', verifyToken, checkRole(['student']), studentController.getAvailableSubjects);
router.get('/archives', verifyToken, checkRole(['student']), studentController.getArchives);
router.get('/grades', verifyToken, checkRole(['student']), studentController.getStudentGrades);

// Route de soumission avec upload de fichier
router.post('/submit', 
  verifyToken, 
  checkRole(['student']),
  studentController.upload.single('file'),
  studentController.submitResponse
);

module.exports = router; 