/**
 * Cryptographic utilities for Guidia Web
 * Provides secure password handling and encryption functions
 */
const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Generate a secure random token
 * @param {number} bytes - Number of bytes for the token (default: 32)
 * @returns {string} - Hex-encoded random token
 */
function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash a password using bcrypt with appropriate cost factor
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  // Use a higher cost factor in production
  const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches hash
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key (must be 32 bytes for AES-256)
 * @returns {string} - Encrypted data in format: iv:authTag:encryptedData (all base64 encoded)
 */
function encryptData(text, key = process.env.ENCRYPTION_KEY) {
  if (!key || key.length < 32) {
    throw new Error('Encryption key must be at least 32 characters long');
  }
  
  // Use a 32-byte key (for AES-256)
  const keyBuffer = Buffer.from(key.slice(0, 32));
  
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create cipher using AES-256-GCM (authenticated encryption)
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag().toString('base64');
  
  // Return IV, auth tag, and encrypted data
  return `${iv.toString('base64')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt data encrypted with encryptData
 * @param {string} encryptedData - Data in format: iv:authTag:encryptedData
 * @param {string} key - Encryption key (must be 32 bytes for AES-256)
 * @returns {string} - Decrypted text
 */
function decryptData(encryptedData, key = process.env.ENCRYPTION_KEY) {
  if (!key || key.length < 32) {
    throw new Error('Encryption key must be at least 32 characters long');
  }
  
  // Use a 32-byte key (for AES-256)
  const keyBuffer = Buffer.from(key.slice(0, 32));
  
  // Split the encrypted data into its components
  const [ivBase64, authTagBase64, encryptedText] = encryptedData.split(':');
  
  if (!ivBase64 || !authTagBase64 || !encryptedText) {
    throw new Error('Invalid encrypted data format');
  }
  
  // Convert from base64
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt the data
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate a secure password
 * @param {number} length - Password length (default: 16)
 * @returns {string} - Secure random password
 */
function generateSecurePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
  let password = '';
  
  // Ensure at least one character from each character class
  password += charset.slice(0, 26).charAt(Math.floor(crypto.randomInt(26)));  // lowercase
  password += charset.slice(26, 52).charAt(Math.floor(crypto.randomInt(26))); // uppercase
  password += charset.slice(52, 62).charAt(Math.floor(crypto.randomInt(10))); // digit
  password += charset.slice(62).charAt(Math.floor(crypto.randomInt(charset.length - 62))); // special
  
  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(crypto.randomInt(charset.length)));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and reason
 */
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return { isValid: false, reason: 'Password must be at least 8 characters long' };
  }
  
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasLowercase) {
    return { isValid: false, reason: 'Password must contain at least one lowercase letter' };
  }
  
  if (!hasUppercase) {
    return { isValid: false, reason: 'Password must contain at least one uppercase letter' };
  }
  
  if (!hasDigit) {
    return { isValid: false, reason: 'Password must contain at least one digit' };
  }
  
  if (!hasSpecial) {
    return { isValid: false, reason: 'Password must contain at least one special character' };
  }
  
  return { isValid: true };
}

module.exports = {
  generateSecureToken,
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
  generateSecurePassword,
  validatePasswordStrength
};
