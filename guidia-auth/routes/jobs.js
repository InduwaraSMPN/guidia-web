const express = require('express');
const router = express.Router();
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const upload = multer({ storage: multer.memoryStorage() });
const { verifyToken } = require('../middleware/auth');
const azureStorageUtils = require('../utils/azureStorageUtils');

// Azure Blob Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

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
  const NotificationTriggers = require('../utils/notificationTriggers');
  const notificationTriggers = new NotificationTriggers(req.app.locals.pool);
  try {
    const pool = req.app.locals.pool;
    const {
      title,
      tags,
      location,
      description,
      startDate,
      endDate,
      status
      // companyID is taken directly from req.body.companyID below
    } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO jobs (companyID, title, tags, location, description, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.body.companyID, title, tags, location, description, startDate, endDate, status]
    );

    // Get company details for notification
    const [companyDetails] = await pool.execute(
      'SELECT * FROM companies WHERE companyID = ?',
      [req.body.companyID]
    );

    // Create job object for notification
    const job = {
      jobID: result.insertId,
      title,
      companyID: req.body.companyID
    };

    // Create company object for notification
    const company = companyDetails.length > 0 ? companyDetails[0] : { companyID: req.body.companyID };

    // Trigger notifications
    try {
      await notificationTriggers.newJobPosted(job, company);
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Continue with the response even if notification fails
    }

    res.status(201).json({
      message: 'Job posted successfully',
      jobID: result.insertId
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job posting' });
  }
});

// GET /api/jobs/saved
// Get all saved jobs for a student
router.get('/saved', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const userId = req.user.id;

    // Check if the user is a student
    const [userRole] = await pool.execute(
      'SELECT roleID FROM users WHERE userID = ?',
      [userId]
    );

    if (userRole.length === 0 || userRole[0].roleID !== 2) { // 2 is student role
      return res.status(403).json({ error: 'Only students can have saved jobs' });
    }

    // Get all saved jobs
    const [savedJobs] = await pool.execute(`
      SELECT j.*, c.companyName, c.companyLogoPath, sj.savedAt
      FROM saved_jobs sj
      JOIN jobs j ON sj.jobID = j.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE sj.userID = ?
      ORDER BY sj.savedAt DESC
    `, [userId]);

    // Add an isExpired flag to each job
    const jobsWithExpiration = savedJobs.map(job => ({
      ...job,
      isExpired: new Date(job.endDate) < new Date()
    }));

    res.json(jobsWithExpiration);
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// GET /api/jobs/is-saved/:jobId
// Check if a job is saved by the current user
router.get('/is-saved/:jobId', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const jobId = req.params.jobId;
    const userId = req.user.id;

    // Check if the job is saved
    const [savedJob] = await pool.execute(
      'SELECT savedJobID FROM saved_jobs WHERE userID = ? AND jobID = ?',
      [userId, jobId]
    );

    res.json({
      isSaved: savedJob.length > 0,
      savedJobID: savedJob.length > 0 ? savedJob[0].savedJobID : null
    });
  } catch (error) {
    console.error('Error checking if job is saved:', error);
    res.status(500).json({ error: 'Failed to check if job is saved' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  const jwt = require('jsonwebtoken');
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

    const jobData = jobs[0];

    // Track job view if user is authenticated
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userID = decoded.id;

        // Record the view
        await pool.execute(
          'INSERT INTO job_views (jobID, userID, ipAddress) VALUES (?, ?, ?)',
          [req.params.id, userID, req.ip]
        );

        // If the viewer is a student and the job is from a company, notify the company
        const [userRole] = await pool.execute(
          'SELECT roleID FROM users WHERE userID = ?',
          [userID]
        );

        if (userRole.length > 0 && userRole[0].roleID === 2) { // Student role
          // This could be used for analytics or notifications
          // For now, we're just tracking the view
        }
      } catch (viewError) {
        // Don't fail the request if view tracking fails
        console.error('Error tracking job view:', viewError);
      }
    }

    res.json(jobData);
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
  const NotificationTriggers = require('../utils/notificationTriggers');
  const notificationTriggers = new NotificationTriggers(req.app.locals.pool);
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
    const jobItem = jobs[0];
    if (new Date(jobItem.endDate) < new Date()) {
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

    // Generate blob path using the new hierarchical structure
    let blobName;
    try {
      // First try to get the user's role from the database
      const [userRole] = await pool.execute(
        'SELECT u.roleID, r.roleName FROM users u JOIN roles r ON u.roleID = r.roleID WHERE u.userID = ?',
        [studentID]
      );

      if (userRole.length > 0) {
        // Use the database-connected path generator
        blobName = await azureStorageUtils.generateAzureBlobPath({
          userID: studentID,
          roleID: userRole[0].roleID,
          fileType: 'documents',
          originalFilename: req.file.originalname,
          pool: pool
        });
      } else {
        // Fallback to simple path generator
        blobName = azureStorageUtils.generateSimpleBlobPath({
          userID: studentID,
          userType: 'Student',
          fileType: 'documents',
          originalFilename: req.file.originalname
        });
      }
    } catch (pathError) {
      console.error('Error generating Azure path:', pathError);
      // Fallback to legacy path format
      blobName = `resumes/${Date.now()}-${req.file.originalname}`;
    }

    console.log(`Uploading resume to Azure path: ${blobName}`);
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

    // Get job details for notification
    const [jobDetails] = await pool.execute(
      `SELECT j.*, c.companyName, c.userID as companyUserID
       FROM jobs j
       JOIN companies c ON j.companyID = c.companyID
       WHERE j.jobID = ?`,
      [jobId]
    );

    // Get student details for notification
    const [studentDetails] = await pool.execute(
      `SELECT s.*, u.userID
       FROM students s
       JOIN users u ON s.userID = u.userID
       WHERE s.userID = ?`,
      [studentID]
    );

    // Create application object for notification
    const application = {
      applicationID: result.insertId,
      studentID,
      jobID: jobId
    };

    // Create student object for notification if student profile exists
    const student = studentDetails.length > 0 ? studentDetails[0] : {
      userID: studentID,
      firstName,
      lastName
    };

    // Create job object for notification
    const jobForNotification = jobDetails.length > 0 ? jobDetails[0] : { jobID: jobId, title: 'Job' };

    // Trigger notifications
    try {
      await notificationTriggers.newJobApplication(application, student, jobForNotification);
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Continue with the response even if notification fails
    }

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
        ja.status,
        DATE_FORMAT(ja.submittedAt, '%Y-%m-%dT%H:%i:%s.000Z') as submittedAt,
        DATE_FORMAT(ja.statusUpdatedAt, '%Y-%m-%dT%H:%i:%s.000Z') as statusUpdatedAt
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

// GET /api/jobs/applications/company/:companyId
// Get all applications for a company's jobs
router.get('/applications/company/:companyId', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const companyId = req.params.companyId;
    const userId = req.user.id;

    // First, check if the user is authorized to view these applications
    // The user must be from the company
    const [authorized] = await pool.execute(
      'SELECT userID FROM companies WHERE companyID = ? AND userID = ?',
      [companyId, userId]
    );

    if (authorized.length === 0) {
      return res.status(403).json({
        error: 'You are not authorized to view these applications'
      });
    }

    // Get all applications for this company's jobs
    // Use DISTINCT to ensure no duplicates
    const [applications] = await pool.execute(`
      SELECT DISTINCT
        ja.applicationID,
        ja.jobID,
        ja.studentID,
        ja.firstName,
        ja.lastName,
        ja.email,
        ja.phone,
        ja.resumePath,
        ja.status,
        DATE_FORMAT(ja.submittedAt, '%Y-%m-%dT%H:%i:%s.000Z') as submittedAt,
        DATE_FORMAT(ja.statusUpdatedAt, '%Y-%m-%dT%H:%i:%s.000Z') as statusUpdatedAt,
        ja.notes,
        j.title as jobTitle,
        j.location as jobLocation,
        s.studentProfileImagePath
      FROM job_applications ja
      JOIN jobs j ON ja.jobID = j.jobID
      LEFT JOIN students s ON ja.studentID = s.userID
      WHERE j.companyID = ?
      ORDER BY ja.submittedAt DESC
    `, [companyId]);

    // Log the number of applications found
    console.log(`Found ${applications.length} applications for company ${companyId}`);

    res.json(applications);
  } catch (error) {
    console.error('Error fetching company applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// PATCH /api/jobs/applications/:id/status
// Update application status (for companies)
router.patch('/applications/:id/status', verifyToken, async (req, res) => {
  const NotificationTriggers = require('../utils/notificationTriggers');
  const notificationTriggers = new NotificationTriggers(req.app.locals.pool);
  const { sendEmail } = require('../utils/emailHelper');
  const getJobApplicationStatusTemplate = require('../email-templates/job-application-status-template');

  try {
    const pool = req.app.locals.pool;
    const applicationId = req.params.id;
    const userId = req.user.id;
    const { status, notes } = req.body;

    if (!status || !['pending', 'reviewed', 'shortlisted', 'rejected', 'approved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // First, check if the user is authorized to update this application
    // The user must be from the company that posted the job
    const [authorized] = await pool.execute(`
      SELECT j.jobID, j.title, c.companyID, c.companyName, c.userID as companyUserID,
             ja.applicationID, ja.studentID, ja.status as currentStatus, ja.firstName, ja.lastName, ja.email
      FROM job_applications ja
      JOIN jobs j ON ja.jobID = j.jobID
      JOIN companies c ON j.companyID = c.companyID
      WHERE ja.applicationID = ? AND c.userID = ?
    `, [applicationId, userId]);

    if (authorized.length === 0) {
      return res.status(403).json({
        error: 'You are not authorized to update this application status'
      });
    }

    const job = authorized[0];
    const currentStatus = job.currentStatus;

    // Don't update if status hasn't changed
    if (currentStatus === status) {
      return res.json({
        message: 'Status is already set to ' + status,
        applicationID: applicationId
      });
    }

    // Update the application status
    await pool.execute(`
      UPDATE job_applications
      SET status = ?,
          statusUpdatedAt = CURRENT_TIMESTAMP,
          statusUpdatedBy = ?,
          notes = ?
      WHERE applicationID = ?
    `, [status, userId, notes || null, applicationId]);

    // Get student details for notification
    const [studentDetails] = await pool.execute(`
      SELECT s.*, u.userID, u.email
      FROM students s
      JOIN users u ON s.userID = u.userID
      WHERE u.userID = ?
    `, [job.studentID]);

    if (studentDetails.length > 0) {
      const student = studentDetails[0];
      const application = {
        applicationID: applicationId,
        studentID: job.studentID
      };

      // Create company object for notification
      const company = {
        companyID: job.companyID,
        companyName: job.companyName,
        userID: job.companyUserID
      };

      // Trigger notification for status change
      try {
        await notificationTriggers.jobApplicationStatusChanged(
          application,
          status,
          { jobID: job.jobID, title: job.title },
          company
        );
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Continue with the response even if notification fails
      }

      // Send email notification to student
      try {
        // Prioritize the email from the job application over the student's account email
        // This ensures we send to the email that the student provided when applying
        const applicationEmail = job.email;
        const accountEmail = student.email || student.studentEmail;

        // Use the application email if available, otherwise fall back to account email
        const studentEmail = applicationEmail || accountEmail;
        const studentName = student.studentName || `${job.firstName} ${job.lastName}`;

        // Log which email we're using
        if (applicationEmail && accountEmail && applicationEmail !== accountEmail) {
          console.log(`Using application email (${applicationEmail}) instead of account email (${accountEmail})`);
        }

        if (studentEmail) {
          // Generate application URL with the correct path for student job applications
          const applicationUrl = `${process.env.FRONTEND_URL || 'http://localhost:1030'}/profile/jobs-applications/edit/${job.studentID}`;

          // Send email
          await sendEmail(
            getJobApplicationStatusTemplate(
              studentEmail,
              studentName,
              job.title,
              job.companyName,
              status,
              notes,
              applicationUrl
            )
          );

          console.log(`Application status update email sent to: ${studentEmail}`);
        } else {
          console.error('Could not find email address to send application status update');
        }
      } catch (emailError) {
        console.error('Error sending application status update email:', emailError);
        // Continue with the response even if email fails
      }
    }

    res.json({
      message: 'Application status updated successfully',
      applicationID: applicationId,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// POST /api/jobs/:jobId/save
// Save a job for a student
router.post('/:jobId/save', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const jobId = req.params.jobId;
    const userId = req.user.id;

    // Check if the job exists
    const [jobExists] = await pool.execute(
      'SELECT jobID FROM jobs WHERE jobID = ?',
      [jobId]
    );

    if (jobExists.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if the user is a student
    const [userRole] = await pool.execute(
      'SELECT roleID FROM users WHERE userID = ?',
      [userId]
    );

    if (userRole.length === 0 || userRole[0].roleID !== 2) { // 2 is student role
      return res.status(403).json({ error: 'Only students can save jobs' });
    }

    // Check if the job is already saved
    const [savedJob] = await pool.execute(
      'SELECT savedJobID FROM saved_jobs WHERE userID = ? AND jobID = ?',
      [userId, jobId]
    );

    if (savedJob.length > 0) {
      return res.status(400).json({ error: 'Job already saved', savedJobID: savedJob[0].savedJobID });
    }

    // Save the job
    const [result] = await pool.execute(
      'INSERT INTO saved_jobs (userID, jobID) VALUES (?, ?)',
      [userId, jobId]
    );

    res.status(201).json({
      message: 'Job saved successfully',
      savedJobID: result.insertId
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// DELETE /api/jobs/:jobId/save
// Unsave a job for a student
router.delete('/:jobId/save', verifyToken, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const jobId = req.params.jobId;
    const userId = req.user.id;

    // Check if the job is saved
    const [savedJob] = await pool.execute(
      'SELECT savedJobID FROM saved_jobs WHERE userID = ? AND jobID = ?',
      [userId, jobId]
    );

    if (savedJob.length === 0) {
      return res.status(404).json({ error: 'Job not saved' });
    }

    // Unsave the job
    await pool.execute(
      'DELETE FROM saved_jobs WHERE userID = ? AND jobID = ?',
      [userId, jobId]
    );

    res.json({
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    console.error('Error unsaving job:', error);
    res.status(500).json({ error: 'Failed to unsave job' });
  }
});



module.exports = router;
