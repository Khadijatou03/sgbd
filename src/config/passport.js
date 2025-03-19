const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const pool = require('./database');
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

// Configuration JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [payload.id]);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    logger.error('Erreur JWT Strategy:', error);
    return done(error, false);
  }
}));

// Configuration Google OAuth2
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE google_id = ?',
      [profile.id]
    );

    if (existingUser) {
      return done(null, existingUser);
    }

    const [newUser] = await pool.query(
      'INSERT INTO users (google_id, email, name, role) VALUES (?, ?, ?, ?)',
      [profile.id, profile.emails[0].value, profile.displayName, 'student']
    );

    return done(null, newUser);
  } catch (error) {
    logger.error('Erreur Google Strategy:', error);
    return done(error, false);
  }
}));

// Configuration GitHub OAuth2
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE github_id = ?',
      [profile.id]
    );

    if (existingUser) {
      return done(null, existingUser);
    }

    const [newUser] = await pool.query(
      'INSERT INTO users (github_id, email, name, role) VALUES (?, ?, ?, ?)',
      [profile.id, profile.emails[0].value, profile.displayName, 'student']
    );

    return done(null, newUser);
  } catch (error) {
    logger.error('Erreur GitHub Strategy:', error);
    return done(error, false);
  }
}));

// Configuration Microsoft OAuth2
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: '/auth/microsoft/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE microsoft_id = ?',
      [profile.id]
    );

    if (existingUser) {
      return done(null, existingUser);
    }

    const [newUser] = await pool.query(
      'INSERT INTO users (microsoft_id, email, name, role) VALUES (?, ?, ?, ?)',
      [profile.id, profile.emails[0].value, profile.displayName, 'student']
    );

    return done(null, newUser);
  } catch (error) {
    logger.error('Erreur Microsoft Strategy:', error);
    return done(error, false);
  }
}));

module.exports = passport; 