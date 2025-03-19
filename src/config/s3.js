const AWS = require('aws-sdk');
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

// Configuration AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Fonction pour uploader un fichier
const uploadFile = async (file, key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'private'
    };

    const result = await s3.upload(params).promise();
    logger.info(`Fichier uploadé avec succès: ${key}`);
    return result.Location;
  } catch (error) {
    logger.error('Erreur lors de l\'upload du fichier:', error);
    throw error;
  }
};

// Fonction pour télécharger un fichier
const downloadFile = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };

    const result = await s3.getObject(params).promise();
    logger.info(`Fichier téléchargé avec succès: ${key}`);
    return result.Body;
  } catch (error) {
    logger.error('Erreur lors du téléchargement du fichier:', error);
    throw error;
  }
};

// Fonction pour supprimer un fichier
const deleteFile = async (key) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
    logger.info(`Fichier supprimé avec succès: ${key}`);
  } catch (error) {
    logger.error('Erreur lors de la suppression du fichier:', error);
    throw error;
  }
};

// Fonction pour générer une URL signée
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    logger.info(`URL signée générée avec succès pour: ${key}`);
    return url;
  } catch (error) {
    logger.error('Erreur lors de la génération de l\'URL signée:', error);
    throw error;
  }
};

module.exports = {
  s3,
  uploadFile,
  downloadFile,
  deleteFile,
  getSignedUrl
}; 