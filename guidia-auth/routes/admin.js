const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// Get the scheduler instance
const scheduler = require("../utils/scheduler");

// For date operations
const moment = require("moment");

// For platform announcements
const NotificationTriggers = require("../utils/notificationTriggers");

// For making HTTP requests
const fetch = require('node-fetch');

// Reference to the notification socket service
let notificationSocketService;

// Set the notification socket service
router.setNotificationSocketService = (service) => {
  notificationSocketService = service;
};

/**
 * Trigger an admin dashboard update
 * This function can be called from other parts of the application to notify admins of changes
 * @param {string} updateType - The type of update (e.g., 'job_statistics_update')
 * @param {Object} data - The data to send (optional)
 */
router.triggerAdminDashboardUpdate = (updateType, data = {}) => {
  if (notificationSocketService) {
    notificationSocketService.sendAdminDashboardUpdate({
      type: updateType,
      data: data,
      timestamp: new Date().toISOString()
    });
    return true;
  }
  return false;
};

/**
 * Run a scheduled task manually (admin only)
 * POST /api/admin/run-task
 * Body: { taskType: 'daily' | 'weekly' | 'deadlineReminders' | 'expiringJobs' | 'incompleteProfiles' | 'jobStats' }
 */
router.post("/run-task", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { taskType } = req.body;

    if (!taskType) {
      return res.status(400).json({ error: "Task type is required" });
    }

    const validTaskTypes = [
      "daily",
      "weekly",
      "deadlineReminders",
      "expiringJobs",
      "incompleteProfiles",
      "jobStats",
    ];

    if (!validTaskTypes.includes(taskType)) {
      return res.status(400).json({
        error: `Invalid task type. Must be one of: ${validTaskTypes.join(
          ", "
        )}`,
      });
    }

    // Run the task
    console.log(`Manually running task: ${taskType}`);

    // Get the database pool from the request
    const pool = req.app.locals.pool;
    if (!pool) {
      return res.status(500).json({ error: "Database connection not available" });
    }

    // Define task functions directly here instead of relying on scheduler
    const tasks = {
      daily: async () => {
        console.log('Running daily tasks manually');
        try {
          // Implement basic daily tasks here
          await pool.execute("REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
            ['SYSTEM_LAST_DAILY_RUN', new Date().toISOString()]);
          return 'Daily tasks completed';
        } catch (error) {
          console.error('Error in daily task:', error);
          throw new Error(`Daily task failed: ${error.message}`);
        }
      },
      weekly: async () => {
        console.log('Running weekly tasks manually');
        try {
          // Implement basic weekly tasks here
          await pool.execute("REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
            ['SYSTEM_LAST_WEEKLY_RUN', new Date().toISOString()]);
          return 'Weekly tasks completed';
        } catch (error) {
          console.error('Error in weekly task:', error);
          throw new Error(`Weekly task failed: ${error.message}`);
        }
      },
      deadlineReminders: async () => {
        console.log('Running deadline reminders task manually');
        try {
          const today = new Date();
          const threeDaysLater = new Date(today);
          threeDaysLater.setDate(today.getDate() + 3);

          const [approachingDeadlines] = await pool.execute(
            "SELECT * FROM jobs WHERE endDate BETWEEN ? AND ? AND notifiedDeadline = 0",
            [today.toISOString().split('T')[0], threeDaysLater.toISOString().split('T')[0]]
          );

          console.log(`Found ${approachingDeadlines.length} jobs with approaching deadlines`);
          return `Found ${approachingDeadlines.length} jobs with approaching deadlines`;
        } catch (error) {
          console.error('Error in deadlineReminders task:', error);
          throw new Error(`Deadline reminders task failed: ${error.message}`);
        }
      },
      expiringJobs: async () => {
        console.log('Running expiring jobs check manually');
        try {
          const today = new Date();
          const threeDaysLater = new Date(today);
          threeDaysLater.setDate(today.getDate() + 3);

          const [expiringJobs] = await pool.execute(
            "SELECT * FROM jobs WHERE endDate BETWEEN ? AND ? AND notifiedExpiring = 0",
            [today.toISOString().split('T')[0], threeDaysLater.toISOString().split('T')[0]]
          );

          console.log(`Found ${expiringJobs.length} jobs expiring soon`);
          return `Found ${expiringJobs.length} jobs expiring soon`;
        } catch (error) {
          console.error('Error in expiringJobs task:', error);
          throw new Error(`Expiring jobs task failed: ${error.message}`);
        }
      },
      incompleteProfiles: async () => {
        console.log('Running incomplete profiles check manually');
        try {
          const [incompleteStudentProfiles] = await pool.execute(
            "SELECT * FROM students WHERE studentDescription IS NULL OR studentProfileImagePath IS NULL"
          );

          const [incompleteCompanyProfiles] = await pool.execute(
            "SELECT * FROM companies WHERE companyDescription IS NULL OR companyLogoPath IS NULL"
          );

          const [incompleteCounselorProfiles] = await pool.execute(
            "SELECT * FROM counselors WHERE counselorDescription IS NULL OR counselorProfileImagePath IS NULL"
          );

          const totalIncomplete = incompleteStudentProfiles.length +
                                 incompleteCompanyProfiles.length +
                                 incompleteCounselorProfiles.length;

          console.log(`Found ${totalIncomplete} incomplete profiles`);
          return `Found ${totalIncomplete} incomplete profiles`;
        } catch (error) {
          console.error('Error in incompleteProfiles task:', error);
          throw new Error(`Incomplete profiles task failed: ${error.message}`);
        }
      },
      jobStats: async () => {
        console.log('Running job stats task manually');
        try {
          // Get job view counts
          const [jobViews] = await pool.execute(
            "SELECT jobID, COUNT(*) as viewCount FROM job_views GROUP BY jobID ORDER BY viewCount DESC"
          );

          // Get job application counts
          const [jobApplications] = await pool.execute(
            "SELECT jobID, COUNT(*) as applicationCount FROM job_applications GROUP BY jobID ORDER BY applicationCount DESC"
          );

          console.log(`Found ${jobViews.length} job view records and ${jobApplications.length} job application records`);
          return 'Job stats task completed';
        } catch (error) {
          console.error('Error in jobStats task:', error);
          throw new Error(`Job stats task failed: ${error.message}`);
        }
      }
    };

    // Execute the selected task
    const result = await tasks[taskType]();

    res.json({
      success: true,
      message: `Task ${taskType} executed successfully`,
      result
    });
  } catch (error) {
    console.error(`Error running task: ${error}`);
    res.status(500).json({ error: `Failed to run task: ${error.message}` });
  }
});

/**
 * Get scheduler status
 * GET /api/admin/scheduler-status
 */
router.get("/scheduler-status", verifyToken, verifyAdmin, (req, res) => {
  try {
    // Access scheduler from app locals if available, otherwise use global scheduler
    const schedulerInstance = req.app.locals.scheduler || scheduler;

    const status = {
      isRunning: !!schedulerInstance.jobs && Object.keys(schedulerInstance.jobs).length > 0,
      scheduledJobs: Object.keys(schedulerInstance.jobs || {}).map((key) => ({
        name: key,
        nextInvocation: schedulerInstance.jobs[key]?.nextInvocation() || null,
      })),
    };

    res.json(status);
  } catch (error) {
    console.error(`Error getting scheduler status: ${error}`);
    res.status(500).json({ error: `Failed to get scheduler status: ${error.message}` });
  }
});

/**
 * Get notification settings
 * GET /api/admin/notification-settings
 */
router.get("/notification-settings", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    // Get notification settings from database
    const [settings] = await pool.execute(
      "SELECT * FROM system_settings WHERE settingKey LIKE 'NOTIFICATION_%'"
    );

    // Transform to expected format
    const notificationSettings = {
      jobDeadlineNotifications: true,
      jobExpiryNotifications: true,
      profileCompletionNotifications: true,
      meetingReminderNotifications: true,
      meetingFeedbackNotifications: true,
      messageNotifications: true,
      securityAlertNotifications: true
    };

    // Update with values from database if they exist
    settings.forEach(setting => {
      if (setting.settingKey === 'NOTIFICATION_JOB_DEADLINE') {
        notificationSettings.jobDeadlineNotifications = setting.settingValue === '1';
      } else if (setting.settingKey === 'NOTIFICATION_JOB_EXPIRY') {
        notificationSettings.jobExpiryNotifications = setting.settingValue === '1';
      } else if (setting.settingKey === 'NOTIFICATION_PROFILE_COMPLETION') {
        notificationSettings.profileCompletionNotifications = setting.settingValue === '1';
      } else if (setting.settingKey === 'NOTIFICATION_MEETING_REMINDER') {
        notificationSettings.meetingReminderNotifications = setting.settingValue === '1';
      } else if (setting.settingKey === 'NOTIFICATION_MEETING_FEEDBACK') {
        notificationSettings.meetingFeedbackNotifications = setting.settingValue === '1';
      } else if (setting.settingKey === 'NOTIFICATION_MESSAGE') {
        notificationSettings.messageNotifications = setting.settingValue === '1';
      } else if (setting.settingKey === 'NOTIFICATION_SECURITY_ALERT') {
        notificationSettings.securityAlertNotifications = setting.settingValue === '1';
      }
    });

    res.json(notificationSettings);
  } catch (error) {
    console.error(`Error getting notification settings: ${error}`);
    res.status(500).json({ error: "Failed to get notification settings" });
  }
});

/**
 * Update notification settings
 * PUT /api/admin/notification-settings
 */
router.put("/notification-settings", verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('Received notification settings update request:', req.body);

    const pool = req.app.locals.pool;
    const {
      jobDeadlineNotifications,
      jobExpiryNotifications,
      profileCompletionNotifications,
      meetingReminderNotifications,
      meetingFeedbackNotifications,
      messageNotifications,
      securityAlertNotifications
    } = req.body;

    // Validate input
    if (typeof jobDeadlineNotifications !== 'boolean' ||
        typeof jobExpiryNotifications !== 'boolean' ||
        typeof profileCompletionNotifications !== 'boolean' ||
        typeof meetingReminderNotifications !== 'boolean' ||
        typeof meetingFeedbackNotifications !== 'boolean' ||
        typeof messageNotifications !== 'boolean' ||
        typeof securityAlertNotifications !== 'boolean') {
      console.error('Invalid notification settings format:', req.body);
      return res.status(400).json({ error: "Invalid notification settings format" });
    }

    console.log('Updating notification settings in database');

    // Update settings in database using REPLACE INTO to handle both insert and update
    try {
      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['NOTIFICATION_JOB_DEADLINE', jobDeadlineNotifications ? '1' : '0']
      );

      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['NOTIFICATION_JOB_EXPIRY', jobExpiryNotifications ? '1' : '0']
      );

      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['NOTIFICATION_PROFILE_COMPLETION', profileCompletionNotifications ? '1' : '0']
      );

      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['NOTIFICATION_MEETING_REMINDER', meetingReminderNotifications ? '1' : '0']
      );

      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['NOTIFICATION_MEETING_FEEDBACK', meetingFeedbackNotifications ? '1' : '0']
      );

      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['NOTIFICATION_MESSAGE', messageNotifications ? '1' : '0']
      );

      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['NOTIFICATION_SECURITY_ALERT', securityAlertNotifications ? '1' : '0']
      );

      console.log('Database update successful');
    } catch (dbError) {
      console.error('Database error when updating notification settings:', dbError);
      return res.status(500).json({ error: `Database error: ${dbError.message}` });
    }

    console.log('Updating scheduler tasks');

    // Update scheduler tasks based on new settings
    try {
      // Check if scheduler and scheduledTasks are properly initialized
      if (!scheduler || !scheduler.scheduledTasks) {
        console.log('Scheduler or scheduledTasks not properly initialized, skipping task updates');
        // Continue without updating scheduler tasks
      } else {
        if (!jobDeadlineNotifications) {
          scheduler.cancelJob('sendApplicationDeadlineReminders');
        } else if (!scheduler.jobs['sendApplicationDeadlineReminders'] &&
                   typeof scheduler.scheduledTasks.sendApplicationDeadlineReminders === 'function') {
          scheduler.scheduleJob('sendApplicationDeadlineReminders', '0 */6 * * *',
            scheduler.scheduledTasks.sendApplicationDeadlineReminders);
        }

        if (!jobExpiryNotifications) {
          scheduler.cancelJob('checkExpiringJobs');
        } else if (!scheduler.jobs['checkExpiringJobs'] &&
                   typeof scheduler.scheduledTasks.checkExpiringJobs === 'function') {
          scheduler.scheduleJob('checkExpiringJobs', '0 */12 * * *',
            scheduler.scheduledTasks.checkExpiringJobs);
        }

        if (!profileCompletionNotifications) {
          scheduler.cancelJob('checkIncompleteProfiles');
        } else if (!scheduler.jobs['checkIncompleteProfiles'] &&
                   typeof scheduler.scheduledTasks.checkIncompleteProfiles === 'function') {
          scheduler.scheduleJob('checkIncompleteProfiles', '0 0 * * *',
            scheduler.scheduledTasks.checkIncompleteProfiles);
        }

        if (!meetingReminderNotifications) {
          scheduler.cancelJob('sendMeetingReminders');
        } else if (!scheduler.jobs['sendMeetingReminders'] &&
                   typeof scheduler.scheduledTasks.sendMeetingReminders === 'function') {
          scheduler.scheduleJob('sendMeetingReminders', '0 */4 * * *',
            scheduler.scheduledTasks.sendMeetingReminders);
        }

        if (!meetingFeedbackNotifications) {
          scheduler.cancelJob('sendMeetingFeedbackRequests');
        } else if (!scheduler.jobs['sendMeetingFeedbackRequests'] &&
                   typeof scheduler.scheduledTasks.sendMeetingFeedbackRequests === 'function') {
          scheduler.scheduleJob('sendMeetingFeedbackRequests', '0 12 * * *',
            scheduler.scheduledTasks.sendMeetingFeedbackRequests);
        }
      }

      console.log('Scheduler tasks updated successfully');
    } catch (schedulerError) {
      console.error('Scheduler error when updating tasks:', schedulerError);
      // Continue despite scheduler errors - settings are saved in DB
    }

    console.log('Notification settings update completed successfully');
    res.json({ success: true, message: "Notification settings updated successfully" });
  } catch (error) {
    console.error(`Error updating notification settings: ${error}`);
    res.status(500).json({ error: `Failed to update notification settings: ${error.message}` });
  }
});

/**
 * Get system settings
 * GET /api/admin/system-settings
 */
router.get("/system-settings", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    // Get system settings from database
    const [settings] = await pool.execute(
      "SELECT * FROM system_settings WHERE settingKey LIKE 'SYSTEM_%'"
    );

    // Default settings
    const systemSettings = {
      siteName: 'GUIDIA',
      supportEmail: 'support@guidia.com',
      dateFormat: 'D MMMM YYYY',
      maintenanceMode: false
    };

    // Update with values from database if they exist
    settings.forEach(setting => {
      if (setting.settingKey === 'SYSTEM_SITE_NAME') {
        systemSettings.siteName = setting.settingValue;
      } else if (setting.settingKey === 'SYSTEM_SUPPORT_EMAIL') {
        systemSettings.supportEmail = setting.settingValue;
      } else if (setting.settingKey === 'SYSTEM_DATE_FORMAT') {
        systemSettings.dateFormat = setting.settingValue;
      } else if (setting.settingKey === 'SYSTEM_MAINTENANCE_MODE') {
        systemSettings.maintenanceMode = setting.settingValue === '1';
      }
    });

    res.json(systemSettings);
  } catch (error) {
    console.error(`Error getting system settings: ${error}`);
    res.status(500).json({ error: "Failed to get system settings" });
  }
});

/**
 * Update system settings
 * PUT /api/admin/system-settings
 */
router.put("/system-settings", verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('Received system settings update request:', req.body);

    const pool = req.app.locals.pool;
    const { siteName, supportEmail, dateFormat, maintenanceMode } = req.body;

    // Validate input
    if (!siteName || !supportEmail || !dateFormat || typeof maintenanceMode !== 'boolean') {
      console.error('Invalid system settings format:', req.body);
      return res.status(400).json({ error: "Invalid system settings format" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(supportEmail)) {
      console.error('Invalid email format:', supportEmail);
      return res.status(400).json({ error: "Invalid email format" });
    }

    console.log('Updating system settings in database');

    // Update settings in database
    try {
      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['SYSTEM_SITE_NAME', siteName]
      );

      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['SYSTEM_SUPPORT_EMAIL', supportEmail]
      );

      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['SYSTEM_DATE_FORMAT', dateFormat]
      );

      await pool.execute(
        "REPLACE INTO system_settings (settingKey, settingValue) VALUES (?, ?)",
        ['SYSTEM_MAINTENANCE_MODE', maintenanceMode ? '1' : '0']
      );

      console.log('Database update successful');
    } catch (dbError) {
      console.error('Database error when updating system settings:', dbError);
      return res.status(500).json({ error: `Database error: ${dbError.message}` });
    }

    // If maintenance mode is enabled, notify all connected users
    if (maintenanceMode) {
      try {
        // Check if socket.io is available and has the broadcast method
        const io = req.app.locals.io;
        if (io) {
          console.log('Broadcasting maintenance mode notification');
          io.emit('notification', {
            type: 'MAINTENANCE_MODE',
            message: 'The system will be entering maintenance mode soon. Please save your work and log out.',
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('Socket.io not available, skipping broadcast');
        }
      } catch (notificationError) {
        console.error('Error sending maintenance mode notification:', notificationError);
        // Continue despite notification errors - settings are saved in DB
      }
    }

    console.log('System settings update completed successfully');
    res.json({ success: true, message: "System settings updated successfully" });
  } catch (error) {
    console.error(`Error updating system settings: ${error}`);
    res.status(500).json({ error: `Failed to update system settings: ${error.message}` });
  }
});

/**
 * Send platform announcement to users
 * POST /api/admin/send-announcement
 */
router.post("/send-announcement", verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('Received announcement request:', req.body);

    const pool = req.app.locals.pool;
    const { message, targetRoles } = req.body;

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!targetRoles || !Array.isArray(targetRoles) || targetRoles.length === 0) {
      return res.status(400).json({ error: "At least one target role is required" });
    }

    // Validate roles
    const validRoles = ['Student', 'Counselor', 'Company'];
    const invalidRoles = targetRoles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        error: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${validRoles.join(', ')}`
      });
    }

    // Initialize notification triggers
    const notificationTriggers = new NotificationTriggers(pool);

    // Send announcements to each role
    let totalRecipients = 0;

    for (const role of targetRoles) {
      try {
        await notificationTriggers.platformAnnouncement(message, role);

        // Count recipients for this role
        const [users] = await pool.execute(
          "SELECT COUNT(*) as count FROM users WHERE roleID = ?",
          [role === 'Student' ? 2 : role === 'Counselor' ? 3 : 4]
        );

        totalRecipients += users[0].count;
      } catch (roleError) {
        console.error(`Error sending announcement to ${role}:`, roleError);
        // Continue with other roles despite errors
      }
    }

    // Log the announcement to the system activity log
    try {
      await pool.execute(
        "INSERT INTO system_activity_log (activityType, userID, details) VALUES (?, ?, ?)",
        [
          'PLATFORM_ANNOUNCEMENT',
          req.user.id,
          JSON.stringify({
            message,
            targetRoles,
            recipientCount: totalRecipients,
            timestamp: new Date().toISOString()
          })
        ]
      );
    } catch (logError) {
      console.error('Error logging announcement to activity log:', logError);
      // Continue despite logging errors
    }

    res.json({
      success: true,
      message: "Announcement sent successfully",
      recipientCount: totalRecipients
    });
  } catch (error) {
    console.error(`Error sending announcement: ${error}`);
    res.status(500).json({ error: `Failed to send announcement: ${error.message}` });
  }
});

/**
 * Get job statistics for admin dashboard
 * GET /api/admin/job-statistics
 */
router.get("/job-statistics", verifyToken, verifyAdmin, async (req, res) => {
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
    const nowFormatted = moment(now).format("YYYY-MM-DD");
    const sevenDaysAgoFormatted = moment(sevenDaysAgo).format("YYYY-MM-DD");
    const thirtyDaysAgoFormatted = moment(thirtyDaysAgo).format("YYYY-MM-DD");
    const nextSevenDaysFormatted = moment(nextSevenDays).format("YYYY-MM-DD");

    // Get total active job postings
    const [totalActiveJobs] = await pool.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE status = "active" AND endDate >= ?',
      [nowFormatted]
    );

    // Get jobs posted in the last 7 days
    const [jobsLast7Days] = await pool.execute(
      "SELECT COUNT(*) as count FROM jobs WHERE createdAt >= ?",
      [sevenDaysAgoFormatted]
    );

    // Get jobs posted in the last 30 days
    const [jobsLast30Days] = await pool.execute(
      "SELECT COUNT(*) as count FROM jobs WHERE createdAt >= ?",
      [thirtyDaysAgoFormatted]
    );

    // Get jobs expiring in the next 7 days
    const [jobsExpiringSoon] = await pool.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE status = "active" AND endDate BETWEEN ? AND ?',
      [nowFormatted, nextSevenDaysFormatted]
    );

    // Get most viewed jobs (at least 10 views)
    const [mostViewedJobs] = await pool.execute(
      `
      SELECT j.jobID, j.title, j.companyID, c.companyName, COUNT(jv.viewID) as viewCount
      FROM jobs j
      LEFT JOIN job_views jv ON j.jobID = jv.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.status = "active" AND j.endDate >= ?
      GROUP BY j.jobID
      HAVING viewCount >= 10
      ORDER BY viewCount DESC
    `,
      [nowFormatted]
    );

    // Get least viewed jobs (fewer than 10 views, including 0 views)
    const [leastViewedJobs] = await pool.execute(
      `
      SELECT j.jobID, j.title, j.companyID, c.companyName, COUNT(jv.viewID) as viewCount
      FROM jobs j
      LEFT JOIN job_views jv ON j.jobID = jv.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.status = "active" AND j.endDate >= ?
      GROUP BY j.jobID
      HAVING viewCount < 10
      ORDER BY viewCount ASC
    `,
      [nowFormatted]
    );

    // Get jobs with most applications (at least 10 applications)
    const [mostApplicationJobs] = await pool.execute(
      `
      SELECT j.jobID, j.title, j.companyID, c.companyName, COUNT(ja.applicationID) as applicationCount
      FROM jobs j
      LEFT JOIN job_applications ja ON j.jobID = ja.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.status = "active" AND j.endDate >= ?
      GROUP BY j.jobID
      HAVING applicationCount >= 10
      ORDER BY applicationCount DESC
    `,
      [nowFormatted]
    );

    // Get jobs with least applications (fewer than 10 applications)
    const [leastApplicationJobs] = await pool.execute(
      `
      SELECT j.jobID, j.title, j.companyID, c.companyName, COUNT(ja.applicationID) as applicationCount
      FROM jobs j
      LEFT JOIN job_applications ja ON j.jobID = ja.jobID
      LEFT JOIN companies c ON j.companyID = c.companyID
      WHERE j.status = "active" AND j.endDate >= ?
      GROUP BY j.jobID
      HAVING applicationCount < 10
      ORDER BY applicationCount ASC
    `,
      [nowFormatted]
    );

    // Get job posting trend data (last 30 days)
    const [jobPostingTrend] = await pool.execute(
      `
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM jobs
      WHERE createdAt >= ?
      GROUP BY DATE(createdAt)
      ORDER BY date
    `,
      [thirtyDaysAgoFormatted]
    );

    // Get job views trend data (last 30 days)
    const [jobViewsTrend] = await pool.execute(
      `
      SELECT
        DATE(viewedAt) as date,
        COUNT(*) as count
      FROM job_views
      WHERE viewedAt >= ?
      GROUP BY DATE(viewedAt)
      ORDER BY date
    `,
      [thirtyDaysAgoFormatted]
    );

    const jobStats = {
      totalActiveJobs: totalActiveJobs[0].count,
      jobsLast7Days: jobsLast7Days[0].count,
      jobsLast30Days: jobsLast30Days[0].count,
      jobsExpiringSoon: jobsExpiringSoon[0].count,
      mostViewedJobs,
      leastViewedJobs,
      mostApplicationJobs,
      leastApplicationJobs,
      jobPostingTrend,
      jobViewsTrend,
    };

    // Send real-time update to admin dashboard
    if (notificationSocketService) {
      notificationSocketService.sendAdminDashboardUpdate({
        type: 'job_statistics_update',
        data: jobStats
      });
    }

    res.json(jobStats);
  } catch (error) {
    console.error("Error fetching job statistics:", error);
    res.status(500).json({ error: "Failed to fetch job statistics" });
  }
});

/**
 * Get application statistics for admin dashboard
 * GET /api/admin/application-statistics
 */
router.get(
  "/application-statistics",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const pool = req.app.locals.pool;
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      // Format dates for MySQL
      const sevenDaysAgoFormatted = moment(sevenDaysAgo).format("YYYY-MM-DD");
      const thirtyDaysAgoFormatted = moment(thirtyDaysAgo).format("YYYY-MM-DD");

      // Get total applications
      const [totalApplications] = await pool.execute(
        "SELECT COUNT(*) as count FROM job_applications"
      );

      // Get applications in the last 7 days
      const [applicationsLast7Days] = await pool.execute(
        "SELECT COUNT(*) as count FROM job_applications WHERE submittedAt >= ?",
        [sevenDaysAgoFormatted]
      );

      // Get applications in the last 30 days
      const [applicationsLast30Days] = await pool.execute(
        "SELECT COUNT(*) as count FROM job_applications WHERE submittedAt >= ?",
        [thirtyDaysAgoFormatted]
      );

      // Get application status breakdown
      const [applicationsByStatus] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM job_applications
      GROUP BY status
    `);

      // Get application trend data (last 30 days)
      const [applicationTrend] = await pool.execute(
        `
      SELECT
        DATE(submittedAt) as date,
        COUNT(*) as count
      FROM job_applications
      WHERE submittedAt >= ?
      GROUP BY DATE(submittedAt)
      ORDER BY date
    `,
        [thirtyDaysAgoFormatted]
      );

      // Calculate conversion rate (views to applications)
      const [totalViews] = await pool.execute(
        "SELECT COUNT(*) as count FROM job_views"
      );

      // Calculate conversion rate and ensure it's a reasonable value (cap at 100%)
      let conversionRate = 0;
      if (totalViews[0].count > 0) {
        // Calculate as applications / views, capped at 1.0 (100%)
        const rawRate = Math.min(totalApplications[0].count / totalViews[0].count, 1.0);
        conversionRate = (rawRate * 100).toFixed(2);
      }

      const appStats = {
        totalApplications: totalApplications[0].count,
        applicationsLast7Days: applicationsLast7Days[0].count,
        applicationsLast30Days: applicationsLast30Days[0].count,
        applicationsByStatus,
        applicationTrend,
        conversionRate,
      };

      // Send real-time update to admin dashboard
      if (notificationSocketService) {
        notificationSocketService.sendAdminDashboardUpdate({
          type: 'application_statistics_update',
          data: appStats
        });
      }

      res.json(appStats);
    } catch (error) {
      console.error("Error fetching application statistics:", error);
      res.status(500).json({ error: "Failed to fetch application statistics" });
    }
  }
);

/**
 * Get meeting statistics for admin dashboard
 * GET /api/admin/meeting-statistics
 */
router.get(
  "/meeting-statistics",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const pool = req.app.locals.pool;

      // Get total meetings count
      const [totalMeetings] = await pool.execute(
        "SELECT COUNT(*) as count FROM meetings"
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
      SELECT COALESCE(AVG(meetingSuccessRating), 0) as avgRating
      FROM meeting_feedback
    `);

      // Get average platform experience rating
      const [avgPlatformRating] = await pool.execute(`
      SELECT COALESCE(AVG(platformExperienceRating), 0) as avgRating
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
        avgSuccessRating: Number(avgSuccessRating[0].avgRating) || 0,
        avgPlatformRating: Number(avgPlatformRating[0].avgRating) || 0,
        busiestDays,
        busiestHours,
        upcomingMeetings,
      });
    } catch (error) {
      console.error("Error fetching meeting statistics:", error);
      res.status(500).json({ error: "Failed to fetch meeting statistics" });
    }
  }
);

/**
 * Get user activity statistics for admin dashboard
 * GET /api/admin/user-activity
 */
router.get("/user-activity", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Format dates for MySQL
    const sevenDaysAgoFormatted = moment(sevenDaysAgo).format("YYYY-MM-DD");
    const thirtyDaysAgoFormatted = moment(thirtyDaysAgo).format("YYYY-MM-DD");

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
    const [userRegistrationTrend] = await pool.execute(
      `
      SELECT
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM registrations
      WHERE status = "approved" AND createdAt >= ?
      GROUP BY DATE(createdAt)
      ORDER BY date
    `,
      [thirtyDaysAgoFormatted]
    );

    // Get profile completion rates with improved checks for meaningful content
    // Get individual student profile completion rates
    const [studentProfiles] = await pool.execute(`
      SELECT
        studentID,
        CASE WHEN studentProfileImagePath IS NOT NULL AND studentProfileImagePath != '' THEN 1 ELSE 0 END as hasProfileImage,
        CASE WHEN studentDescription IS NOT NULL AND studentDescription != '' THEN 1 ELSE 0 END as hasDescription,
        CASE WHEN studentCareerPathways IS NOT NULL AND studentCareerPathways != '' AND studentCareerPathways != '[]' THEN 1 ELSE 0 END as hasCareerPathways,
        CASE WHEN studentDocuments IS NOT NULL AND studentDocuments != '' AND studentDocuments != '[]' THEN 1 ELSE 0 END as hasDocuments
      FROM students
    `);

    // Get individual counselor profile completion rates
    const [counselorProfiles] = await pool.execute(`
      SELECT
        counselorID,
        CASE WHEN counselorProfileImagePath IS NOT NULL AND counselorProfileImagePath != '' THEN 1 ELSE 0 END as hasProfileImage,
        CASE WHEN counselorDescription IS NOT NULL AND counselorDescription != '' THEN 1 ELSE 0 END as hasDescription,
        CASE WHEN counselorSpecializations IS NOT NULL AND counselorSpecializations != '' AND counselorSpecializations != '[]' THEN 1 ELSE 0 END as hasSpecializations
      FROM counselors
    `);

    // Get individual company profile completion rates
    const [companyProfiles] = await pool.execute(`
      SELECT
        companyID,
        CASE WHEN companyLogoPath IS NOT NULL AND companyLogoPath != '' THEN 1 ELSE 0 END as hasLogo,
        CASE WHEN companyDescription IS NOT NULL AND companyDescription != '' THEN 1 ELSE 0 END as hasDescription,
        CASE WHEN companyWebsite IS NOT NULL AND companyWebsite != '' THEN 1 ELSE 0 END as hasWebsite
      FROM companies
    `);

    // Calculate individual completion percentages and then average them
    // Calculate student completion rate
    let studentCompletionRate = 0;
    if (studentProfiles.length > 0) {
      // Calculate completion percentage for each student
      const studentCompletions = studentProfiles.map(student => {
        const completedFields = student.hasProfileImage + student.hasDescription +
                               student.hasCareerPathways + student.hasDocuments;
        return (completedFields / 4) * 100; // 4 is the total number of fields we check
      });

      // Calculate the average completion percentage
      const totalCompletion = studentCompletions.reduce((sum, percentage) => sum + percentage, 0);
      studentCompletionRate = (totalCompletion / studentProfiles.length).toFixed(1);
    }

    // Calculate counselor completion rate
    let counselorCompletionRate = 0;
    if (counselorProfiles.length > 0) {
      // Calculate completion percentage for each counselor
      const counselorCompletions = counselorProfiles.map(counselor => {
        const completedFields = counselor.hasProfileImage + counselor.hasDescription +
                                counselor.hasSpecializations;
        return (completedFields / 3) * 100; // 3 is the total number of fields we check
      });

      // Calculate the average completion percentage
      const totalCompletion = counselorCompletions.reduce((sum, percentage) => sum + percentage, 0);
      counselorCompletionRate = (totalCompletion / counselorProfiles.length).toFixed(1);
    }

    // Calculate company completion rate
    let companyCompletionRate = 0;
    if (companyProfiles.length > 0) {
      // Calculate completion percentage for each company
      const companyCompletions = companyProfiles.map(company => {
        const completedFields = company.hasLogo + company.hasDescription +
                               company.hasWebsite;
        return (completedFields / 3) * 100; // 3 is the total number of fields we check
      });

      // Calculate the average completion percentage
      const totalCompletion = companyCompletions.reduce((sum, percentage) => sum + percentage, 0);
      companyCompletionRate = (totalCompletion / companyProfiles.length).toFixed(1);
    }

    res.json({
      newUsers7Days: newUsers7Days[0].count,
      newUsers30Days: newUsers30Days[0].count,
      userRegistrationTrend,
      profileCompletion: {
        student: studentCompletionRate,
        counselor: counselorCompletionRate,
        company: companyCompletionRate,
      },
    });
  } catch (error) {
    console.error("Error fetching user activity statistics:", error);
    res.status(500).json({ error: "Failed to fetch user activity statistics" });
  }
});

/**
 * Get security audit statistics for admin dashboard
 * GET /api/admin/security-statistics
 */
router.get(
  "/security-statistics",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const pool = req.app.locals.pool;
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      // Format dates for MySQL
      const sevenDaysAgoFormatted = moment(sevenDaysAgo).format("YYYY-MM-DD");

      // Get recent security events
      const [recentEvents] = await pool.execute(`
      SELECT eventType, details, userID, timeStamp
      FROM security_audit_log
      ORDER BY timeStamp DESC
      LIMIT 10
    `);

      // Get login attempts (successful/failed) in the last 7 days
      const [loginAttempts] = await pool.execute(
        `
      SELECT
        eventType,
        COUNT(*) as count
      FROM security_audit_log
      WHERE (eventType = 'LOGIN_SUCCESS' OR eventType = 'LOGIN_FAILED')
        AND timeStamp >= ?
      GROUP BY eventType
    `,
        [sevenDaysAgoFormatted]
      );

      // Get account status changes in the last 7 days
      const [accountStatusChanges] = await pool.execute(
        `
      SELECT
        COUNT(*) as count
      FROM security_audit_log
      WHERE (eventType = 'ACCOUNT_STATUS_CHANGE' OR eventType = 'USER_STATUS_CHANGED')
        AND timeStamp >= ?
    `,
        [sevenDaysAgoFormatted]
      );

      res.json({
        recentEvents,
        loginAttempts,
        accountStatusChanges: accountStatusChanges[0].count,
      });
    } catch (error) {
      console.error("Error fetching security statistics:", error);
      res.status(500).json({ error: "Failed to fetch security statistics" });
    }
  }
);

/**
 * Get communication statistics for admin dashboard
 * GET /api/admin/communication-statistics
 */
router.get(
  "/communication-statistics",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      // Get Firebase database reference
      let { database } = require('../firebase-admin');
      const pool = req.app.locals.pool;

      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      // Get all conversations from Firebase
      const conversationsSnapshot = await database.ref('messages/conversations').once('value');
      const conversations = conversationsSnapshot.val() || {};

      // Process all messages
      let allMessages = [];
      let unreadCount = 0;
      let activeConversations = [];

      // Track conversation message counts
      const conversationCounts = {};

      // Process each conversation
      for (const [conversationId, conversation] of Object.entries(conversations)) {
        if (!conversation.messages) continue;

        // Get user IDs from conversation ID (format: userId1_userId2)
        const [user1ID, user2ID] = conversationId.split('_');

        // Initialize conversation count
        if (!conversationCounts[conversationId]) {
          conversationCounts[conversationId] = {
            user1ID,
            user2ID,
            messageCount: 0,
            lastMessageTime: null
          };
        }

        // Process messages in this conversation
        for (const [messageId, message] of Object.entries(conversation.messages)) {
          // Skip system messages or invalid messages
          if (!message.timestamp || !message.sender || !message.receiver) continue;

          // Convert Firebase timestamp to Date object
          const timestamp = new Date(message.timestamp);

          // Add to all messages array
          allMessages.push({
            id: messageId,
            sender: message.sender,
            receiver: message.receiver,
            content: message.content,
            timestamp,
            read: message.read || false
          });

          // Count unread messages
          if (!message.read) {
            unreadCount++;
          }

          // Update conversation counts
          conversationCounts[conversationId].messageCount++;

          // Update last message time if newer
          if (!conversationCounts[conversationId].lastMessageTime ||
              timestamp > conversationCounts[conversationId].lastMessageTime) {
            conversationCounts[conversationId].lastMessageTime = timestamp;
          }
        }
      }

      // Get usernames for active conversations
      const conversationEntries = Object.values(conversationCounts);
      conversationEntries.sort((a, b) => b.messageCount - a.messageCount);

      // Get top 5 active conversations
      const top5Conversations = conversationEntries.slice(0, 5);

      // Get usernames for these conversations
      for (const conv of top5Conversations) {
        try {
          // Get user1 name
          const [user1Result] = await pool.execute(
            'SELECT username FROM users WHERE userID = ?',
            [conv.user1ID]
          );

          // Get user2 name
          const [user2Result] = await pool.execute(
            'SELECT username FROM users WHERE userID = ?',
            [conv.user2ID]
          );

          activeConversations.push({
            user1ID: conv.user1ID,
            user2ID: conv.user2ID,
            messageCount: conv.messageCount,
            lastMessageTime: conv.lastMessageTime.toISOString(),
            user1Name: user1Result[0]?.username || `User ${conv.user1ID}`,
            user2Name: user2Result[0]?.username || `User ${conv.user2ID}`
          });
        } catch (error) {
          console.error(`Error getting usernames for conversation ${conv.user1ID}_${conv.user2ID}:`, error);
          // Add conversation with default names if we can't get the real names
          activeConversations.push({
            user1ID: conv.user1ID,
            user2ID: conv.user2ID,
            messageCount: conv.messageCount,
            lastMessageTime: conv.lastMessageTime.toISOString(),
            user1Name: `User ${conv.user1ID}`,
            user2Name: `User ${conv.user2ID}`
          });
        }
      }

      // Count messages in time periods
      const totalMessages = allMessages.length;
      const messages7Days = allMessages.filter(msg => msg.timestamp >= sevenDaysAgo).length;
      const messages30Days = allMessages.filter(msg => msg.timestamp >= thirtyDaysAgo).length;

      // Generate message trend data (last 30 days)
      const messageTrend = [];
      const trendMap = new Map();

      // Initialize with all dates in the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        trendMap.set(dateString, 0);
      }

      // Count messages per day
      allMessages.forEach(msg => {
        if (msg.timestamp >= thirtyDaysAgo) {
          const dateString = msg.timestamp.toISOString().split('T')[0];
          if (trendMap.has(dateString)) {
            trendMap.set(dateString, trendMap.get(dateString) + 1);
          }
        }
      });

      // Convert map to array of objects
      trendMap.forEach((count, date) => {
        messageTrend.push({ date, count });
      });

      // Sort by date
      messageTrend.sort((a, b) => a.date.localeCompare(b.date));

      res.json({
        totalMessages,
        messages7Days,
        messages30Days,
        activeConversations,
        unreadMessages: unreadCount,
        messageTrend,
      });
    } catch (error) {
      console.error("Error fetching communication statistics:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch communication statistics" });
    }
  }
);

/**
 * Get system health statistics for admin dashboard
 * GET /api/admin/system-health
 */
router.get("/system-health", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Get scheduler status
    const schedulerStatus = {
      isRunning: !!scheduler.jobs && Object.keys(scheduler.jobs).length > 0,
      scheduledJobs: Object.keys(scheduler.jobs || {}).map((key) => ({
        name: key,
        nextInvocation: scheduler.jobs[key]?.nextInvocation() || null,
      })),
    };

    // Check database connection
    const pool = req.app.locals.pool;
    let dbStatus = "connected";
    try {
      await pool.execute("SELECT 1");
    } catch (error) {
      dbStatus = "disconnected";
    }

    const systemHealthData = {
      schedulerStatus,
      databaseStatus: dbStatus,
      serverTime: new Date().toISOString(),
    };

    // Send real-time update to admin dashboard
    if (notificationSocketService) {
      notificationSocketService.sendAdminDashboardUpdate({
        type: 'system_health_update',
        data: systemHealthData
      });
    }

    res.json(systemHealthData);
  } catch (error) {
    console.error("Error fetching system health statistics:", error);
    res.status(500).json({ error: "Failed to fetch system health statistics" });
  }
});

/**
 * Execute SQL query (admin only)
 * POST /api/admin/execute-sql
 */
router.post("/execute-sql", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    // Execute the query
    const [result] = await pool.query(sql);

    // Log the query for auditing
    console.log(`Admin SQL query executed by user ${req.user.id}:`, sql);

    // Log to security audit log if the table exists
    try {
      await pool.query(
        "INSERT INTO security_audit_log (eventType, details, userID, timestamp) VALUES (?, ?, ?, NOW())",
        [
          'ADMIN_SQL_QUERY',
          JSON.stringify({
            sql,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          }),
          req.user.id
        ]
      );
    } catch (logError) {
      // If the security_audit_log table doesn't exist yet, just log to console
      console.log('Could not log to security_audit_log table:', logError.message);
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error('Error executing SQL query:', error);
    res.status(500).json({ error: 'Failed to execute SQL query', details: error.message });
  }
});

/**
 * Get recent activity feed for admin dashboard
 * GET /api/admin/activity-feed
 */
router.get("/activity-feed", verifyToken, verifyAdmin, async (req, res) => {
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
      ORDER BY sal.timeStamp DESC
      LIMIT 5
    `);

    // Combine all activities into a single feed with type and timestamp
    const activities = [
      ...recentRegistrations.map((reg) => ({
        type: "registration",
        timestamp: reg.createdAt,
        data: reg,
      })),
      ...recentJobs.map((job) => ({
        type: "job",
        timestamp: job.createdAt,
        data: job,
      })),
      ...recentApplications.map((app) => ({
        type: "application",
        timestamp: app.submittedAt,
        data: app,
      })),
      ...recentMeetings.map((meeting) => ({
        type: "meeting",
        timestamp: meeting.createdAt,
        data: meeting,
      })),
      ...recentLogins.map((login) => ({
        type: "login",
        timestamp: login.timestamp,
        data: login,
      })),
    ];

    // Sort by timestamp (most recent first)
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return only the most recent 20 activities
    const activityFeedData = activities.slice(0, 20);

    // Send real-time update to admin dashboard
    if (notificationSocketService) {
      notificationSocketService.sendAdminDashboardUpdate({
        type: 'activity_feed_update',
        data: activityFeedData
      });
    }

    res.json(activityFeedData);
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    res.status(500).json({ error: "Failed to fetch activity feed" });
  }
});

/**
 * Manually trigger a dashboard update
 * POST /api/admin/trigger-dashboard-update
 * Body: { updateType: string }
 */
router.post('/trigger-dashboard-update', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { updateType } = req.body;

    if (!updateType) {
      return res.status(400).json({ error: 'Update type is required' });
    }

    // Fetch the appropriate data based on the update type
    let data = {};

    switch (updateType) {
      case 'job_statistics_update':
        // Reuse the job statistics endpoint logic
        const jobStatsRes = await fetch(`${req.protocol}://${req.get('host')}/api/admin/job-statistics`, {
          headers: {
            Authorization: req.headers.authorization
          }
        });
        data = await jobStatsRes.json();
        break;

      case 'application_statistics_update':
        // Reuse the application statistics endpoint logic
        const appStatsRes = await fetch(`${req.protocol}://${req.get('host')}/api/admin/application-statistics`, {
          headers: {
            Authorization: req.headers.authorization
          }
        });
        data = await appStatsRes.json();
        break;

      case 'activity_feed_update':
        // Reuse the activity feed endpoint logic
        const activityFeedRes = await fetch(`${req.protocol}://${req.get('host')}/api/admin/activity-feed`, {
          headers: {
            Authorization: req.headers.authorization
          }
        });
        data = await activityFeedRes.json();
        break;

      case 'system_health_update':
        // Reuse the system health endpoint logic
        const systemHealthRes = await fetch(`${req.protocol}://${req.get('host')}/api/admin/system-health`, {
          headers: {
            Authorization: req.headers.authorization
          }
        });
        data = await systemHealthRes.json();
        break;

      case 'all':
        // Trigger update for all dashboard components
        router.triggerAdminDashboardUpdate('dashboard_refresh', { message: 'Full dashboard refresh requested' });
        return res.json({ success: true, message: 'Full dashboard refresh triggered' });

      default:
        return res.status(400).json({ error: `Unknown update type: ${updateType}` });
    }

    // Trigger the update
    const success = router.triggerAdminDashboardUpdate(updateType, data);

    if (success) {
      res.json({ success: true, message: `${updateType} update triggered successfully` });
    } else {
      res.status(500).json({ error: 'Failed to trigger update, notification service not available' });
    }
  } catch (error) {
    console.error(`Error triggering dashboard update: ${error}`);
    res.status(500).json({ error: 'Failed to trigger dashboard update' });
  }
});

/**
 * Get counselor performance metrics for admin dashboard
 * GET /api/admin/counselor-performance
 */
router.get(
  "/counselor-performance",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const pool = req.app.locals.pool;

      // Get counselors with their meeting statistics
      const [counselorMeetingStats] = await pool.execute(`
        SELECT
          c.counselorID,
          c.counselorName,
          c.userID,
          COUNT(DISTINCT CASE WHEN m.recipientID = c.userID THEN m.meetingID END) as totalMeetingsReceived,
          COUNT(DISTINCT CASE WHEN m.recipientID = c.userID AND m.status = 'accepted' THEN m.meetingID END) as acceptedMeetings,
          COUNT(DISTINCT CASE WHEN m.recipientID = c.userID AND m.status = 'declined' THEN m.meetingID END) as declinedMeetings,
          COUNT(DISTINCT CASE WHEN m.requestorID = c.userID THEN m.meetingID END) as requestedMeetings,
          COUNT(DISTINCT CASE WHEN (m.requestorID = c.userID OR m.recipientID = c.userID) AND m.status = 'cancelled' THEN m.meetingID END) as cancelledMeetings,
          COUNT(DISTINCT CASE WHEN (m.requestorID = c.userID OR m.recipientID = c.userID) AND m.status = 'completed' THEN m.meetingID END) as completedMeetings,
          COUNT(DISTINCT CASE WHEN (m.requestorID = c.userID OR m.recipientID = c.userID) THEN m.meetingID END) as totalMeetings
        FROM counselors c
        LEFT JOIN meetings m ON c.userID = m.recipientID OR c.userID = m.requestorID
        GROUP BY c.counselorID, c.counselorName, c.userID
      `);

      // Calculate rates for each counselor
      const counselorPerformance = counselorMeetingStats.map(counselor => {
        // Avoid division by zero
        const acceptanceRate = counselor.totalMeetingsReceived > 0
          ? (counselor.acceptedMeetings / counselor.totalMeetingsReceived) * 100
          : 0;

        const declineRate = counselor.totalMeetingsReceived > 0
          ? (counselor.declinedMeetings / counselor.totalMeetingsReceived) * 100
          : 0;

        const requestRate = counselor.totalMeetings > 0
          ? (counselor.requestedMeetings / counselor.totalMeetings) * 100
          : 0;

        const cancellationRate = counselor.totalMeetings > 0
          ? (counselor.cancelledMeetings / counselor.totalMeetings) * 100
          : 0;

        const completionRate = counselor.totalMeetings > 0
          ? (counselor.completedMeetings / counselor.totalMeetings) * 100
          : 0;

        return {
          counselorID: counselor.counselorID,
          counselorName: counselor.counselorName,
          userID: counselor.userID,
          totalMeetings: counselor.totalMeetings,
          totalMeetingsReceived: counselor.totalMeetingsReceived,
          acceptedMeetings: counselor.acceptedMeetings,
          declinedMeetings: counselor.declinedMeetings,
          requestedMeetings: counselor.requestedMeetings,
          cancelledMeetings: counselor.cancelledMeetings,
          completedMeetings: counselor.completedMeetings,
          acceptanceRate: parseFloat(acceptanceRate.toFixed(2)),
          declineRate: parseFloat(declineRate.toFixed(2)),
          requestRate: parseFloat(requestRate.toFixed(2)),
          cancellationRate: parseFloat(cancellationRate.toFixed(2)),
          completionRate: parseFloat(completionRate.toFixed(2))
        };
      });

      // Sort counselors by different metrics to find highest and lowest
      const sortByAcceptanceRate = [...counselorPerformance].sort((a, b) => b.acceptanceRate - a.acceptanceRate);
      const sortByRequestRate = [...counselorPerformance].sort((a, b) => b.requestRate - a.requestRate);
      const sortByDeclineRate = [...counselorPerformance].sort((a, b) => b.declineRate - a.declineRate);
      const sortByCancellationRate = [...counselorPerformance].sort((a, b) => b.cancellationRate - a.cancellationRate);
      const sortByCompletionRate = [...counselorPerformance].sort((a, b) => b.completionRate - a.completionRate);

      // Get top and bottom performers for each metric (only include counselors with at least one meeting)
      const getTopBottomPerformers = (sortedArray, minMeetings = 1) => {
        const filtered = sortedArray.filter(c => c.totalMeetings >= minMeetings);
        return {
          highest: filtered.length > 0 ? filtered[0] : null,
          lowest: filtered.length > 1 ? filtered[filtered.length - 1] : null
        };
      };

      const result = {
        counselors: counselorPerformance,
        metrics: {
          acceptanceRate: getTopBottomPerformers(sortByAcceptanceRate),
          requestRate: getTopBottomPerformers(sortByRequestRate),
          declineRate: getTopBottomPerformers(sortByDeclineRate),
          cancellationRate: getTopBottomPerformers(sortByCancellationRate),
          completionRate: getTopBottomPerformers(sortByCompletionRate)
        }
      };

      res.json(result);
    } catch (error) {
      console.error("Error fetching counselor performance metrics:", error);
      res.status(500).json({ error: "Failed to fetch counselor performance metrics" });
    }
  }
);

module.exports = router;
