const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/submissions');
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Routes pour les étudiants
router.get('/student', verifyToken, checkRole(['student']), submissionController.getStudentSubmissions);
router.post('/', verifyToken, checkRole(['student']), upload.single('file'), submissionController.createSubmission);

// Routes pour les professeurs
router.get('/professor', verifyToken, checkRole(['professor']), submissionController.getProfessorSubmissions);
router.put('/:id/grade', verifyToken, checkRole(['professor']), submissionController.gradeSubmission);

module.exports = router; 