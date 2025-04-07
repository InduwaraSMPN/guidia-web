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

// Token verification middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.query(
      'SELECT userID FROM users WHERE userID = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

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

module.exports = router;
