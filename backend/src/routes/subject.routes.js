const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subject.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/subjects');
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

// Routes publiques (accessibles aux étudiants et professeurs)
router.get('/', verifyToken, subjectController.getAllSubjects);
router.get('/:id', verifyToken, subjectController.getSubject);

// Routes protégées (accessibles uniquement aux professeurs)
router.post('/', verifyToken, checkRole(['professor']), upload.single('file'), subjectController.createSubject);
router.put('/:id', verifyToken, checkRole(['professor']), upload.single('file'), subjectController.updateSubject);
router.delete('/:id', verifyToken, checkRole(['professor']), subjectController.deleteSubject);

module.exports = router; 