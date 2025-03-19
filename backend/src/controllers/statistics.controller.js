const User = require('../models/user.model');
const Exercise = require('../models/exercise.model');
const Submission = require('../models/submission.model');
const Log = require('../models/log.model');
const { AppError } = require('../middleware/error.middleware');

// Récupération des statistiques globales
exports.getGlobalStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalExercises,
      totalSubmissions,
      totalPlagiarism
    ] = await Promise.all([
      User.countDocuments(),
      Exercise.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ plagiarismScore: { $gt: 80 } })
    ]);

    // Log de la requête
    await Log.info('Statistiques globales récupérées', {
      user: req.user._id
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalExercises,
        totalSubmissions,
        totalPlagiarism
      }
    });
  } catch (error) {
    next(error);
  }
};

// Récupération des statistiques par utilisateur
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Vérification des permissions
    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à voir ces statistiques', 403));
    }

    const [
      submissions,
      averageGrade,
      completedExercises,
      plagiarismCount
    ] = await Promise.all([
      Submission.countDocuments({ student: userId }),
      Submission.aggregate([
        { $match: { student: userId, status: 'graded' } },
        { $group: { _id: null, average: { $avg: '$grade' } } }
      ]),
      Submission.countDocuments({ student: userId, status: 'completed' }),
      Submission.countDocuments({ student: userId, plagiarismScore: { $gt: 80 } })
    ]);

    // Log de la requête
    await Log.info('Statistiques utilisateur récupérées', {
      user: req.user._id,
      targetUser: userId
    });

    res.status(200).json({
      status: 'success',
      data: {
        submissions,
        averageGrade: averageGrade[0]?.average || 0,
        completedExercises,
        plagiarismCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Récupération des statistiques par exercice
exports.getExerciseStats = async (req, res, next) => {
  try {
    const exerciseId = req.params.id;

    // Vérification des permissions
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à voir ces statistiques', 403));
    }

    const [
      submissions,
      averageGrade,
      successRate,
      plagiarismCount
    ] = await Promise.all([
      Submission.countDocuments({ exercise: exerciseId }),
      Submission.aggregate([
        { $match: { exercise: exerciseId, status: 'graded' } },
        { $group: { _id: null, average: { $avg: '$grade' } } }
      ]),
      Submission.countDocuments({ exercise: exerciseId, status: 'completed' }),
      Submission.countDocuments({ exercise: exerciseId, plagiarismScore: { $gt: 80 } })
    ]);

    // Log de la requête
    await Log.info('Statistiques exercice récupérées', {
      user: req.user._id,
      exercise: exerciseId
    });

    res.status(200).json({
      status: 'success',
      data: {
        submissions,
        averageGrade: averageGrade[0]?.average || 0,
        successRate: (successRate / submissions) * 100 || 0,
        plagiarismCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Récupération des statistiques de progression
exports.getProgressStats = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user._id;

    // Calcul des dates
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const submissions = await Submission.aggregate([
      {
        $match: {
          student: userId,
          submittedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          count: { $sum: 1 },
          averageGrade: { $avg: '$grade' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Log de la requête
    await Log.info('Statistiques de progression récupérées', {
      user: userId,
      period
    });

    res.status(200).json({
      status: 'success',
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

// Récupération des statistiques de performance
exports.getPerformanceStats = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Vérification des permissions
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à voir ces statistiques', 403));
    }

    // Calcul des dates
    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const [
      userActivity,
      submissionActivity,
      errorRates,
      systemLoad
    ] = await Promise.all([
      Log.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            type: 'authentication'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Log.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            type: 'submission'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Log.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            level: 'error'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Log.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            type: 'performance'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            averageResponseTime: { $avg: '$metadata.responseTime' },
            averageMemoryUsage: { $avg: '$metadata.memoryUsage' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Log de la requête
    await Log.info('Statistiques de performance récupérées', {
      user: req.user._id,
      period
    });

    res.status(200).json({
      status: 'success',
      data: {
        userActivity,
        submissionActivity,
        errorRates,
        systemLoad
      }
    });
  } catch (error) {
    next(error);
  }
}; 