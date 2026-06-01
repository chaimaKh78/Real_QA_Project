// Authentication utilities
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function validatePassword(password) {
  return Boolean(password) && password.length >= 6;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUsername(username) {
  return Boolean(username) && username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

module.exports = {
  hashPassword,
  generateResetToken,
  validatePassword,
  validateEmail,
  validateUsername
};