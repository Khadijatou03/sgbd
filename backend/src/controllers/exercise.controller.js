const Exercise = require('../models/exercise.model');
const Log = require('../models/log.model');
const { AppError } = require('../middleware/error.middleware');

// Récupération de tous les exercices
exports.getAllExercises = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, difficulty, status, category } = req.query;

    // Construction de la requête
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (category) query.category = category;

    // Exécution de la requête avec pagination
    const exercises = await Exercise.find(query)
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Comptage total des exercices
    const total = await Exercise.countDocuments(query);

    // Log de la requête
    await Log.info('Liste des exercices récupérée', {
      user: req.user._id,
      query: { page, limit, search, difficulty, status, category }
    });

    res.status(200).json({
      status: 'success',
      results: exercises.length,
      pagination: {
        total,
        page: page * 1,
        pages: Math.ceil(total / limit)
      },
      data: exercises
    });
  } catch (error) {
    next(error);
  }
};

// Récupération d'un exercice spécifique
exports.getExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!exercise) {
      return next(new AppError('Exercice non trouvé', 404));
    }

    // Log de la requête
    await Log.info('Détails de l\'exercice récupérés', {
      user: req.user._id,
      exercise: exercise._id
    });

    res.status(200).json({
      status: 'success',
      data: exercise
    });
  } catch (error) {
    next(error);
  }
};

// Création d'un nouvel exercice
exports.createExercise = async (req, res, next) => {
  try {
    const {
      title,
      description,
      difficulty,
      points,
      deadline,
      allowedLanguages,
      testCases,
      files,
      category,
      timeLimit,
      memoryLimit
    } = req.body;

    // Création de l'exercice
    const exercise = await Exercise.create({
      title,
      description,
      difficulty,
      points,
      deadline,
      allowedLanguages,
      testCases,
      files,
      category,
      timeLimit,
      memoryLimit,
      createdBy: req.user._id
    });

    // Log de la création
    await Log.info('Nouvel exercice créé', {
      user: req.user._id,
      exercise: exercise._id
    });

    res.status(201).json({
      status: 'success',
      data: exercise
    });
  } catch (error) {
    next(error);
  }
};

// Mise à jour d'un exercice
exports.updateExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return next(new AppError('Exercice non trouvé', 404));
    }

    // Vérification des permissions
    if (exercise.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à modifier cet exercice', 403));
    }

    // Mise à jour des champs
    Object.keys(req.body).forEach(key => {
      if (key !== 'createdBy') {
        exercise[key] = req.body[key];
      }
    });

    await exercise.save();

    // Log de la mise à jour
    await Log.info('Exercice mis à jour', {
      user: req.user._id,
      exercise: exercise._id,
      updates: req.body
    });

    res.status(200).json({
      status: 'success',
      data: exercise
    });
  } catch (error) {
    next(error);
  }
};

// Suppression d'un exercice
exports.deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return next(new AppError('Exercice non trouvé', 404));
    }

    // Vérification des permissions
    if (exercise.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à supprimer cet exercice', 403));
    }

    await exercise.remove();

    // Log de la suppression
    await Log.info('Exercice supprimé', {
      user: req.user._id,
      exercise: req.params.id
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Publication d'un exercice
exports.publishExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return next(new AppError('Exercice non trouvé', 404));
    }

    // Vérification des permissions
    if (exercise.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à publier cet exercice', 403));
    }

    exercise.status = 'active';
    await exercise.save();

    // Log de la publication
    await Log.info('Exercice publié', {
      user: req.user._id,
      exercise: exercise._id
    });

    res.status(200).json({
      status: 'success',
      data: exercise
    });
  } catch (error) {
    next(error);
  }
};

// Archivage d'un exercice
exports.archiveExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return next(new AppError('Exercice non trouvé', 404));
    }

    // Vérification des permissions
    if (exercise.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à archiver cet exercice', 403));
    }

    exercise.status = 'archived';
    await exercise.save();

    // Log de l'archivage
    await Log.info('Exercice archivé', {
      user: req.user._id,
      exercise: exercise._id
    });

    res.status(200).json({
      status: 'success',
      data: exercise
    });
  } catch (error) {
    next(error);
  }
}; 