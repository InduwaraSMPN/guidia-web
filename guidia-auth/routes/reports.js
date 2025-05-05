const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * Get all students for report generation
 * GET /api/reports/students
 */
router.get('/students', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [students] = await pool.execute(`
      SELECT s.*, u.username, u.email
      FROM students s
      JOIN users u ON s.userID = u.userID
      ORDER BY s.studentName
    `);

    res.json(students);
  } catch (error) {
    console.error('Error fetching students for reports:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

/**
 * Generate student profile report
 * POST /api/reports/student-profile
 * Body: { studentID, format, sections }
 */
router.post('/student-profile', verifyToken, async (req, res) => {
  try {
    const { studentID, format, sections } = req.body;
    const pool = req.app.locals.pool;

    if (!studentID) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    if (!format || !['pdf', 'excel', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'Valid format is required (pdf, excel, csv)' });
    }

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'At least one report section is required' });
    }

    // Get student data
    const [students] = await pool.execute(`
      SELECT s.*, u.username, u.email
      FROM students s
      JOIN users u ON s.userID = u.userID
      WHERE s.studentID = ?
    `, [studentID]);

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = students[0];

    // Get job applications if requested
    let applications = [];
    if (sections.includes('applications')) {
      const [apps] = await pool.execute(`
        SELECT ja.*, j.title as jobTitle, c.companyName
        FROM job_applications ja
        JOIN jobs j ON ja.jobID = j.jobID
        JOIN companies c ON j.companyID = c.companyID
        WHERE ja.studentID = ?
        ORDER BY ja.submittedAt DESC
      `, [student.userID]); // Use userID instead of studentID
      applications = apps;
    }

    // Get meetings if requested
    let meetings = [];
    if (sections.includes('meetings')) {
      const [studentMeetings] = await pool.execute(`
        SELECT m.*,
               CASE
                 WHEN m.requestorID = ? THEN u.username
                 ELSE u2.username
               END as otherPartyName
        FROM meetings m
        JOIN users u ON m.recipientID = u.userID
        JOIN users u2 ON m.requestorID = u2.userID
        WHERE m.requestorID = ? OR m.recipientID = ?
        ORDER BY m.meetingDate DESC, m.startTime DESC
      `, [student.userID, student.userID, student.userID]);
      meetings = studentMeetings;
    }

    // Process career pathways if available
    let pathways = [];
    if (sections.includes('pathways') && student.studentCareerPathways) {
      try {
        if (typeof student.studentCareerPathways === 'string') {
          pathways = JSON.parse(student.studentCareerPathways);
        } else if (Array.isArray(student.studentCareerPathways)) {
          pathways = student.studentCareerPathways;
        }
      } catch (e) {
        console.error('Error parsing career pathways:', e);
      }
    }

    // Process documents if available
    let documents = [];
    if (sections.includes('documents') && student.studentDocuments) {
      try {
        if (typeof student.studentDocuments === 'string') {
          documents = JSON.parse(student.studentDocuments);
        } else if (Array.isArray(student.studentDocuments)) {
          documents = student.studentDocuments;
        }
      } catch (e) {
        console.error('Error parsing documents:', e);
      }
    }

    // Return the data for client-side report generation
    res.json({
      success: true,
      data: {
        student,
        applications: sections.includes('applications') ? applications : [],
        meetings: sections.includes('meetings') ? meetings : [],
        pathways,
        documents,
        generatedAt: new Date().toISOString(),
        format,
        sections
      }
    });
  } catch (error) {
    console.error('Error generating student profile report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
