/**
 * Enhanced security middleware for Guidia Web
 * Implements comprehensive access control and security measures
 */
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Middleware to enforce strict CORS policy
 */
const corsPolicy = (req, res, next) => {
  // Get the origin from the request
  const origin = req.headers.origin;

  // Check if the origin is in the allowed list
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:1030',
    process.env.API_BASE_URL || 'http://localhost:3001',
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For requests without origin header (like Postman)
    // Only allow in development
    if (process.env.NODE_ENV === 'development') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

/**
 * Middleware to enforce resource-based access control
 * Ensures users can only access resources they own
 * @param {string} resourceType - Type of resource (e.g., 'student', 'job', 'application')
 * @param {string} paramName - Name of the parameter containing the resource ID
 */
const resourceAccessControl = (resourceType, paramName) => {
  return async (req, res, next) => {
    try {
      // Skip for admins - they have full access
      if (req.user && req.user.roleId === 1) {
        return next();
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be authenticated to access this resource'
        });
      }

      const resourceId = req.params[paramName];
      if (!resourceId) {
        return res.status(400).json({
          error: 'Bad request',
          message: `Resource ID (${paramName}) is required`
        });
      }

      let query;
      let params = [resourceId];

      // Determine the appropriate query based on resource type
      switch (resourceType) {
        case 'student':
          query = 'SELECT userID FROM students WHERE studentID = ?';
          break;
        case 'counselor':
          query = 'SELECT userID FROM counselors WHERE counselorID = ?';
          break;
        case 'company':
          query = 'SELECT userID FROM companies WHERE companyID = ?';
          break;
        case 'job':
          query = 'SELECT c.userID FROM jobs j JOIN companies c ON j.companyID = c.companyID WHERE j.jobID = ?';
          break;
        case 'application':
          query = 'SELECT studentID FROM job_applications WHERE applicationID = ?';
          break;
        case 'conversation':
          query = 'SELECT userID FROM ai_chat_conversations WHERE conversationID = ?';
          break;
        case 'meeting':
          query = 'SELECT requestorID, recipientID FROM meetings WHERE meetingID = ?';
          break;
        default:
          return res.status(500).json({
            error: 'Server error',
            message: 'Invalid resource type specified'
          });
      }

      const [rows] = await pool.query(query, params);

      if (rows.length === 0) {
        return res.status(404).json({
          error: 'Resource not found',
          message: `The requested ${resourceType} does not exist`
        });
      }

      // For meetings, check if user is either requestor or recipient
      if (resourceType === 'meeting') {
        if (req.user.id.toString() !== rows[0].requestorID.toString() &&
            req.user.id.toString() !== rows[0].recipientID.toString()) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'You do not have permission to access this meeting'
          });
        }
      } else {
        // For other resources, check if user is the owner
        const resourceUserId = rows[0].userID;
        if (req.user.id.toString() !== resourceUserId.toString()) {
          return res.status(403).json({
            error: 'Access denied',
            message: `You do not have permission to access this ${resourceType}`
          });
        }
      }

      next();
    } catch (error) {
      console.error(`Resource access control error (${resourceType}):`, error);
      res.status(500).json({
        error: 'Server error',
        message: 'An error occurred while checking resource permissions'
      });
    }
  };
};

/**
 * Middleware to enforce role-based access control
 * @param {Array} allowedRoles - Array of role IDs allowed to access the route
 */
const roleAccessControl = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.roleId) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be authenticated to access this resource'
        });
      }

      if (!allowedRoles.includes(req.user.roleId)) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have the required role to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Role access control error:', error);
      res.status(500).json({
        error: 'Server error',
        message: 'An error occurred while checking role permissions'
      });
    }
  };
};

/**
 * Middleware to add security headers to responses
 */
const securityHeaders = (req, res, next) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://guidiacloudstorage.blob.core.windows.net; font-src 'self' data:; connect-src 'self' https://guidiacloudstorage.blob.core.windows.net"
  );

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'same-origin');

  // Feature Policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  next();
};

/**
 * Security logging middleware
 * Logs security-relevant events to both console and file
 */
const securityLogging = (req, res, next) => {
  // Add request ID for tracking
  req.requestId = crypto.randomBytes(8).toString('hex');

  // Log request
  const requestLog = {
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.id : null
  };

  // Log request (excluding sensitive data)
  console.log(`[${requestLog.timestamp}] [${requestLog.requestId}] ${requestLog.method} ${requestLog.path} - IP: ${requestLog.ip} - User: ${requestLog.userId || 'anonymous'}`);

  // Capture response data
  const originalSend = res.send;
  res.send = function(body) {
    res.responseBody = body;
    return originalSend.apply(res, arguments);
  };

  // Log response when request completes
  res.on('finish', () => {
    const responseLog = {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
      responseTime: Date.now() - new Date(requestLog.timestamp).getTime()
    };

    // Log response
    console.log(`[${responseLog.timestamp}] [${responseLog.requestId}] Response: ${responseLog.statusCode} - Time: ${responseLog.responseTime}ms`);

    // Log security events for suspicious responses
    if (res.statusCode === 401 || res.statusCode === 403) {
      logSecurityEvent('AUTH_FAILURE', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, req.user ? req.user.id : null);
    }
  });

  next();
};

/**
 * Log security event to database and file
 * @param {string} eventType - Type of security event
 * @param {Object} details - Event details
 * @param {number} userId - User ID (if available)
 */
const logSecurityEvent = async (eventType, details, userId = null) => {
  try {
    // Use 0 as a placeholder for unknown/non-existent users
    const userIdValue = userId === null ? 0 : userId;

    // Log to database
    await pool.query(
      "INSERT INTO security_audit_log (eventType, details, userID, timestamp) VALUES (?, ?, ?, NOW())",
      [eventType, JSON.stringify(details), userIdValue]
    );

    // Log to console
    console.log(`[SECURITY] [${eventType}] User: ${userIdValue}, Details: ${JSON.stringify(details)}`);

    // Log to file (in production)
    if (process.env.NODE_ENV === 'production') {
      const logDir = path.join(__dirname, '..', 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = `[${new Date().toISOString()}] [${eventType}] User: ${userIdValue}, Details: ${JSON.stringify(details)}\n`;

      fs.appendFileSync(logFile, logEntry);
    }
  } catch (error) {
    console.error("Error logging security event:", error);
  }
};

/**
 * Upload security headers middleware
 * More permissive CSP for file upload pages
 */
const uploadSecurityHeaders = (req, res, next) => {
  // More permissive CSP for file upload pages
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: blob: https://guidiacloudstorage.blob.core.windows.net; font-src 'self' data:; connect-src 'self' https://guidiacloudstorage.blob.core.windows.net; media-src 'self' blob:; worker-src 'self' blob:"
  );

  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'same-origin');

  next();
};

/**
 * API security headers middleware
 * Optimized headers for API endpoints
 */
const apiSecurityHeaders = (req, res, next) => {
  // API endpoints don't need CSP

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Cache control for API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
};

module.exports = {
  corsPolicy,
  resourceAccessControl,
  roleAccessControl,
  securityHeaders,
  securityLogging,
  logSecurityEvent,
  uploadSecurityHeaders,
  apiSecurityHeaders
};
