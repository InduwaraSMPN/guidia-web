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

    console.log('Auth middleware - Request path:', req.path);
    console.log('Auth middleware - Headers:', {
      authorization: authHeader ? `${authHeader.substring(0, 15)}...` : 'none',
      'content-type': req.headers['content-type'],
      host: req.headers.host,
      origin: req.headers.origin
    });

    // Log the full request body for debugging
    if (req.path.includes('/openai')) {
      console.log('OpenAI request body:', req.body);
    }

    // Check if header exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Auth middleware - No valid token provided');
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No valid token provided'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    console.log('Auth middleware - Token received:', token ? `${token.substring(0, 10)}...` : 'none');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token verified successfully:', {
      userId: decoded.id,
      userRole: decoded.roleId
    });

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
      req.user.userID = users[0].userID; // Add userID from database
      req.user.roleId = users[0].roleID;
      req.user.exists = true;

      console.log('Auth middleware - Enhanced user object:', {
        id: req.user.id,
        userID: req.user.userID,
        roleId: req.user.roleId
      });
    }

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle different types of JWT errors
    console.error('Authentication error:', {
      message: error.message,
      name: error.name,
      path: req.path,
      method: req.method,
      headers: {
        authorization: req.headers.authorization ? 'Present (hidden)' : 'Missing',
        'content-type': req.headers['content-type']
      }
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Authentication expired',
        message: 'Token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Authentication invalid',
        message: 'Invalid token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        error: 'Token not active',
        message: 'Token not yet active.',
        code: 'TOKEN_NOT_ACTIVE'
      });
    }

    // Generic error handling
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Token verification failed: ' + error.message,
      code: 'AUTH_FAILED'
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