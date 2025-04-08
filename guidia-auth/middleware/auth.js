const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a database connection pool
let pool;
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('Auth middleware: Database connection pool created');
} catch (error) {
  console.error('Error creating database connection pool in auth middleware:', error);
}

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No valid token provided'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add basic user info to request
    req.user = decoded;

    // If we have a database connection, verify user exists
    if (pool) {
      const [users] = await pool.query(
        'SELECT userID, roleID FROM users WHERE userID = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'User not found'
        });
      }

      // Enhance user object with additional info from database
      req.user.roleId = users[0].roleID;
      req.user.exists = true;
    }

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle different types of JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Authentication expired',
        message: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Authentication invalid',
        message: 'Invalid token'
      });
    }

    // Generic error handling
    console.error('Token verification error:', error);
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Token verification failed'
    });
  }
};

/**
 * Middleware to verify user has admin role (roleID = 1)
 * Must be used after verifyToken
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  if (req.user.roleId !== 1) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }

  next();
};

/**
 * Middleware to verify user has company role (roleID = 3)
 * Must be used after verifyToken
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const verifyCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  if (req.user.roleId !== 3) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Company privileges required'
    });
  }

  next();
};

/**
 * Middleware to verify user has student role (roleID = 2)
 * Must be used after verifyToken
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const verifyStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  if (req.user.roleId !== 2) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Student privileges required'
    });
  }

  next();
};

/**
 * Middleware to verify user has counselor role (roleID = 4)
 * Must be used after verifyToken
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const verifyCounselor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  if (req.user.roleId !== 4) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Counselor privileges required'
    });
  }

  next();
};

/**
 * Middleware to verify user owns the resource
 * Compares req.user.id with req.params.userId or req.body.userId
 * Must be used after verifyToken
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 */
const verifyOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please authenticate first'
    });
  }

  const resourceUserId = req.params.userId || req.body.userId || req.query.userId;

  if (!resourceUserId) {
    return res.status(400).json({
      error: 'Bad request',
      message: 'Resource user ID not provided'
    });
  }

  // Allow admins to access any resource
  if (req.user.roleId === 1) {
    return next();
  }

  if (req.user.id.toString() !== resourceUserId.toString()) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You do not have permission to access this resource'
    });
  }

  next();
};

/**
 * Function to verify a token and return user data
 * Used for programmatic verification (not middleware)
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} - Decoded token data with user info
 * @throws {Error} - If token is invalid or user not found
 */
const verifyTokenProgrammatically = async (token) => {
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If we have a database connection, verify user exists
    if (pool) {
      const [users] = await pool.query(
        'SELECT userID, roleID, email FROM users WHERE userID = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        throw new Error('User not found');
      }

      // Enhance decoded object with additional info
      decoded.roleId = users[0].roleID;
      decoded.email = users[0].email;
    }

    return decoded;
  } catch (error) {
    console.error('Programmatic token verification error:', error);
    throw error;
  }
};

// Socket.io authentication middleware
const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    // We don't do database verification here to keep it lightweight
    // The database check can be done in specific event handlers if needed

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyCompany,
  verifyStudent,
  verifyCounselor,
  verifyOwnership,
  verifyTokenProgrammatically,
  socketAuth
};