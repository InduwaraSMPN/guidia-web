const rateLimit = require('express-rate-limit');
const pool = require('../config/db');

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @returns {Function} - Express middleware
 */
function createRateLimiter(options = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      error: 'Too many requests',
      message: 'Please try again later'
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
}

/**
 * Log failed login attempts and implement account lockout
 * @param {Object} req - Express request object
 * @param {string} email - User email
 * @param {number} userId - User ID (if available)
 * @param {string} reason - Reason for failed login
 * @returns {Promise<void>}
 */
async function logFailedLoginAttempt(req, email, userId = 0, reason = 'Invalid credentials') {
  try {
    // Log the failed attempt to security_audit_log
    await pool.query(
      "INSERT INTO security_audit_log (eventType, details, userID, timeStamp) VALUES (?, ?, ?, NOW())",
      [
        'LOGIN_FAILED',
        JSON.stringify({
          reason,
          email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }),
        userId
      ]
    );

    // If we have a valid user ID, check for account lockout
    if (userId > 0) {
      // Count recent failed attempts for this user
      const [attempts] = await pool.query(
        "SELECT COUNT(*) as count FROM security_audit_log WHERE eventType = 'LOGIN_FAILED' AND userID = ? AND timeStamp > DATE_SUB(NOW(), INTERVAL 30 MINUTE)",
        [userId]
      );

      // If too many failed attempts, lock the account temporarily
      if (attempts[0].count >= 5) {
        await pool.query(
          "UPDATE users SET status = 'locked', resetTokenExpiry = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE userID = ?",
          [userId]
        );

        // Log the account lockout
        await pool.query(
          "INSERT INTO security_audit_log (eventType, details, userID, timeStamp) VALUES (?, ?, ?, NOW())",
          [
            'ACCOUNT_LOCKED',
            JSON.stringify({
              reason: 'Too many failed login attempts',
              ip: req.ip
            }),
            userId
          ]
        );
      }
    }
  } catch (error) {
    console.error('Error logging failed login attempt:', error);
  }
}

// General API rate limiter
const apiLimiter = createRateLimiter();

// More strict rate limiter for authentication endpoints
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts',
    message: 'Please try again after 15 minutes'
  },
  // Add custom handler to track failed attempts by IP
  handler: (req, res) => {
    // Log suspicious activity
    pool.query(
      "INSERT INTO security_audit_log (eventType, details, userID, timeStamp) VALUES (?, ?, ?, NOW())",
      [
        'RATE_LIMIT_EXCEEDED',
        JSON.stringify({
          endpoint: req.originalUrl || req.url,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }),
        0 // No user ID available at this point
      ]
    ).catch(err => console.error('Error logging rate limit:', err));

    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please try again after 15 minutes'
    });
  }
});

// Rate limiter for password reset
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts',
    message: 'Please try again after 1 hour'
  }
});

// Rate limiter for registration
const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  message: {
    error: 'Too many registration attempts',
    message: 'Please try again after 1 hour'
  }
});

// Rate limiter for sensitive operations (profile updates, etc.)
const sensitiveOperationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 sensitive operations per hour
  message: {
    error: 'Too many operations',
    message: 'Rate limit exceeded for sensitive operations. Please try again later.'
  }
});

// Rate limiter for API endpoints that could be used for enumeration
const enumerationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per hour
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  sensitiveOperationLimiter,
  enumerationLimiter,
  logFailedLoginAttempt
};
