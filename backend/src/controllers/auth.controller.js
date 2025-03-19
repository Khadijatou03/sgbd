const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const logger = require('../utils/logger');

// Génération du token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      role: user.role 
    }, 
    process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
    {
      expiresIn: '24h'
    }
  );
};

// Inscription d'un nouvel étudiant
exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      nom,
      prenom,
      matricule,
      telephone,
      departement,
      classe,
      filiere
    } = req.body;

    logger.info('Tentative d\'inscription', { email, matricule });

    // Vérifier si l'email existe déjà
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      logger.warn('Email déjà utilisé', { email });
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier si le matricule existe déjà
    const [existingMatricule] = await pool.query(
      'SELECT * FROM etudiant WHERE matricule = ?',
      [matricule]
    );

    if (existingMatricule.length > 0) {
      logger.warn('Matricule déjà utilisé', { matricule });
      return res.status(400).json({ message: 'Ce matricule est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur dans la table users
    const [userResult] = await pool.query(
      'INSERT INTO users (id, username, email, password, role) VALUES (UUID(), ?, ?, ?, ?)',
      [username || email, email, hashedPassword, 'student']
    );

    // Récupérer l'ID de l'utilisateur créé
    const [newUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (newUser.length === 0) {
      logger.error('Erreur lors de la création de l\'utilisateur', { email });
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }

    // Créer l'étudiant dans la table etudiant
    await pool.query(
      `INSERT INTO etudiant (id, user_id, matricule, nom, prenom, telephone, departement, classe, filiere)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newUser[0].id, matricule, nom, prenom, telephone, departement, classe, filiere]
    );

    // Générer le token JWT
    const token = generateToken({
      id: newUser[0].id,
      role: 'student'
    });

    logger.info('Inscription réussie', { email, matricule });

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: newUser[0].id,
        email,
        username: username || email,
        role: 'student',
        matricule,
        nom,
        prenom,
        telephone,
        departement,
        classe,
        filiere
      }
    });

  } catch (error) {
    logger.error('Erreur lors de l\'inscription', { error: error.message });
    res.status(500).json({ 
      message: 'Erreur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info('Tentative de connexion', { email });

    // Vérification des champs requis
    if (!email || !password) {
      logger.warn('Champs manquants', { email });
      return res.status(400).json({
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Rechercher l'utilisateur
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      logger.warn('Utilisateur non trouvé', { email });
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Mot de passe incorrect', { email });
      return res.status(401).json({ 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    // Si c'est un étudiant, récupérer les informations supplémentaires
    let additionalInfo = {};
    if (user.role === 'student') {
      const [students] = await pool.query(
        'SELECT matricule, nom, prenom, telephone, departement, classe, filiere FROM etudiant WHERE user_id = ?',
        [user.id]
      );
      if (students.length > 0) {
        additionalInfo = students[0];
      }
    }

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Générer le token JWT
    const token = generateToken({
      id: user.id,
      role: user.role,
      ...additionalInfo
    });

    logger.info('Connexion réussie', { email, role: user.role });

    // Envoyer la réponse
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        ...additionalInfo
      }
    });

  } catch (error) {
    logger.error('Erreur lors de la connexion', { error: error.message });
    res.status(500).json({ 
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Déconnexion d'un utilisateur
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    // Log de la déconnexion
    await Log.info('Déconnexion', {
      user: req.user._id,
      ip: req.ip
    });

    res.status(200).json({
      status: 'success'
    });
  } catch (error) {
    next(error);
  }
};

// Vérification de l'email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return next(new AppError('Token de vérification invalide', 400));
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Log de la vérification d'email
    await Log.info('Email vérifié', {
      user: user._id,
      ip: req.ip
    });

    res.status(200).json({
      status: 'success',
      message: 'Email vérifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

// Demande de réinitialisation de mot de passe
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Aucun utilisateur trouvé avec cet email', 404));
    }

    // Génération du token de réinitialisation
    const resetToken = user.generateResetPasswordToken();
    await user.save();

    // Envoi de l'email de réinitialisation
    const resetUrl = `${config.siteUrl}/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      message: `Veuillez cliquer sur ce lien pour réinitialiser votre mot de passe: ${resetUrl}`
    });

    // Log de la demande de réinitialisation
    await Log.info('Demande de réinitialisation de mot de passe', {
      user: user._id,
      ip: req.ip
    });

    res.status(200).json({
      status: 'success',
      message: 'Email de réinitialisation envoyé'
    });
  } catch (error) {
    next(error);
  }
};

// Réinitialisation du mot de passe
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Hashage du token pour la comparaison
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token invalide ou expiré', 400));
    }

    // Mise à jour du mot de passe
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Log de la réinitialisation
    await Log.info('Mot de passe réinitialisé', {
      user: user._id,
      ip: req.ip
    });

    // Envoi de la réponse
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Mise à jour du mot de passe
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Récupération de l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id).select('+password');

    // Vérification du mot de passe actuel
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Mot de passe actuel incorrect', 401));
    }

    // Mise à jour du mot de passe
    user.password = newPassword;
    await user.save();

    // Log de la mise à jour
    await Log.info('Mot de passe mis à jour', {
      user: user._id,
      ip: req.ip
    });

    // Envoi de la réponse
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
}; 