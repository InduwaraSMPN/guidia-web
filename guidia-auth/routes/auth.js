const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');

// Configure multer for memory storage with file size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF and common document formats
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Azure Blob Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Database connection configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Import the standardized auth middleware
const { verifyToken, verifyTokenProgrammatically } = require('../middleware/auth');

// Get numeric userID from email
router.post('/get-user-id', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT userID FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ userID: rows[0].userID });
  } catch (error) {
    console.error('Error getting userID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug middleware
const debugRequest = (req, res, next) => {
  console.log('Request Body:', req.body);
  console.log('Request Headers:', req.headers);
  next();
};

// Student profile creation endpoint
router.post('/profile', verifyToken, debugRequest, async (req, res) => {
  try {
    console.log('Processing student profile request...');
    const { userID, ...profileData } = req.body;

    // Verify that the userID matches the token
    if (userID?.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Unauthorized: User ID mismatch'
      });
    }

    // Combine profile data with userID
    const studentData = {
      ...profileData,
      userID
    };

    // Validate required fields
    const requiredFields = [
      'studentNumber',
      'studentName',
      'studentTitle',
      'studentContactNumber',
      'studentEmail',
      'studentDescription',
      'studentCategory',
      'studentLevel',
      'userID'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = studentData[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        providedData: studentData
      });
    }

    // Check if profile already exists
    const [existing] = await pool.execute(
      'SELECT studentID FROM students WHERE userID = ?',
      [studentData.userID]
    );

    if (existing.length > 0) {
      const updateQuery = `
        UPDATE students
        SET studentNumber = ?,
            studentName = ?,
            studentTitle = ?,
            studentContactNumber = ?,
            studentEmail = ?,
            studentDescription = ?,
            studentProfileImagePath = ?,
            studentCategory = ?,
            studentLevel = ?,
            updatedAt = NOW()
        WHERE userID = ?
      `;

      const updateParams = [
        studentData.studentNumber,
        studentData.studentName,
        studentData.studentTitle,
        studentData.studentContactNumber,
        studentData.studentEmail,
        studentData.studentDescription,
        studentData.studentProfileImagePath,
        studentData.studentCategory,
        studentData.studentLevel,
        studentData.userID
      ];

      await pool.execute(updateQuery, updateParams);

      return res.json({
        success: true,
        studentID: existing[0].studentID,
        message: 'Profile updated successfully'
      });
    } else {
      const insertQuery = `
        INSERT INTO students (
          studentNumber,
          studentName,
          studentTitle,
          studentContactNumber,
          studentEmail,
          studentDescription,
          studentProfileImagePath,
          userID,
          studentCategory,
          studentLevel
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertParams = [
        studentData.studentNumber,
        studentData.studentName,
        studentData.studentTitle,
        studentData.studentContactNumber,
        studentData.studentEmail,
        studentData.studentDescription,
        studentData.studentProfileImagePath,
        studentData.userID,
        studentData.studentCategory,
        studentData.studentLevel
      ];

      const [result] = await pool.execute(insertQuery, insertParams);

      return res.json({
        success: true,
        studentID: result.insertId,
        message: 'Profile created successfully'
      });
    }
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({
      error: 'Failed to save profile',
      details: error.message
    });
  }
});

// Career pathways update endpoint
router.patch('/students/career-pathways', verifyToken, async (req, res) => {
  try {
    const { pathways } = req.body;
    const userID = req.user.id;

    if (!Array.isArray(pathways)) {
      return res.status(400).json({ error: 'Pathways must be an array' });
    }

    const updateQuery = `
      UPDATE students
      SET studentCareerPathways = ?,
          updatedAt = NOW()
      WHERE userID = ?
    `;

    await pool.execute(updateQuery, [JSON.stringify(pathways), userID]);

    res.json({ success: true, message: 'Career pathways updated successfully' });
  } catch (error) {
    console.error('Career pathways update error:', error);
    res.status(500).json({ error: 'Failed to update career pathways' });
  }
});

/**
 * Refresh an expired token
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Refresh token is required'
      });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Authentication expired',
          message: 'Refresh token has expired, please log in again'
        });
      }

      return res.status(401).json({
        error: 'Authentication invalid',
        message: 'Invalid refresh token'
      });
    }

    // Get the user from the database
    const [users] = await pool.query(
      'SELECT userID, email, roleID FROM users WHERE userID = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found'
      });
    }

    const user = users[0];

    // Generate new tokens
    const accessToken = jwt.sign(
      { id: user.userID, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { id: user.userID },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return the new tokens
    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.userID.toString(),
        userID: user.userID.toString(),
        userId: user.userID.toString(),
        email: user.email,
        roleId: user.roleID,
        roleID: user.roleID
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to refresh token'
    });
  }
});

/**
 * Verify a token and return user data
 * GET /api/auth/verify
 * Headers: { Authorization: 'Bearer TOKEN' }
 */
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Use the programmatic verification function
      const user = await verifyTokenProgrammatically(token);

      res.json({
        id: user.id.toString(),
        userID: user.id.toString(),
        userId: user.id.toString(),
        email: user.email,
        roleId: user.roleId,
        roleID: user.roleId
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Authentication expired',
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      return res.status(401).json({
        error: 'Authentication invalid',
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify token'
    });
  }
});

module.exports = router;
