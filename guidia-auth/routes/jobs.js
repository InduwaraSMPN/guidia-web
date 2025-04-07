const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const upload = multer({ storage: multer.memoryStorage() });
const { verifyToken } = require('../middleware/auth');

// Azure Blob Storage configuration
const connectionString = "DefaultEndpointsProtocol=https;AccountName=guidiacloudstorage;AccountKey=O1AMjCDj5kqvF7CdRPo+UUED/DgYeKAUdZRdjnQPMLIgcipbOqLl1e0vB660vG8F3B2KDEtHbH2s+AStRlTpQA==;EndpointSuffix=core.windows.net";
const containerName = "guidiacloudstorage-blob1";

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [jobs] = await pool.execute(`
      SELECT j.*, c.companyName, c.companyLogoPath
      FROM jobs j
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.status = 'active'
      ORDER BY j.createdAt DESC
    `);

    // Add an isExpired flag to each job
    const jobsWithExpiration = jobs.map(job => ({
      ...job,
      isExpired: new Date(job.endDate) < new Date()
    }));

    res.json(jobsWithExpiration);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// POST /api/jobs
router.post('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const {
      title,
      tags,
      location,
      description,
      startDate,
      endDate,
      status,
      companyID  // This is required but missing in your current request
    } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO jobs (companyID, title, tags, location, description, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.body.companyID, title, tags, location, description, startDate, endDate, status]
    );

    res.status(201).json({
      message: 'Job posted successfully',
      jobID: result.insertId
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job posting' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [jobs] = await pool.execute(`
      SELECT 
        j.*,
        c.companyName,
        c.companyLogoPath,
        c.companyID
      FROM jobs j
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.jobID = ?
    `, [req.params.id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(jobs[0]);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

// PUT /api/jobs/:id
router.put('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const jobId = req.params.id;
    const {
      title,
      tags,
      location,
      description,
      startDate,
      endDate
    } = req.body;

    // First check if the job exists
    const [existingJob] = await pool.execute(
      'SELECT jobID FROM jobs WHERE jobID = ?',
      [jobId]
    );

    if (existingJob.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update the job
    await pool.execute(
      `UPDATE jobs 
       SET title = ?, 
           tags = ?, 
           location = ?, 
           description = ?, 
           startDate = ?, 
           endDate = ?,
           updatedAt = CURRENT_TIMESTAMP
       WHERE jobID = ?`,
      [title, tags, location, description, startDate, endDate, jobId]
    );

    res.json({
      message: 'Job updated successfully',
      jobID: jobId
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const jobId = req.params.id;

    // First check if the job exists
    const [existingJob] = await pool.execute(
      'SELECT jobID FROM jobs WHERE jobID = ?',
      [jobId]
    );

    if (existingJob.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Soft delete by updating status to 'inactive' instead of actually deleting
    await pool.execute(
      'UPDATE jobs SET status = "inactive", updatedAt = CURRENT_TIMESTAMP WHERE jobID = ?',
      [jobId]
    );

    res.json({
      message: 'Job deleted successfully',
      jobID: jobId
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// POST /api/jobs/applications
router.post('/applications', upload.single('resume'), async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { jobId } = req.body;

    // Check if job exists and is not expired
    const [jobs] = await pool.execute(`
      SELECT jobID, endDate 
      FROM jobs 
      WHERE jobID = ? AND status = 'active'
    `, [jobId]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job has expired
    const job = jobs[0];
    if (new Date(job.endDate) < new Date()) {
      return res.status(400).json({ error: 'This job posting has expired' });
    }

    const {
      studentID,
      firstName,
      lastName,
      email,
      phone
    } = req.body;

    // Validate required fields
    if (!jobId || !studentID || !firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Check if student has already applied for this job
    const [existingApplication] = await pool.execute(
      'SELECT applicationID FROM job_applications WHERE studentID = ? AND jobID = ?',
      [studentID, jobId]
    );

    if (existingApplication.length > 0) {
      return res.status(400).json({ 
        error: 'You have already applied for this job'
      });
    }

    // Upload resume to Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `resumes/${Date.now()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const resumePath = blockBlobClient.url;

    // Insert application into database with Azure blob URL
    const [result] = await pool.execute(
      `INSERT INTO job_applications 
       (jobID, studentID, firstName, lastName, email, phone, resumePath) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [jobId, studentID, firstName, lastName, email, phone, resumePath]
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: result.insertId,
      resumeUrl: resumePath
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    
    // Handle duplicate application error specifically
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        error: 'You have already applied for this job'
      });
    }
    
    res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
});

// GET /api/jobs/applications/student/:studentID
router.get('/applications/student/:studentID', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const studentID = req.params.studentID;

    const [applications] = await pool.execute(`
      SELECT 
        ja.applicationID,
        ja.jobID,
        ja.resumePath,
        DATE_FORMAT(ja.submittedAt, '%Y-%m-%dT%H:%i:%s.000Z') as submittedAt,
        j.title as jobTitle,
        j.location as jobLocation,
        DATE_FORMAT(j.endDate, '%Y-%m-%dT%H:%i:%s.000Z') as endDate,
        c.companyName,
        c.companyLogoPath as companyLogoPath
      FROM job_applications ja
      LEFT JOIN jobs j ON ja.jobID = j.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE ja.studentID = ?
      ORDER BY ja.submittedAt DESC
    `, [studentID]);

    res.json(applications);
  } catch (error) {
    console.error('Error in /applications/student/:studentID:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch applications' });
  }
});

// DELETE /api/jobs/applications/:id
router.delete('/applications/:id', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const applicationId = req.params.id;
    const userId = req.user.id;

    // Get application details including submission time and job end date
    const [application] = await pool.execute(`
      SELECT 
        ja.applicationID,
        ja.submittedAt,
        j.endDate,
        DATE_FORMAT(ja.submittedAt, '%Y-%m-%dT%H:%i:%s.000Z') as formattedSubmittedAt,
        DATE_FORMAT(j.endDate, '%Y-%m-%dT%H:%i:%s.000Z') as formattedEndDate
      FROM job_applications ja
      JOIN jobs j ON ja.jobID = j.jobID
      WHERE ja.applicationID = ? AND ja.studentID = ?
    `, [applicationId, userId]);

    if (application.length === 0) {
      return res.status(404).json({ 
        error: 'Application not found or you do not have permission to delete it' 
      });
    }

    const submittedAt = new Date(application[0].formattedSubmittedAt);
    const jobEndDate = new Date(application[0].formattedEndDate);
    const now = new Date();
    const oneDayAfterSubmission = new Date(submittedAt.getTime() + 24 * 60 * 60 * 1000);

    // Debug logs
    console.log('Backend Dates:', {
      submittedAt,
      oneDayAfterSubmission,
      jobEndDate,
      now,
      canDelete: now <= oneDayAfterSubmission && now <= jobEndDate
    });

    // Check if more than 24 hours have passed since submission
    if (now > oneDayAfterSubmission) {
      return res.status(403).json({
        error: 'Applications can only be deleted within 24 hours of submission'
      });
    }

    // Check if job end date has passed
    if (now > jobEndDate) {
      return res.status(403).json({
        error: 'Applications cannot be deleted after the job posting has ended'
      });
    }

    // Delete the application
    await pool.execute(
      'DELETE FROM job_applications WHERE applicationID = ? AND studentID = ?',
      [applicationId, userId]
    );

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

router.get('/applications/:userId', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const userId = req.params.userId;

    const [applications] = await pool.query(`
      SELECT 
        ja.applicationID,
        ja.jobID,
        j.title as jobTitle,
        j.location as jobLocation,
        j.endDate,
        c.name as companyName,
        c.logoPath as companyLogoPath,
        ja.resumePath,
        DATE_FORMAT(ja.submittedAt, '%Y-%m-%dT%H:%i:%s.000Z') as submittedAt
      FROM job_applications ja
      JOIN jobs j ON ja.jobID = j.jobID
      JOIN companies c ON j.companyID = c.companyID
      WHERE ja.studentID = ?
      ORDER BY ja.submittedAt DESC
    `, [userId]);

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

module.exports = router;































