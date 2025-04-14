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

module.exports = router;
