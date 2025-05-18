const crypto = require('crypto');

// Store for CSRF tokens
// In a production environment, this should be stored in Redis or another distributed cache
const csrfTokens = new Map();

/**
 * Generate a CSRF token for a user
 * @param {string} userId - The user ID
 * @returns {string} - The generated CSRF token
 */
function generateCsrfToken(userId) {
  // Generate a random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store the token with the user ID and expiration time (1 hour)
  csrfTokens.set(token, {
    userId,
    expires: Date.now() + (60 * 60 * 1000) // 1 hour
  });
  
  // Clean up expired tokens periodically
  cleanupExpiredTokens();
  
  return token;
}

/**
 * Verify a CSRF token
 * @param {string} token - The CSRF token to verify
 * @param {string} userId - The user ID
 * @returns {boolean} - Whether the token is valid
 */
function verifyCsrfToken(token, userId) {
  // Get the token data
  const tokenData = csrfTokens.get(token);
  
  // Check if the token exists and belongs to the user
  if (!tokenData || tokenData.userId !== userId) {
    return false;
  }
  
  // Check if the token has expired
  if (tokenData.expires < Date.now()) {
    csrfTokens.delete(token);
    return false;
  }
  
  return true;
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  
  // Delete expired tokens
  for (const [token, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(token);
    }
  }
}

/**
 * Middleware to generate a CSRF token and add it to the response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function csrfTokenGenerator(req, res, next) {
  // Only generate a token if the user is authenticated
  if (req.user && req.user.id) {
    const token = generateCsrfToken(req.user.id);
    
    // Add the token to the response headers
    res.set('X-CSRF-Token', token);
  }
  
  next();
}

/**
 * Middleware to verify a CSRF token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function csrfProtection(req, res, next) {
  // Skip CSRF check for non-mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Check if the user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be authenticated to perform this action'
    });
  }
  
  // Get the token from the request headers
  const token = req.headers['x-csrf-token'];
  
  // Check if the token exists
  if (!token) {
    return res.status(403).json({
      error: 'CSRF token missing',
      message: 'CSRF token is required for this action'
    });
  }
  
  // Verify the token
  if (!verifyCsrfToken(token, req.user.id)) {
    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: 'CSRF token is invalid or expired'
    });
  }
  
  next();
}

module.exports = {
  csrfTokenGenerator,
  csrfProtection,
  generateCsrfToken,
  verifyCsrfToken
};
