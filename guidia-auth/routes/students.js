const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, verifyStudent, verifyOwnership } = require('../middleware/auth');
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

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};


const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const { BlobServiceClient } = require('@azure/storage-blob');

// Azure Blob Storage configuration
// Load environment variables
require('dotenv').config();

// Validate Azure storage configuration
if (!process.env.AZURE_STORAGE_CONNECTION_STRING || !process.env.AZURE_STORAGE_CONTAINER_NAME) {
  console.error('Azure storage configuration missing');
  process.exit(1);
}

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

// Initialize Azure Blob Storage client
let blobServiceClient, containerClient;
try {
  // Add retry policy and options for better reliability
  const options = {
    retryOptions: {
      maxTries: 3,
      retryDelayInMs: 1000,
      maxRetryDelayInMs: 5000
    }
  };
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString, options);
  containerClient = blobServiceClient.getContainerClient(containerName);
} catch (error) {
  console.error('Failed to initialize Azure Blob Storage client:', error);
  process.exit(1);
}

// Database connection configuration (assuming you have a pool already)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Using standardized auth middleware from middleware/auth.js

// GET student documents
router.get('/documents', verifyToken, async (req, res) => {
  const userID = req.user.id;

  try {
    // Get student documents from database
    const [rows] = await pool.execute(
      'SELECT studentDocuments FROM students WHERE userID = ?',
      [userID]
    );

    if (rows.length === 0) {
      return res.json({ studentDocuments: [] });
    }

    // Check if studentDocuments is already an object or needs parsing
    let studentDocuments = [];
    if (rows[0].studentDocuments) {
      if (typeof rows[0].studentDocuments === 'string') {
        try {
          studentDocuments = JSON.parse(rows[0].studentDocuments);
        } catch (parseError) {
          console.error('Error parsing studentDocuments JSON:', parseError);
          studentDocuments = [];
        }
      } else if (typeof rows[0].studentDocuments === 'object') {
        // It's already an object, no need to parse
        studentDocuments = rows[0].studentDocuments;
      }
    }

    res.json({ studentDocuments });
  } catch (error) {
    console.error('Error fetching student documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST upload document to Azure
router.post('/upload-document', [verifyToken, upload.single('file'), handleMulterError], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userID = req.user.id;
    const file = req.file;

    // Log environment variables (without exposing full connection string)
    console.log('Azure config check:', {
      connectionStringExists: !!connectionString,
      containerNameExists: !!containerName,
      containerName: containerName,
      fileInfo: {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    });

    // Check for missing configuration
    if (!connectionString || !containerName) {
      console.error('Azure storage configuration missing');
      return res.status(500).json({ error: 'Storage configuration error' });
    }

    try {
      // Test container existence before upload
      const containerExists = await containerClient.exists();
      if (!containerExists) {
        console.error(`Container ${containerName} does not exist`);
        return res.status(500).json({
          error: 'Storage container not found',
          details: `Container ${containerName} does not exist`
        });
      }

      // Generate unique blob name with the new directory structure
      const blobName = `student-profile/documents/${Date.now()}-${userID}-${file.originalname}`;

      // Get block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      console.log('Attempting to upload file:', {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        blobName: blobName
      });

      // Upload file with metadata
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
          blobContentDisposition: `inline; filename="${file.originalname}"`
        },
        metadata: {
          originalName: file.originalname,
          size: file.size.toString(),
          uploadedBy: userID.toString()
        }
      });

      // Get blob URL
      const url = blockBlobClient.url;

      console.log('File uploaded successfully:', {
        url: url,
        blobName: blobName
      });

      res.json({ url });
    } catch (uploadError) {
      console.error('Azure upload error details:', {
        message: uploadError.message,
        code: uploadError.code,
        stack: uploadError.stack,
        details: uploadError.details || 'No additional details'
      });

      return res.status(500).json({
        error: 'Failed to upload to storage',
        details: uploadError.message,
        code: uploadError.code || 'UNKNOWN_ERROR'
      });
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      error: 'Failed to upload document',
      message: error.message || 'Unknown error'
    });
  }
});

// POST update student documents
router.post('/update-documents', verifyToken, async (req, res) => {
  const userID = req.user.id;
  const { documents } = req.body;

  if (!Array.isArray(documents)) {
    return res.status(400).json({ message: 'Invalid documents data' });
  }

  try {
    // Get current student record
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE userID = ?',
      [userID]
    );

    const documentsJson = JSON.stringify(documents);

    if (rows.length === 0) {
      // Create new student record if doesn't exist
      await pool.execute(
        'INSERT INTO students (userID, studentDocuments) VALUES (?, ?)',
        [userID, documentsJson]
      );
    } else {
      // Update existing record
      await pool.execute(
        'UPDATE students SET studentDocuments = ? WHERE userID = ?',
        [documentsJson, userID]
      );
    }

    res.json({ message: 'Documents updated successfully', studentDocuments: documents });
  } catch (error) {
    console.error('Error updating student documents:', error);
    res.status(500).json({ message: 'Failed to update documents' });
  }
});

// GET student profile by userID
router.get('/:userID', verifyToken, async (req, res) => {
  const userID = req.params.userID;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE userID = ?',
      [userID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting student profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST update student profile
router.post('/profile', verifyToken, async (req, res) => {
  const updates = req.body;
  const userID = updates.userID;

  if (!userID) {
    return res.status(400).json({ message: 'userID is required' });
  }

  try {
    console.log('Received profile update:', { userID, updates });

    // Check if student exists
    const [existingStudent] = await pool.execute(
      'SELECT * FROM students WHERE userID = ?',
      [userID]
    );

    // Helper function to handle empty values
    const getValueOrNull = (value) => {
      if (value === undefined || value === null || value === '') {
        return null;
      }
      return value;
    };

    const values = [
      getValueOrNull(updates.studentNumber),
      getValueOrNull(updates.studentName),
      getValueOrNull(updates.studentTitle),
      getValueOrNull(updates.studentContactNumber),
      getValueOrNull(updates.studentEmail),
      getValueOrNull(updates.studentDescription),
      getValueOrNull(updates.studentProfileImagePath),
      getValueOrNull(updates.studentCategory),
      getValueOrNull(updates.studentLevel),
      userID
    ];

    console.log('Database values:', values);

    let result;
    if (existingStudent.length === 0) {
      // If student doesn't exist, create new record
      [result] = await pool.execute(
        `INSERT INTO students (
          studentNumber,
          studentName,
          studentTitle,
          studentContactNumber,
          studentEmail,
          studentDescription,
          studentProfileImagePath,
          studentCategory,
          studentLevel,
          userID
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      );
    } else {
      // If student exists, update record
      [result] = await pool.execute(
        `UPDATE students SET
         studentNumber = ?,
         studentName = ?,
         studentTitle = ?,
         studentContactNumber = ?,
         studentEmail = ?,
         studentDescription = ?,
         studentProfileImagePath = ?,
         studentCategory = ?,
         studentLevel = ?
         WHERE userID = ?`,
        values
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update student profile by userID
// PATCH endpoint to update career pathways
router.patch('/career-pathways', verifyToken, async (req, res) => {
  const { pathways } = req.body;
  const userID = req.user.id; // Get user ID from verified token

  try {
    // First check if student exists
    const [existingStudent] = await pool.execute(
      'SELECT * FROM students WHERE userID = ?',
      [userID]
    );

    let result;
    const pathwaysJson = JSON.stringify(pathways);

    if (existingStudent.length === 0) {
      // If student doesn't exist, create new record with pathways
      [result] = await pool.execute(
        'INSERT INTO students (userID, studentCareerPathways) VALUES (?, ?)',
        [userID, pathwaysJson]
      );
    } else {
      // If student exists, update pathways
      [result] = await pool.execute(
        'UPDATE students SET studentCareerPathways = ? WHERE userID = ?',
        [pathwaysJson, userID]
      );
    }

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: 'Failed to update career pathways' });
    }

    res.json({ message: 'Career pathways updated successfully' });
  } catch (error) {
    console.error('Error updating career pathways:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:userID', verifyToken, async (req, res) => {
  const updates = req.body;
  const userID = updates.userID;

  if (!userID) {
    return res.status(400).json({ message: 'userID is required' });
  }

  try {
    console.log('Received profile update:', { userID, updates });

    // Check if student exists
    const [existingStudent] = await pool.execute(
      'SELECT * FROM students WHERE userID = ?',
      [userID]
    );

    if (existingStudent.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Helper function to handle empty values
    const getValueOrNull = (value) => {
      if (value === undefined || value === null || value === '') {
        return null;
      }
      return value;
    };

    const values = [
      getValueOrNull(updates.studentNumber),
      getValueOrNull(updates.studentName),
      getValueOrNull(updates.studentTitle),
      getValueOrNull(updates.studentContactNumber),
      getValueOrNull(updates.studentEmail),
      getValueOrNull(updates.studentDescription),
      getValueOrNull(updates.studentProfileImagePath),
      getValueOrNull(updates.studentCategory),
      getValueOrNull(updates.studentLevel),
      userID
    ];

    console.log('Database values:', values);

    const [result] = await pool.execute(
      `UPDATE students SET
       studentNumber = ?,
       studentName = ?,
       studentTitle = ?,
       studentContactNumber = ?,
       studentEmail = ?,
       studentDescription = ?,
       studentProfileImagePath = ?,
       studentCategory = ?,
       studentLevel = ?
       WHERE userID = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test Azure connection
router.get('/test-azure-connection', verifyToken, async (req, res) => {
  try {
    console.log('Testing Azure connection...');

    // Check configuration
    if (!connectionString || !containerName) {
      return res.status(500).json({
        success: false,
        error: 'Azure configuration missing',
        config: {
          connectionStringExists: !!connectionString,
          containerNameExists: !!containerName
        }
      });
    }

    // Test container existence
    const containerExists = await containerClient.exists();

    if (!containerExists) {
      return res.status(404).json({
        success: false,
        error: 'Container not found',
        containerName: containerName
      });
    }

    // List a few blobs to verify permissions
    const blobs = [];
    const iterator = containerClient.listBlobsFlat();
    let i = 0;
    for await (const blob of iterator) {
      if (i >= 3) break; // Just get first 3 blobs
      blobs.push({
        name: blob.name,
        lastModified: blob.properties.lastModified
      });
      i++;
    }

    res.json({
      success: true,
      containerExists: true,
      containerName: containerName,
      sampleBlobs: blobs
    });
  } catch (error) {
    console.error('Azure connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// GET all students endpoint
router.get('/', async (req, res) => {
  try {
    const [students] = await pool.query(`
      SELECT
        s.studentID,
        s.studentNumber,
        s.studentName,
        s.studentTitle,
        s.studentContactNumber,
        s.studentEmail,
        s.studentDescription,
        s.studentProfileImagePath,
        s.userID,
        s.studentCategory,
        s.studentLevel,
        s.createdAt,
        s.updatedAt
      FROM students s
      JOIN users u ON s.userID = u.userID
      WHERE u.roleID = 2
    `);

    // Format the response
    const formattedStudents = students.map(student => ({
      ...student,
      studentCareerPathways: [], // You might want to fetch this from another table
      studentDocuments: [] // You might want to fetch this from another table
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

router.get('/profile/:userId', verifyToken, async (req, res) => {
  try {
    const [student] = await pool.execute(
      'SELECT * FROM students WHERE userID = ?',
      [req.params.userId]
    );

    if (!student.length) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json(student[0]);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Failed to fetch student profile' });
  }
});

module.exports = router;
