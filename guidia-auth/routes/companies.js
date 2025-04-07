const express = require('express');
const router = express.Router();
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

// Create new company profile
router.post('/profile/:userID', verifyToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
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

    // Verify that the userID matches the token
    if (userID?.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'Unauthorized: User ID mismatch' 
      });
    }

    // Check if profile already exists
    const [existing] = await pool.execute(
      'SELECT companyID FROM companies WHERE userID = ?',
      [userID]
    );

    if (existing.length > 0) {
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

    await pool.execute(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Profile created successfully'
    });

  } catch (error) {
    console.error('Error creating company profile:', error);
    res.status(500).json({ 
      error: 'Failed to create profile'
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
      companyCountry,
      companyCity,
      companyWebsite,
      companyContactNumber,
      companyEmail,
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
      'SELECT companyID FROM companies WHERE userID = ?',
      [userID]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Company profile not found'
      });
    }

    // Update the profile
    const updateQuery = `
      UPDATE companies 
      SET 
        companyName = ?,
        companyCountry = ?,
        companyCity = ?,
        companyWebsite = ?,
        companyContactNumber = ?,
        companyEmail = ?,
        companyDescription = ?,
        companyLogoPath = ?
      WHERE userID = ?
    `;

    const values = [
      companyName,
      companyCountry,
      companyCity,
      companyWebsite,
      companyContactNumber,
      companyEmail,
      companyDescription,
      companyLogoPath,
      userID
    ];

    await pool.execute(updateQuery, values);

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ 
      error: 'Failed to update profile'
    });
  }
});

// Get company profile by userID with posted jobs
router.get('/profile/:userID', async (req, res) => {
  const pool = req.app.locals.pool;
  const userID = req.params.userID;

  try {
    // First get the company profile
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

module.exports = router;


