const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get the scheduler instance
const scheduler = require('../utils/scheduler');

// For date operations
const moment = require('moment');

/**
 * Run a scheduled task manually (admin only)
 * POST /api/admin/run-task
 * Body: { taskType: 'daily' | 'weekly' | 'deadlineReminders' | 'expiringJobs' | 'incompleteProfiles' | 'jobStats' }
 */
router.post('/run-task', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { taskType } = req.body;

    if (!taskType) {
      return res.status(400).json({ error: 'Task type is required' });
    }

    const validTaskTypes = ['daily', 'weekly', 'deadlineReminders', 'expiringJobs', 'incompleteProfiles', 'jobStats'];

    if (!validTaskTypes.includes(taskType)) {
      return res.status(400).json({
        error: `Invalid task type. Must be one of: ${validTaskTypes.join(', ')}`
      });
    }

    // Run the task
    console.log(`Manually running task: ${taskType}`);

    switch (taskType) {
      case 'daily':
        await scheduler.runDailyTasks();
        break;
      case 'weekly':
        await scheduler.runWeeklyTasks();
        break;
      case 'deadlineReminders':
        await scheduler.scheduledTasks.sendApplicationDeadlineReminders();
        break;
      case 'expiringJobs':
        await scheduler.scheduledTasks.checkExpiringJobs();
        break;
      case 'incompleteProfiles':
        await scheduler.scheduledTasks.checkIncompleteProfiles();
        break;
      case 'jobStats':
        await scheduler.scheduledTasks.sendJobPostingStats();
        break;
    }

    res.json({ success: true, message: `Task ${taskType} executed successfully` });
  } catch (error) {
    console.error(`Error running task: ${error}`);
    res.status(500).json({ error: 'Failed to run task' });
  }
});

/**
 * Get scheduler status
 * GET /api/admin/scheduler-status
 */
router.get('/scheduler-status', verifyToken, verifyAdmin, (req, res) => {
  try {
    const status = {
      isRunning: !!scheduler.jobs && Object.keys(scheduler.jobs).length > 0,
      scheduledJobs: Object.keys(scheduler.jobs || {}).map(key => ({
        name: key,
        nextInvocation: scheduler.jobs[key]?.nextInvocation() || null
      }))
    };

    res.json(status);
  } catch (error) {
    console.error(`Error getting scheduler status: ${error}`);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

/**
 * Get job statistics for admin dashboard
 * GET /api/admin/job-statistics
 */
router.get('/job-statistics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const nextSevenDays = new Date(now);
    nextSevenDays.setDate(now.getDate() + 7);

    // Format dates for MySQL
    const nowFormatted = moment(now).format('YYYY-MM-DD');
    const sevenDaysAgoFormatted = moment(sevenDaysAgo).format('YYYY-MM-DD');
    const thirtyDaysAgoFormatted = moment(thirtyDaysAgo).format('YYYY-MM-DD');
    const nextSevenDaysFormatted = moment(nextSevenDays).format('YYYY-MM-DD');

    // Get total active job postings
    const [totalActiveJobs] = await pool.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE status = "active" AND endDate >= ?',
      [nowFormatted]
    );

    // Get jobs posted in the last 7 days
    const [jobsLast7Days] = await pool.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE createdAt >= ?',
      [sevenDaysAgoFormatted]
    );

    // Get jobs posted in the last 30 days
    const [jobsLast30Days] = await pool.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE createdAt >= ?',
      [thirtyDaysAgoFormatted]
    );

    // Get jobs expiring in the next 7 days
    const [jobsExpiringSoon] = await pool.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE status = "active" AND endDate BETWEEN ? AND ?',
      [nowFormatted, nextSevenDaysFormatted]
    );

    // Get most viewed jobs
    const [mostViewedJobs] = await pool.execute(`
      SELECT j.jobID, j.title, j.companyID, c.companyName, COUNT(jv.viewID) as viewCount
      FROM jobs j
      LEFT JOIN job_views jv ON j.jobID = jv.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.status = "active" AND j.endDate >= ?
      GROUP BY j.jobID
      ORDER BY viewCount DESC
      LIMIT 5
    `, [nowFormatted]);

    // Get least viewed jobs
    const [leastViewedJobs] = await pool.execute(`
      SELECT j.jobID, j.title, j.companyID, c.companyName, COUNT(jv.viewID) as viewCount
      FROM jobs j
      LEFT JOIN job_views jv ON j.jobID = jv.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.status = "active" AND j.endDate >= ?
      GROUP BY j.jobID
      ORDER BY viewCount ASC
      LIMIT 5
    `, [nowFormatted]);

    // Get jobs with most applications
    const [mostApplicationJobs] = await pool.execute(`
      SELECT j.jobID, j.title, j.companyID, c.companyName, COUNT(ja.applicationID) as applicationCount
      FROM jobs j
      LEFT JOIN job_applications ja ON j.jobID = ja.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.status = "active" AND j.endDate >= ?
      GROUP BY j.jobID
      ORDER BY applicationCount DESC
      LIMIT 5
    `, [nowFormatted]);

    // Get jobs with least applications
    const [leastApplicationJobs] = await pool.execute(`
      SELECT j.jobID, j.title, j.companyID, c.companyName, COUNT(ja.applicationID) as applicationCount
      FROM jobs j
      LEFT JOIN job_applications ja ON j.jobID = ja.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.status = "active" AND j.endDate >= ?
      GROUP BY j.jobID
      ORDER BY applicationCount ASC
      LIMIT 5
    `, [nowFormatted]);

    // Get job posting trend data (last 30 days)
    const [jobPostingTrend] = await pool.execute(`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM jobs
      WHERE createdAt >= ?
      GROUP BY DATE(createdAt)
      ORDER BY date
    `, [thirtyDaysAgoFormatted]);

    // Get job views trend data (last 30 days)
    const [jobViewsTrend] = await pool.execute(`
      SELECT
        DATE(viewedAt) as date,
        COUNT(*) as count
      FROM job_views
      WHERE viewedAt >= ?
      GROUP BY DATE(viewedAt)
      ORDER BY date
    `, [thirtyDaysAgoFormatted]);

    res.json({
      totalActiveJobs: totalActiveJobs[0].count,
      jobsLast7Days: jobsLast7Days[0].count,
      jobsLast30Days: jobsLast30Days[0].count,
      jobsExpiringSoon: jobsExpiringSoon[0].count,
      mostViewedJobs,
      leastViewedJobs,
      mostApplicationJobs,
      leastApplicationJobs,
      jobPostingTrend,
      jobViewsTrend
    });
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    res.status(500).json({ error: 'Failed to fetch job statistics' });
  }
});

/**
 * Get application statistics for admin dashboard
 * GET /api/admin/application-statistics
 */
router.get('/application-statistics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Format dates for MySQL
    const sevenDaysAgoFormatted = moment(sevenDaysAgo).format('YYYY-MM-DD');
    const thirtyDaysAgoFormatted = moment(thirtyDaysAgo).format('YYYY-MM-DD');

    // Get total applications
    const [totalApplications] = await pool.execute(
      'SELECT COUNT(*) as count FROM job_applications'
    );

    // Get applications in the last 7 days
    const [applicationsLast7Days] = await pool.execute(
      'SELECT COUNT(*) as count FROM job_applications WHERE submittedAt >= ?',
      [sevenDaysAgoFormatted]
    );

    // Get applications in the last 30 days
    const [applicationsLast30Days] = await pool.execute(
      'SELECT COUNT(*) as count FROM job_applications WHERE submittedAt >= ?',
      [thirtyDaysAgoFormatted]
    );

    // Get application status breakdown
    const [applicationsByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM job_applications
      GROUP BY status
    `);

    // Get application trend data (last 30 days)
    const [applicationTrend] = await pool.execute(`
      SELECT
        DATE(submittedAt) as date,
        COUNT(*) as count
      FROM job_applications
      WHERE submittedAt >= ?
      GROUP BY DATE(submittedAt)
      ORDER BY date
    `, [thirtyDaysAgoFormatted]);

    // Calculate conversion rate (views to applications)
    const [totalViews] = await pool.execute('SELECT COUNT(*) as count FROM job_views');
    const conversionRate = totalViews[0].count > 0
      ? (totalApplications[0].count / totalViews[0].count * 100).toFixed(2)
      : 0;

    res.json({
      totalApplications: totalApplications[0].count,
      applicationsLast7Days: applicationsLast7Days[0].count,
      applicationsLast30Days: applicationsLast30Days[0].count,
      applicationsByStatus,
      applicationTrend,
      conversionRate
    });
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    res.status(500).json({ error: 'Failed to fetch application statistics' });
  }
});

/**
 * Get meeting statistics for admin dashboard
 * GET /api/admin/meeting-statistics
 */
router.get('/meeting-statistics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    // Get total meetings count
    const [totalMeetings] = await pool.execute(
      'SELECT COUNT(*) as count FROM meetings'
    );

    // Get meetings by status
    const [meetingsByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM meetings
      GROUP BY status
    `);

    // Get meetings by type
    const [meetingsByType] = await pool.execute(`
      SELECT meetingType, COUNT(*) as count
      FROM meetings
      GROUP BY meetingType
    `);

    // Get average meeting success rating
    const [avgSuccessRating] = await pool.execute(`
      SELECT AVG(meetingSuccessRating) as avgRating
      FROM meeting_feedback
    `);

    // Get average platform experience rating
    const [avgPlatformRating] = await pool.execute(`
      SELECT AVG(platformExperienceRating) as avgRating
      FROM meeting_feedback
    `);

    // Get busiest days
    const [busiestDays] = await pool.execute(`
      SELECT DAYNAME(meetingDate) as dayOfWeek, COUNT(*) as count
      FROM meetings
      GROUP BY DAYNAME(meetingDate)
      ORDER BY count DESC
    `);

    // Get busiest hours
    const [busiestHours] = await pool.execute(`
      SELECT HOUR(startTime) as hour, COUNT(*) as count
      FROM meetings
      GROUP BY HOUR(startTime)
      ORDER BY count DESC
    `);

    // Get upcoming meetings
    const [upcomingMeetings] = await pool.execute(`
      SELECT m.*,
             u1.username as requestorName,
             u2.username as recipientName
      FROM meetings m
      JOIN users u1 ON m.requestorID = u1.userID
      JOIN users u2 ON m.recipientID = u2.userID
      WHERE m.meetingDate >= CURDATE() AND m.status = 'accepted'
      ORDER BY m.meetingDate ASC, m.startTime ASC
      LIMIT 5
    `);

    res.json({
      totalMeetings: totalMeetings[0].count,
      meetingsByStatus,
      meetingsByType,
      avgSuccessRating: avgSuccessRating[0].avgRating || 0,
      avgPlatformRating: avgPlatformRating[0].avgRating || 0,
      busiestDays,
      busiestHours,
      upcomingMeetings
    });
  } catch (error) {
    console.error('Error fetching meeting statistics:', error);
    res.status(500).json({ error: 'Failed to fetch meeting statistics' });
  }
});

/**
 * Get user activity statistics for admin dashboard
 * GET /api/admin/user-activity
 */
router.get('/user-activity', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Format dates for MySQL
    const sevenDaysAgoFormatted = moment(sevenDaysAgo).format('YYYY-MM-DD');
    const thirtyDaysAgoFormatted = moment(thirtyDaysAgo).format('YYYY-MM-DD');

    // Get new user registrations in the last 7 days
    const [newUsers7Days] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE userID IN (SELECT userID FROM registrations WHERE status = "approved" AND createdAt >= ?)',
      [sevenDaysAgoFormatted]
    );

    // Get new user registrations in the last 30 days
    const [newUsers30Days] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE userID IN (SELECT userID FROM registrations WHERE status = "approved" AND createdAt >= ?)',
      [thirtyDaysAgoFormatted]
    );

    // Get user registration trend (last 30 days)
    const [userRegistrationTrend] = await pool.execute(`
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM registrations
      WHERE status = "approved" AND createdAt >= ?
      GROUP BY DATE(createdAt)
      ORDER BY date
    `, [thirtyDaysAgoFormatted]);

    // Get profile completion rates
    // This is a simplified example - you might need to adjust based on your actual schema
    const [studentProfiles] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN studentProfileImagePath IS NOT NULL THEN 1 ELSE 0 END) as withProfileImage,
        SUM(CASE WHEN studentDescription IS NOT NULL THEN 1 ELSE 0 END) as withDescription,
        SUM(CASE WHEN studentCareerPathways IS NOT NULL THEN 1 ELSE 0 END) as withCareerPathways,
        SUM(CASE WHEN studentDocuments IS NOT NULL THEN 1 ELSE 0 END) as withDocuments
      FROM students
    `);

    const [counselorProfiles] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN counselorProfileImagePath IS NOT NULL THEN 1 ELSE 0 END) as withProfileImage,
        SUM(CASE WHEN counselorDescription IS NOT NULL THEN 1 ELSE 0 END) as withDescription,
        SUM(CASE WHEN counselorSpecializations IS NOT NULL THEN 1 ELSE 0 END) as withSpecializations
      FROM counselors
    `);

    const [companyProfiles] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN companyLogoPath IS NOT NULL THEN 1 ELSE 0 END) as withLogo,
        SUM(CASE WHEN companyDescription IS NOT NULL THEN 1 ELSE 0 END) as withDescription,
        SUM(CASE WHEN companyWebsite IS NOT NULL THEN 1 ELSE 0 END) as withWebsite
      FROM companies
    `);

    // Calculate completion percentages
    const studentCompletionRate = studentProfiles[0].total > 0 ?
      ((studentProfiles[0].withProfileImage + studentProfiles[0].withDescription +
        studentProfiles[0].withCareerPathways + studentProfiles[0].withDocuments) /
        (studentProfiles[0].total * 4) * 100).toFixed(1) : 0;

    const counselorCompletionRate = counselorProfiles[0].total > 0 ?
      ((counselorProfiles[0].withProfileImage + counselorProfiles[0].withDescription +
        counselorProfiles[0].withSpecializations) /
        (counselorProfiles[0].total * 3) * 100).toFixed(1) : 0;

    const companyCompletionRate = companyProfiles[0].total > 0 ?
      ((companyProfiles[0].withLogo + companyProfiles[0].withDescription +
        companyProfiles[0].withWebsite) /
        (companyProfiles[0].total * 3) * 100).toFixed(1) : 0;

    res.json({
      newUsers7Days: newUsers7Days[0].count,
      newUsers30Days: newUsers30Days[0].count,
      userRegistrationTrend,
      profileCompletion: {
        student: studentCompletionRate,
        counselor: counselorCompletionRate,
        company: companyCompletionRate
      }
    });
  } catch (error) {
    console.error('Error fetching user activity statistics:', error);
    res.status(500).json({ error: 'Failed to fetch user activity statistics' });
  }
});

/**
 * Get security audit statistics for admin dashboard
 * GET /api/admin/security-statistics
 */
router.get('/security-statistics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Format dates for MySQL
    const sevenDaysAgoFormatted = moment(sevenDaysAgo).format('YYYY-MM-DD');

    // Get recent security events
    const [recentEvents] = await pool.execute(`
      SELECT eventType, details, userID, timestamp
      FROM security_audit_log
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    // Get login attempts (successful/failed) in the last 7 days
    const [loginAttempts] = await pool.execute(`
      SELECT
        eventType,
        COUNT(*) as count
      FROM security_audit_log
      WHERE (eventType = 'LOGIN_SUCCESS' OR eventType = 'LOGIN_FAILED')
        AND timestamp >= ?
      GROUP BY eventType
    `, [sevenDaysAgoFormatted]);

    // Get account status changes in the last 7 days
    const [accountStatusChanges] = await pool.execute(`
      SELECT
        COUNT(*) as count
      FROM security_audit_log
      WHERE eventType = 'ACCOUNT_STATUS_CHANGE'
        AND timestamp >= ?
    `, [sevenDaysAgoFormatted]);

    res.json({
      recentEvents,
      loginAttempts,
      accountStatusChanges: accountStatusChanges[0].count
    });
  } catch (error) {
    console.error('Error fetching security statistics:', error);
    res.status(500).json({ error: 'Failed to fetch security statistics' });
  }
});

/**
 * Get communication statistics for admin dashboard
 * GET /api/admin/communication-statistics
 */
router.get('/communication-statistics', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Format dates for MySQL
    const sevenDaysAgoFormatted = moment(sevenDaysAgo).format('YYYY-MM-DD');
    const thirtyDaysAgoFormatted = moment(thirtyDaysAgo).format('YYYY-MM-DD');

    // Get total messages
    const [totalMessages] = await pool.execute(
      'SELECT COUNT(*) as count FROM messages'
    );

    // Get messages sent in the last 7 days
    const [messages7Days] = await pool.execute(
      'SELECT COUNT(*) as count FROM messages WHERE timestamp >= ?',
      [sevenDaysAgoFormatted]
    );

    // Get messages sent in the last 30 days
    const [messages30Days] = await pool.execute(
      'SELECT COUNT(*) as count FROM messages WHERE timestamp >= ?',
      [thirtyDaysAgoFormatted]
    );

    // Get most active conversations (pairs of users with most messages)
    const [activeConversations] = await pool.execute(`
      SELECT
        LEAST(senderID, receiverID) as user1ID,
        GREATEST(senderID, receiverID) as user2ID,
        COUNT(*) as messageCount,
        MAX(timestamp) as lastMessageTime,
        u1.username as user1Name,
        u2.username as user2Name
      FROM messages m
      JOIN users u1 ON LEAST(m.senderID, m.receiverID) = u1.userID
      JOIN users u2 ON GREATEST(m.senderID, m.receiverID) = u2.userID
      GROUP BY LEAST(senderID, receiverID), GREATEST(senderID, receiverID)
      ORDER BY messageCount DESC
      LIMIT 5
    `);

    // Get total unread messages
    const [unreadMessages] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE status = 'sent' OR status = 'delivered'
    `);

    // Get message trend data (last 30 days)
    const [messageTrend] = await pool.execute(`
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM messages
      WHERE timestamp >= ?
      GROUP BY DATE(timestamp)
      ORDER BY date
    `, [thirtyDaysAgoFormatted]);

    res.json({
      totalMessages: totalMessages[0].count,
      messages7Days: messages7Days[0].count,
      messages30Days: messages30Days[0].count,
      activeConversations,
      unreadMessages: unreadMessages[0].count,
      messageTrend
    });
  } catch (error) {
    console.error('Error fetching communication statistics:', error);
    res.status(500).json({ error: 'Failed to fetch communication statistics' });
  }
});

/**
 * Get system health statistics for admin dashboard
 * GET /api/admin/system-health
 */
router.get('/system-health', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Get scheduler status
    const schedulerStatus = {
      isRunning: !!scheduler.jobs && Object.keys(scheduler.jobs).length > 0,
      scheduledJobs: Object.keys(scheduler.jobs || {}).map(key => ({
        name: key,
        nextInvocation: scheduler.jobs[key]?.nextInvocation() || null
      }))
    };

    // Check database connection
    const pool = req.app.locals.pool;
    let dbStatus = 'connected';
    try {
      await pool.execute('SELECT 1');
    } catch (error) {
      dbStatus = 'disconnected';
    }

    res.json({
      schedulerStatus,
      databaseStatus: dbStatus,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching system health statistics:', error);
    res.status(500).json({ error: 'Failed to fetch system health statistics' });
  }
});

/**
 * Get recent activity feed for admin dashboard
 * GET /api/admin/activity-feed
 */
router.get('/activity-feed', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    // Get recent user registrations
    const [recentRegistrations] = await pool.execute(`
      SELECT r.*, u.username
      FROM registrations r
      JOIN users u ON r.email = u.email
      WHERE r.status = 'approved'
      ORDER BY r.createdAt DESC
      LIMIT 5
    `);

    // Get recent job postings
    const [recentJobs] = await pool.execute(`
      SELECT j.*, c.companyName
      FROM jobs j
      JOIN companies c ON j.companyID = c.companyID
      ORDER BY j.createdAt DESC
      LIMIT 5
    `);

    // Get recent job applications
    const [recentApplications] = await pool.execute(`
      SELECT ja.*, j.title as jobTitle, s.studentName
      FROM job_applications ja
      JOIN jobs j ON ja.jobID = j.jobID
      JOIN students s ON ja.studentID = s.userID
      ORDER BY ja.submittedAt DESC
      LIMIT 5
    `);

    // Get recent meetings scheduled
    const [recentMeetings] = await pool.execute(`
      SELECT m.*,
             u1.username as requestorName,
             u2.username as recipientName
      FROM meetings m
      JOIN users u1 ON m.requestorID = u1.userID
      JOIN users u2 ON m.recipientID = u2.userID
      ORDER BY m.createdAt DESC
      LIMIT 5
    `);

    // Get recent logins
    const [recentLogins] = await pool.execute(`
      SELECT sal.*, u.username
      FROM security_audit_log sal
      LEFT JOIN users u ON sal.userID = u.userID
      WHERE sal.eventType = 'LOGIN_SUCCESS'
      ORDER BY sal.timestamp DESC
      LIMIT 5
    `);

    // Combine all activities into a single feed with type and timestamp
    const activities = [
      ...recentRegistrations.map(reg => ({
        type: 'registration',
        timestamp: reg.createdAt,
        data: reg
      })),
      ...recentJobs.map(job => ({
        type: 'job',
        timestamp: job.createdAt,
        data: job
      })),
      ...recentApplications.map(app => ({
        type: 'application',
        timestamp: app.submittedAt,
        data: app
      })),
      ...recentMeetings.map(meeting => ({
        type: 'meeting',
        timestamp: meeting.createdAt,
        data: meeting
      })),
      ...recentLogins.map(login => ({
        type: 'login',
        timestamp: login.timestamp,
        data: login
      }))
    ];

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return only the most recent 20 activities
    res.json(activities.slice(0, 20));
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

module.exports = router;
