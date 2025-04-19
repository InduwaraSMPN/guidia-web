const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const getWelcomeTemplate = require('../email-templates/welcome-template');
const { verifyToken } = require('../middleware/auth');

// Get all companies
router.get('/', verifyToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [companies] = await pool.execute(`
      SELECT c.*, u.email as companyEmail
      FROM companies c
      JOIN users u ON c.userID = u.userID
    `);

    console.log('Fetching all companies:', companies.length);
    res.json(companies);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Failed to fetch companies',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new company profile - supports both URL patterns
router.post('/profile/:userID', verifyToken, async (req, res) => {
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
      console.log('Successfully obtained database connection');
    } catch (connError) {
      console.error('Error getting database connection:', connError);
      return res.status(500).json({
        error: 'Database connection error',
        details: connError.message
      });
    }

    // Begin transaction
    await connection.beginTransaction();

    const { userID } = req.params;
    const {
      companyName,
      companyCountry,
      companyCity,
      companyWebsite,
      companyContactNumber,
      companyEmail,
      companyDescription,
      companyLogoPath
    } = req.body;

    console.log('Company profile creation request:', {
      userID,
      companyName,
      companyEmail,
      requestUser: req.user ? req.user.id : 'No user in token'
    });

    // Verify that the userID matches the token
    if (userID?.toString() !== req.user.id) {
      console.error('User ID mismatch:', { tokenUserId: req.user.id, requestUserId: userID });
      return res.status(403).json({
        error: 'Unauthorized: User ID mismatch'
      });
    }

    // Check if profile already exists
    const [existing] = await connection.execute(
      'SELECT companyID FROM companies WHERE userID = ?',
      [userID]
    );

    console.log('Existing company check result:', { count: existing.length, userID });

    if (existing.length > 0) {
      console.log('Company profile already exists for user:', userID);
      if (connection) connection.release();
      return res.status(400).json({
        error: 'Company profile already exists'
      });
    }

    // Create new profile
    const insertQuery = `
      INSERT INTO companies (
        userID,
        companyName,
        companyCountry,
        companyCity,
        companyWebsite,
        companyContactNumber,
        companyEmail,
        companyDescription,
        companyLogoPath
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userID,
      companyName,
      companyCountry,
      companyCity,
      companyWebsite,
      companyContactNumber,
      companyEmail,
      companyDescription,
      companyLogoPath
    ];

    console.log('Executing company profile insert with values:', {
      userID,
      companyName,
      companyEmail
    });

    try {
      const [result] = await connection.execute(insertQuery, values);

      console.log('Company profile insert result:', {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      });
    } catch (dbError) {
      console.error('Database error during insert:', dbError);
      await connection.rollback();
      if (connection) connection.release();
      throw dbError;
    }

    // Verify the profile was created by querying it back
    console.log('Executing verification query for userID:', userID);
    try {
      const [newProfile] = await connection.execute(
        'SELECT companyID FROM companies WHERE userID = ?',
        [userID]
      );

      console.log('Verification query result:', {
        found: newProfile.length > 0,
        companyID: newProfile.length > 0 ? newProfile[0].companyID : null
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
          const userName = companyName || userResult[0].username;
          const userEmail = userResult[0].email;
          const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:1030'}/auth/login`;

          await transporter.sendMail(
            getWelcomeTemplate(userEmail, userName, 'Company', loginUrl)
          );

          // Update the welcomeEmailSent flag
          const pool = req.app.locals.pool;
          await pool.execute(
            'UPDATE users SET welcomeEmailSent = TRUE WHERE userID = ?',
            [userID]
          );

          console.log(`Welcome email sent to company: ${userEmail}`);
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Continue with the response even if email fails
        }
      } else if (userResult.length > 0 && userResult[0].welcomeEmailSent) {
        console.log(`Welcome email already sent to company with userID: ${userID}`);
      }

      res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        companyID: newProfile.length > 0 ? newProfile[0].companyID : null
      });
    } catch (verifyError) {
      console.error('Error during verification query:', verifyError);
      await connection.rollback();
      if (connection) connection.release();
      throw verifyError;
    }

  } catch (error) {
    console.error('Error creating company profile:', error);

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
      error: 'Failed to create profile',
      details: error.message
    });
  }
});

// Update company profile
router.put('/profile/:userID', verifyToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { userID } = req.params;
    const {
      companyName,
      companyEmail,
      companyCountry,
      companyCity,
      companyWebsite,
      companyContactNumber,
      companyDescription,
      companyLogoPath
    } = req.body;

    // Verify that the userID matches the token
    if (userID?.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Unauthorized: User ID mismatch'
      });
    }

    // First check if profile exists
    const [existing] = await pool.execute(
      'SELECT * FROM companies WHERE userID = ?',
      [userID]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Company profile not found'
      });
    }

    // Only update fields that are provided
    const updates = [];
    const values = [];

    if (companyName) {
      updates.push('companyName = ?');
      values.push(companyName);
    }
    if (companyEmail) {
      updates.push('companyEmail = ?');
      values.push(companyEmail);
    }
    // Preserve other fields if they exist
    if (companyCountry) {
      updates.push('companyCountry = ?');
      values.push(companyCountry);
    }
    if (companyCity) {
      updates.push('companyCity = ?');
      values.push(companyCity);
    }
    if (companyWebsite) {
      updates.push('companyWebsite = ?');
      values.push(companyWebsite);
    }
    if (companyContactNumber) {
      updates.push('companyContactNumber = ?');
      values.push(companyContactNumber);
    }
    if (companyDescription) {
      updates.push('companyDescription = ?');
      values.push(companyDescription);
    }
    if (companyLogoPath) {
      updates.push('companyLogoPath = ?');
      values.push(companyLogoPath);
    }

    // Add userID to values array
    values.push(userID);

    const updateQuery = `
      UPDATE companies
      SET ${updates.join(', ')}
      WHERE userID = ?
    `;

    await pool.execute(updateQuery, values);

    // If email was updated, also update it in the users table
    if (companyEmail) {
      // Check if email is already in use by another user
      const [existingUsers] = await pool.execute(
        'SELECT userID FROM users WHERE email = ? AND userID != ?',
        [companyEmail, userID]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email is already in use by another user'
        });
      }

      // Update email in users table
      await pool.execute(
        'UPDATE users SET email = ? WHERE userID = ?',
        [companyEmail, userID]
      );
    }

    // Fetch updated profile
    const [updated] = await pool.execute(
      'SELECT c.*, u.email FROM companies c JOIN users u ON c.userID = u.userID WHERE c.userID = ?',
      [userID]
    );

    // Get user data to return for context update
    const [userData] = await pool.execute(
      'SELECT userID, email, roleID FROM users WHERE userID = ?',
      [userID]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updated[0],
      user: userData[0]
    });

  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get company profile by userID with posted jobs
router.get('/profile/:userID', async (req, res) => {
  const pool = req.app.locals.pool;
  const userID = req.params.userID;

  try {
    // First get the company profile
    // Always use the email from the users table as the authoritative source
    const [companies] = await pool.execute(`
      SELECT c.*, u.email as companyEmail
      FROM companies c
      JOIN users u ON c.userID = u.userID
      WHERE c.userID = ?
    `, [userID]);

    if (companies.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companies[0];

    // Then get all jobs posted by this company
    const [jobs] = await pool.execute(`
      SELECT j.*, c.companyName, c.companyLogoPath
      FROM jobs j
      JOIN companies c ON j.companyID = c.companyID
      WHERE j.companyID = ?
      ORDER BY j.createdAt DESC
    `, [company.companyID]);

    // Combine the company profile with its posted jobs
    const response = {
      ...company,
      postedJobs: jobs
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({
      error: 'Failed to fetch company profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Alternative endpoint for company profile creation (without userID in URL)
router.post('/profile', verifyToken, async (req, res) => {
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
      console.log('Successfully obtained database connection');
    } catch (connError) {
      console.error('Error getting database connection:', connError);
      return res.status(500).json({
        error: 'Database connection error',
        details: connError.message
      });
    }

    // Extract userID from the request body
    const { userID, ...profileData } = req.body;

    console.log('Company profile creation request (alternative endpoint):', {
      userID,
      companyName: profileData.companyName,
      companyEmail: profileData.companyEmail,
      requestUser: req.user ? req.user.id : 'No user in token'
    });

    // Log the database connection pool
    console.log('Database pool:', {
      poolExists: !!pool,
      hasConfig: !!(pool && pool._config),
      connectionLimit: pool && pool._config ? pool._config.connectionLimit : 'unknown',
      queueSize: pool && pool._config ? pool._config.queueLimit : 'unknown',
      database: pool && pool._config ? pool._config.database : 'unknown'
    });

    // Begin transaction
    await connection.beginTransaction();

    // Verify that the userID matches the token
    if (userID?.toString() !== req.user.id) {
      console.error('User ID mismatch:', { tokenUserId: req.user.id, requestUserId: userID });
      return res.status(403).json({
        error: 'Unauthorized: User ID mismatch'
      });
    }

    // Check if profile already exists
    const [existing] = await connection.execute(
      'SELECT companyID FROM companies WHERE userID = ?',
      [userID]
    );

    console.log('Existing company check result:', { count: existing.length, userID });

    if (existing.length > 0) {
      console.log('Company profile already exists for user:', userID);
      return res.status(400).json({
        error: 'Company profile already exists'
      });
    }

    // Create new profile
    const insertQuery = `
      INSERT INTO companies (
        userID,
        companyName,
        companyCountry,
        companyCity,
        companyWebsite,
        companyContactNumber,
        companyEmail,
        companyDescription,
        companyLogoPath
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userID,
      profileData.companyName,
      profileData.companyCountry,
      profileData.companyCity,
      profileData.companyWebsite,
      profileData.companyContactNumber,
      profileData.companyEmail,
      profileData.companyDescription,
      profileData.companyLogoPath
    ];

    console.log('Executing company profile insert with values:', {
      userID,
      companyName: profileData.companyName,
      companyEmail: profileData.companyEmail
    });

    console.log('Executing SQL query:', {
      query: insertQuery,
      values: values
    });

    try {
      const [result] = await connection.execute(insertQuery, values);

      console.log('Company profile insert result:', {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      });
    } catch (dbError) {
      console.error('Database error during insert:', dbError);
      await connection.rollback();
      throw dbError;
    }

    // Verify the profile was created by querying it back
    console.log('Executing verification query for userID:', userID);
    try {
      const [newProfile] = await connection.execute(
        'SELECT companyID FROM companies WHERE userID = ?',
        [userID]
      );

      console.log('Verification query result:', {
        found: newProfile.length > 0,
        companyID: newProfile.length > 0 ? newProfile[0].companyID : null,
        rawResult: JSON.stringify(newProfile)
      });

      // If verification fails, roll back the transaction
      if (newProfile.length === 0) {
        console.error('Verification failed - no profile found after insert');
        await connection.rollback();
        throw new Error('Profile creation verification failed');
      }

      // Commit the transaction if verification succeeds
      await connection.commit();
      console.log('Transaction committed successfully');

    } catch (verifyError) {
      console.error('Error during verification query:', verifyError);
      await connection.rollback();
      throw verifyError;
    }

    // Get the companyID from the verification query
    let companyID = null;
    try {
      const [verifyResult] = await connection.execute(
        'SELECT companyID FROM companies WHERE userID = ?',
        [userID]
      );
      companyID = verifyResult.length > 0 ? verifyResult[0].companyID : null;

      console.log('Final verification before response:', {
        userID,
        companyID,
        found: verifyResult.length > 0
      });
    } catch (finalError) {
      console.error('Error in final verification:', finalError);
    } finally {
      // Get user email for welcome email
      try {
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
            const userName = profileData.companyName || userResult[0].username;
            const userEmail = userResult[0].email;
            const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:1030'}/auth/login`;

            await transporter.sendMail(
              getWelcomeTemplate(userEmail, userName, 'Company', loginUrl)
            );

            // Update the welcomeEmailSent flag
            const pool = req.app.locals.pool;
            await pool.execute(
              'UPDATE users SET welcomeEmailSent = TRUE WHERE userID = ?',
              [userID]
            );

            console.log(`Welcome email sent to company: ${userEmail}`);
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
            // Continue with the response even if email fails
          }
        } else if (userResult.length > 0 && userResult[0].welcomeEmailSent) {
          console.log(`Welcome email already sent to company with userID: ${userID}`);
        }
      } catch (emailLookupError) {
        console.error('Error looking up user email:', emailLookupError);
        // Release the connection if not already released
        if (connection) connection.release();
        console.log('Database connection released after email lookup error');
      }
    }

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      companyID: companyID
    });

    console.log('Response sent with companyID:', companyID);

  } catch (error) {
    console.error('Error creating company profile:', error);

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
      error: 'Failed to create profile',
      details: error.message
    });
  }
});

module.exports = router;
