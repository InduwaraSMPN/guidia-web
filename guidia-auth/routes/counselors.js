const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const getWelcomeTemplate = require('../email-templates/welcome-template');
const { verifyToken, verifyCounselor, verifyOwnership } = require('../middleware/auth');

// Using standardized auth middleware from middleware/auth.js

// Create/Update counselor profile
router.post('/profile', verifyToken, async (req, res) => {
  // Log the user's role ID for debugging
  console.log('User role ID:', req.user.roleId);
  const pool = req.app.locals.pool;
  let connection;

  try {
    // Check if pool exists
    if (!pool) {
      console.error('Database pool is undefined');
      return res.status(500).json({
        error: 'Database connection error',
        details: 'Database pool is not available'
      });
    }

    // Get a dedicated connection from the pool
    try {
      connection = await pool.getConnection();
      console.log('Successfully obtained database connection for counselor profile');
    } catch (connError) {
      console.error('Error getting database connection:', connError);
      return res.status(500).json({
        error: 'Database connection error',
        details: connError.message
      });
    }

    // Begin transaction
    await connection.beginTransaction();
    console.log('Transaction started for counselor profile');

    console.log('Received counselor profile request:', req.body);
    console.log('User from token:', req.user);

    const { userID, ...profileData } = req.body;

    // Verify that the userID matches the token
    if (userID?.toString() !== req.user.id) {
      if (connection) connection.release();
      console.error('User ID mismatch:', { tokenUserId: req.user.id, requestUserId: userID });
      return res.status(403).json({
        error: 'Unauthorized: User ID mismatch'
      });
    }

    // Check if counselor profile already exists
    console.log('Checking for existing profile with userID:', userID);
    const [existing] = await connection.execute(
      'SELECT * FROM counselors WHERE userID = ?',
      [userID]
    );
    console.log('Existing profile check result:', existing);

    // Convert languages to JSON if it's a string
    const languagesJson = typeof profileData.languages === 'string'
      ? JSON.stringify([profileData.languages])
      : JSON.stringify(profileData.languages);

    if (existing.length > 0) {
      // Update existing profile
      const updateQuery = `
        UPDATE counselors
        SET counselorName = ?,
            counselorPosition = ?,
            counselorEducation = ?,
            counselorContactNumber = ?,
            counselorExperienceYears = ?,
            counselorLocation = ?,
            counselorLanguages = ?,
            counselorDescription = ?,
            counselorProfileImagePath = ?
        WHERE userID = ?
      `;

      const updateParams = [
        profileData.counselorName,
        profileData.position,
        profileData.education,
        profileData.contactNumber,
        profileData.yearsOfExperience,
        profileData.location,
        languagesJson,
        profileData.description,
        profileData.profileImagePath,
        userID
      ];

      try {
        await connection.execute(updateQuery, updateParams);

        // Commit the transaction
        await connection.commit();
        console.log('Transaction committed successfully for profile update');

        // Release the connection back to the pool
        if (connection) connection.release();
        console.log('Database connection released after profile update');

        res.json({
          success: true,
          counselorID: existing[0].counselorID,
          message: 'Profile updated successfully'
        });
      } catch (updateError) {
        console.error('Error updating counselor profile:', updateError);
        await connection.rollback();
        if (connection) connection.release();
        throw updateError;
      }
    } else {
      // Create new profile
      const insertQuery = `
        INSERT INTO counselors (
          counselorName,
          counselorPosition,
          counselorEducation,
          counselorContactNumber,
          counselorExperienceYears,
          counselorLocation,
          counselorLanguages,
          counselorDescription,
          counselorProfileImagePath,
          userID
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const insertParams = [
        profileData.counselorName,
        profileData.position,
        profileData.education,
        profileData.contactNumber,
        profileData.yearsOfExperience,
        profileData.location,
        languagesJson,
        profileData.description,
        profileData.profileImagePath,
        userID
      ];

      console.log('Creating new profile with params:', insertParams);
      try {
        const [result] = await connection.execute(insertQuery, insertParams);
        console.log('Insert result:', result);

        // Verify the profile was created by querying it back
        console.log('Executing verification query for userID:', userID);
        const [newProfile] = await connection.execute(
          'SELECT counselorID FROM counselors WHERE userID = ?',
          [userID]
        );

        console.log('Verification query result:', {
          found: newProfile.length > 0,
          counselorID: newProfile.length > 0 ? newProfile[0].counselorID : null
        });

        // If verification fails, roll back the transaction
        if (newProfile.length === 0) {
          console.error('Verification failed - no profile found after insert');
          await connection.rollback();
          if (connection) connection.release();
          throw new Error('Profile creation verification failed');
        }

        // Commit the transaction if verification succeeds
        await connection.commit();
        console.log('Transaction committed successfully');

        // Get user email for welcome email
        const [userResult] = await connection.execute(
          'SELECT email, username, welcomeEmailSent FROM users WHERE userID = ?',
          [userID]
        );

        // Release the connection back to the pool
        if (connection) connection.release();
        console.log('Database connection released');

        // Send welcome email only if it hasn't been sent before
        if (userResult.length > 0 && !userResult[0].welcomeEmailSent) {
          // Create email transporter
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          try {
            const userName = profileData.counselorName || userResult[0].username;
            const userEmail = userResult[0].email;
            const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:1030'}/auth/login`;

            await transporter.sendMail(
              getWelcomeTemplate(userEmail, userName, 'Counselor', loginUrl)
            );

            // Update the welcomeEmailSent flag
            const pool = req.app.locals.pool;
            await pool.execute(
              'UPDATE users SET welcomeEmailSent = TRUE WHERE userID = ?',
              [userID]
            );

            console.log(`Welcome email sent to counselor: ${userEmail}`);
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
            // Continue with the response even if email fails
          }
        } else if (userResult.length > 0 && userResult[0].welcomeEmailSent) {
          console.log(`Welcome email already sent to counselor with userID: ${userID}`);
        }

        res.json({
          success: true,
          counselorID: result.insertId,
          message: 'Profile created successfully'
        });
      } catch (dbError) {
        console.error('Database error during insert:', dbError);
        await connection.rollback();
        if (connection) connection.release();
        throw dbError;
      }
    }
  } catch (error) {
    console.error('Error in counselor profile:', error);

    // Rollback transaction if it was started
    if (connection) {
      try {
        await connection.rollback();
        console.log('Transaction rolled back due to error');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      } finally {
        connection.release();
        console.log('Database connection released after error');
      }
    }

    res.status(500).json({
      error: 'Failed to create/update profile',
      details: error.message
    });
  }
});

// Update counselor specializations
router.patch('/specializations', verifyToken, async (req, res) => {
  const pool = req.app.locals.pool;
  let connection;

  try {
    // Check if pool exists
    if (!pool) {
      console.error('Database pool is undefined');
      return res.status(500).json({
        error: 'Database connection error',
        details: 'Database pool is not available'
      });
    }

    // Get a dedicated connection from the pool
    try {
      connection = await pool.getConnection();
      console.log('Successfully obtained database connection for specializations update');
    } catch (connError) {
      console.error('Error getting database connection:', connError);
      return res.status(500).json({
        error: 'Database connection error',
        details: connError.message
      });
    }

    // Begin transaction
    await connection.beginTransaction();
    console.log('Transaction started for specializations update');

    const { specializations, userID } = req.body;

    // Verify that the userID matches the token
    if (userID?.toString() !== req.user.id) {
      if (connection) connection.release();
      console.error('User ID mismatch:', { tokenUserId: req.user.id, requestUserId: userID });
      return res.status(403).json({
        error: 'Unauthorized: User ID mismatch'
      });
    }

    if (!Array.isArray(specializations)) {
      if (connection) connection.release();
      return res.status(400).json({
        error: 'Specializations must be an array'
      });
    }

    // Check if counselor exists
    const [existing] = await connection.execute(
      'SELECT * FROM counselors WHERE userID = ?',
      [userID]
    );

    console.log('Existing counselor check result:', { count: existing.length, userID });

    // Ensure proper JSON string format
    const specializationsJson = JSON.stringify(specializations);

    try {
      if (existing.length > 0) {
        // Update existing counselor
        await connection.execute(
          'UPDATE counselors SET counselorSpecializations = ? WHERE userID = ?',
          [specializationsJson, userID]
        );
        console.log('Updated specializations for existing counselor:', userID);
      } else {
        // Create new counselor record
        await connection.execute(
          'INSERT INTO counselors (userID, counselorSpecializations) VALUES (?, ?)',
          [userID, specializationsJson]
        );
        console.log('Created new counselor record with specializations:', userID);
      }

      // Verify the update/insert was successful
      const [verification] = await connection.execute(
        'SELECT counselorID, counselorSpecializations FROM counselors WHERE userID = ?',
        [userID]
      );

      console.log('Verification result:', {
        found: verification.length > 0,
        counselorID: verification.length > 0 ? verification[0].counselorID : null
      });

      // Commit the transaction
      await connection.commit();
      console.log('Transaction committed successfully');

      // Release the connection back to the pool
      if (connection) connection.release();
      console.log('Database connection released');

      res.json({
        success: true,
        message: 'Specializations updated successfully',
        specializations: specializations, // Return the updated specializations
        counselorID: verification.length > 0 ? verification[0].counselorID : null
      });
    } catch (dbError) {
      console.error('Database error during specializations update:', dbError);
      await connection.rollback();
      if (connection) connection.release();
      throw dbError;
    }
  } catch (error) {
    console.error('Error updating specializations:', error);

    // Rollback transaction if it was started
    if (connection) {
      try {
        await connection.rollback();
        console.log('Transaction rolled back due to error');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      } finally {
        connection.release();
        console.log('Database connection released after error');
      }
    }

    res.status(500).json({
      error: 'Failed to update specializations',
      details: error.message
    });
  }
});

// Get counselor profile by userID
router.get('/:id', verifyToken, async (req, res) => {
  console.log('Fetching counselor profile:', {
    requestedId: req.params.id,
    authenticatedUser: req.user
  });

  try {
    // First verify the counselor exists
    const [counselors] = await req.app.locals.pool.execute(
      'SELECT * FROM counselors WHERE userID = ?',
      [req.params.id]
    );

    console.log('Database query result:', counselors); // Log the query result

    if (!counselors || counselors.length === 0) {
      console.log('No counselor found for ID:', req.params.id);
      return res.status(404).json({ error: 'Counselor profile not found' });
    }

    const counselor = counselors[0];

    // Get email from users table
    const [users] = await req.app.locals.pool.execute(
      'SELECT email FROM users WHERE userID = ?',
      [req.params.id]
    );

    const response = {
      ...counselor,
      counselorEmail: users[0]?.email || ''
    };

    console.log('Sending response:', response);
    res.json(response);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Failed to fetch counselor profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update existing counselor profile
router.patch('/:userID', verifyToken, async (req, res) => {
  try {
    const { userID } = req.params;
    const profileData = req.body;

    // Verify that the userID matches the token
    if (userID !== req.user.id) {
      return res.status(403).json({
        error: 'Unauthorized: User ID mismatch'
      });
    }

    // Convert languages to JSON if it's an array
    const languagesJson = Array.isArray(profileData.languages)
      ? JSON.stringify(profileData.languages)
      : JSON.stringify([profileData.languages]);

    const updateQuery = `
      UPDATE counselors
      SET counselorName = COALESCE(?, counselorName),
          counselorPosition = COALESCE(?, counselorPosition),
          counselorEducation = COALESCE(?, counselorEducation),
          counselorContactNumber = COALESCE(?, counselorContactNumber),
          counselorExperienceYears = COALESCE(?, counselorExperienceYears),
          counselorLocation = COALESCE(?, counselorLocation),
          counselorLanguages = ?,
          counselorDescription = COALESCE(?, counselorDescription),
          counselorProfileImagePath = COALESCE(?, counselorProfileImagePath)
      WHERE userID = ?
    `;

    const updateParams = [
      profileData.counselorName,
      profileData.position,
      profileData.education,
      profileData.contactNumber,
      profileData.yearsOfExperience,
      profileData.location,
      languagesJson,
      profileData.description,
      profileData.profileImagePath,
      userID
    ];

    const [result] = await req.app.locals.pool.execute(updateQuery, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Counselor profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating counselor profile:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

// Get all counselors
router.get('/', verifyToken, async (req, res) => {
  try {
    const [counselors] = await req.app.locals.pool.execute(`
      SELECT c.*, u.email as counselorEmail
      FROM counselors c
      JOIN users u ON c.userID = u.userID
    `);

    console.log('Fetching all counselors:', counselors.length);
    res.json(counselors);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Failed to fetch counselors',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// New endpoint for fetching counselor profile with full details
router.get('/profile/:id', verifyToken, async (req, res) => {
  console.log('Fetching counselor profile:', {
    requestedId: req.params.id,
    authenticatedUser: req.user
  });

  try {
    // Get counselor data with joined user information
    const [counselors] = await req.app.locals.pool.execute(`
      SELECT
        c.*,
        u.email as counselorEmail,
        JSON_UNQUOTE(c.counselorLanguages) as counselorLanguages,
        JSON_UNQUOTE(c.counselorSpecializations) as counselorSpecializations
      FROM counselors c
      JOIN users u ON c.userID = u.userID
      WHERE c.userID = ?
    `, [req.params.id]);

    console.log('Database query result:', counselors);

    if (!counselors || counselors.length === 0) {
      console.log('No counselor found for ID:', req.params.id);
      return res.status(404).json({ error: 'Counselor profile not found' });
    }

    const counselor = counselors[0];

    // Parse JSON fields
    try {
      counselor.counselorLanguages = JSON.parse(counselor.counselorLanguages || '[]');
    } catch (e) {
      console.warn('Error parsing languages:', e);
      counselor.counselorLanguages = [];
    }

    try {
      counselor.counselorSpecializations = JSON.parse(counselor.counselorSpecializations || '[]');
    } catch (e) {
      console.warn('Error parsing specializations:', e);
      counselor.counselorSpecializations = [];
    }

    console.log('Sending response:', counselor);
    res.json(counselor);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Failed to fetch counselor profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;









