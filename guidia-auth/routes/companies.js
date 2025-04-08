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

    // Fetch updated profile
    const [updated] = await pool.execute(
      'SELECT * FROM companies WHERE userID = ?',
      [userID]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updated[0]
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


