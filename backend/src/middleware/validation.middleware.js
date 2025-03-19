const { validationResult } = require('express-validator');

// Middleware pour vérifier les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validations pour l'authentification
const authValidations = {
  register: [
    {
      field: 'name',
      rules: [
        { type: 'notEmpty', message: 'Le nom est requis' },
        { type: 'isLength', options: { min: 2, max: 100 }, message: 'Le nom doit contenir entre 2 et 100 caractères' }
      ]
    },
    {
      field: 'email',
      rules: [
        { type: 'isEmail', message: 'Email invalide' },
        { type: 'normalizeEmail' }
      ]
    },
    {
      field: 'password',
      rules: [
        { type: 'isLength', options: { min: 8 }, message: 'Le mot de passe doit contenir au moins 8 caractères' },
        { type: 'matches', options: { regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/, message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' }
      ]
    },
    {
      field: 'role',
      rules: [
        { type: 'isIn', options: { values: ['student', 'teacher'] }, message: 'Rôle invalide' }
      ]
    }
  ],
  login: [
    {
      field: 'email',
      rules: [
        { type: 'isEmail', message: 'Email invalide' },
        { type: 'normalizeEmail' }
      ]
    },
    {
      field: 'password',
      rules: [
        { type: 'notEmpty', message: 'Le mot de passe est requis' }
      ]
    }
  ],
  resetPassword: [
    {
      field: 'email',
      rules: [
        { type: 'isEmail', message: 'Email invalide' },
        { type: 'normalizeEmail' }
      ]
    }
  ]
};

// Validations pour les exercices
const exerciseValidations = {
  create: [
    {
      field: 'title',
      rules: [
        { type: 'notEmpty', message: 'Le titre est requis' },
        { type: 'isLength', options: { min: 3, max: 200 }, message: 'Le titre doit contenir entre 3 et 200 caractères' }
      ]
    },
    {
      field: 'description',
      rules: [
        { type: 'notEmpty', message: 'La description est requise' }
      ]
    },
    {
      field: 'difficulty',
      rules: [
        { type: 'isIn', options: { values: ['easy', 'medium', 'hard'] }, message: 'Difficulté invalide' }
      ]
    },
    {
      field: 'points',
      rules: [
        { type: 'isInt', options: { min: 0 }, message: 'Les points doivent être un nombre positif' }
      ]
    },
    {
      field: 'deadline',
      rules: [
        { type: 'isISO8601', message: 'Date limite invalide' }
      ]
    },
    {
      field: 'allowedLanguages',
      rules: [
        { type: 'isArray', message: 'Les langages autorisés doivent être un tableau' },
        { type: 'custom', validator: (value) => value.length > 0, message: 'Au moins un langage doit être autorisé' }
      ]
    }
  ],
  update: [
    {
      field: 'title',
      rules: [
        { type: 'optional' },
        { type: 'isLength', options: { min: 3, max: 200 }, message: 'Le titre doit contenir entre 3 et 200 caractères' }
      ]
    },
    {
      field: 'difficulty',
      rules: [
        { type: 'optional' },
        { type: 'isIn', options: { values: ['easy', 'medium', 'hard'] }, message: 'Difficulté invalide' }
      ]
    },
    {
      field: 'points',
      rules: [
        { type: 'optional' },
        { type: 'isInt', options: { min: 0 }, message: 'Les points doivent être un nombre positif' }
      ]
    },
    {
      field: 'deadline',
      rules: [
        { type: 'optional' },
        { type: 'isISO8601', message: 'Date limite invalide' }
      ]
    }
  ]
};

// Validations pour les soumissions
const submissionValidations = {
  create: [
    {
      field: 'exerciseId',
      rules: [
        { type: 'isMongoId', message: 'ID d\'exercice invalide' }
      ]
    },
    {
      field: 'language',
      rules: [
        { type: 'isIn', options: { values: ['javascript', 'python', 'java', 'cpp'] }, message: 'Langage non supporté' }
      ]
    },
    {
      field: 'code',
      rules: [
        { type: 'notEmpty', message: 'Le code est requis' }
      ]
    }
  ],
  grade: [
    {
      field: 'grade',
      rules: [
        { type: 'isFloat', options: { min: 0, max: 20 }, message: 'La note doit être comprise entre 0 et 20' }
      ]
    },
    {
      field: 'feedback',
      rules: [
        { type: 'optional' },
        { type: 'isLength', options: { max: 1000 }, message: 'Le feedback ne peut pas dépasser 1000 caractères' }
      ]
    }
  ]
};

// Validations pour les paramètres système
const settingsValidations = {
  update: [
    {
      field: 'siteName',
      rules: [
        { type: 'optional' },
        { type: 'isLength', options: { min: 2, max: 100 }, message: 'Le nom du site doit contenir entre 2 et 100 caractères' }
      ]
    },
    {
      field: 'contactEmail',
      rules: [
        { type: 'optional' },
        { type: 'isEmail', message: 'Email de contact invalide' }
      ]
    },
    {
      field: 'maxSubmissionSize',
      rules: [
        { type: 'optional' },
        { type: 'isInt', options: { min: 1, max: 50 }, message: 'La taille maximale de soumission doit être comprise entre 1 et 50 MB' }
      ]
    }
  ]
};

module.exports = {
  validate,
  authValidations,
  exerciseValidations,
  submissionValidations,
  settingsValidations
}; 