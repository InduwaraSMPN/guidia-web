const express = require('express');
const router = express.Router();
const { verifyToken, verifyCounselor, verifyOwnership } = require('../middleware/auth');

// Using standardized auth middleware from middleware/auth.js

// Create/Update counselor profile
router.post('/profile', verifyToken, async (req, res) => {
  try {
    const { userID, ...profileData } = req.body;

    // Verify that the userID matches the token
    if (userID?.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Unauthorized: User ID mismatch'
      });
    }

    // Check if counselor profile already exists
    const [existing] = await req.app.locals.pool.execute(
      'SELECT * FROM counselors WHERE userID = ?',
      [userID]
    );

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

      await req.app.locals.pool.execute(updateQuery, updateParams);

      res.json({
        success: true,
        counselorID: existing[0].counselorID,
        message: 'Profile updated successfully'
      });
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

      const [result] = await req.app.locals.pool.execute(insertQuery, insertParams);

      res.json({
        success: true,
        counselorID: result.insertId,
        message: 'Profile created successfully'
      });
    }
  } catch (error) {
    console.error('Error in counselor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update counselor specializations
router.patch('/specializations', verifyToken, async (req, res) => {
  try {
    const { specializations, userID } = req.body;

    // Verify that the userID matches the token
    if (userID?.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Unauthorized: User ID mismatch'
      });
    }

    if (!Array.isArray(specializations)) {
      return res.status(400).json({
        error: 'Specializations must be an array'
      });
    }

    // Check if counselor exists
    const [existing] = await req.app.locals.pool.execute(
      'SELECT * FROM counselors WHERE userID = ?',
      [userID]
    );

    // Ensure proper JSON string format
    const specializationsJson = JSON.stringify(specializations);

    if (existing.length > 0) {
      // Update existing counselor
      await req.app.locals.pool.execute(
        'UPDATE counselors SET counselorSpecializations = ? WHERE userID = ?',
        [specializationsJson, userID]
      );
    } else {
      // Create new counselor record
      await req.app.locals.pool.execute(
        'INSERT INTO counselors (userID, counselorSpecializations) VALUES (?, ?)',
        [userID, specializationsJson]
      );
    }

    res.json({
      success: true,
      message: 'Specializations updated successfully',
      specializations: specializations // Return the updated specializations
    });
  } catch (error) {
    console.error('Error updating specializations:', error);
    res.status(500).json({
      error: 'Failed to update specializations'
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









