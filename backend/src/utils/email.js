// Fonction simple pour simuler l'envoi d'email
const sendEmail = async ({ email, subject, message }) => {
  // Pour l'instant, on simule juste l'envoi d'email en loggant les informations
  console.log('Simulation d\'envoi d\'email:', {
    to: email,
    subject: subject,
    message: message
  });
  
  return Promise.resolve();
};

module.exports = {
  sendEmail
}; 