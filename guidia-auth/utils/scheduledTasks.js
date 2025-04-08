const NotificationTriggers = require('./notificationTriggers');

/**
 * Scheduled tasks for the application
 */
class ScheduledTasks {
  constructor(pool) {
    this.pool = pool;
    this.notificationTriggers = new NotificationTriggers(pool);
  }

  /**
   * Check for jobs that are about to expire and send notifications
   * This should be run daily
   */
  async checkExpiringJobs() {
    try {
      console.log('Running scheduled task: checkExpiringJobs');

      // Get jobs that expire in 3 days
      const [expiringJobs] = await this.pool.execute(`
        SELECT j.*, c.companyName, c.userID as companyUserID
        FROM jobs j
        JOIN companies c ON j.companyID = c.companyID
        WHERE j.status = 'active'
        AND j.endDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
        AND j.notifiedExpiring = 0
      `);

      console.log(`Found ${expiringJobs.length} jobs expiring soon`);

      // Send notifications for each expiring job
      for (const job of expiringJobs) {
        const daysLeft = Math.ceil((new Date(job.endDate) - new Date()) / (1000 * 60 * 60 * 24));

        await this.notificationTriggers.jobPostingExpiring(job, daysLeft);

        // Mark job as notified
        await this.pool.execute(
          'UPDATE jobs SET notifiedExpiring = 1 WHERE jobID = ?',
          [job.jobID]
        );

        console.log(`Sent expiration notification for job ${job.jobID}: ${job.title}`);
      }
    } catch (error) {
      console.error('Error in checkExpiringJobs task:', error);
    }
  }

  /**
   * Send job application deadline reminders
   * This should be run daily
   */
  async sendApplicationDeadlineReminders() {
    try {
      console.log('Running scheduled task: sendApplicationDeadlineReminders');

      // Get jobs with application deadlines in 2 days
      const [jobsWithDeadlines] = await this.pool.execute(`
        SELECT j.*, c.companyName, c.userID as companyUserID
        FROM jobs j
        JOIN companies c ON j.companyID = c.companyID
        WHERE j.status = 'active'
        AND j.endDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 DAY)
        AND j.notifiedDeadline = 0
      `);

      console.log(`Found ${jobsWithDeadlines.length} jobs with approaching deadlines`);

      // Get all saved jobs to check which ones need notifications
      const [savedJobs] = await this.pool.execute(`
        SELECT DISTINCT sj.jobID, sj.userID
        FROM saved_jobs sj
        JOIN jobs j ON sj.jobID = j.jobID
        WHERE j.status = 'active'
        AND j.endDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 DAY)
      `);

      console.log(`Found ${savedJobs.length} saved jobs with approaching deadlines`);

      // Send notifications for each job with approaching deadline
      let notificationCount = 0;
      for (const job of jobsWithDeadlines) {
        const daysLeft = Math.ceil((new Date(job.endDate) - new Date()) / (1000 * 60 * 60 * 24));

        // Check if any students have saved this job
        const studentsWithSavedJob = savedJobs.filter(sj => sj.jobID === job.jobID);

        if (studentsWithSavedJob.length > 0) {
          await this.notificationTriggers.jobApplicationDeadlineReminder(job, job, daysLeft);
          notificationCount += studentsWithSavedJob.length;

          // Mark job as notified for deadline
          await this.pool.execute(
            'UPDATE jobs SET notifiedDeadline = 1 WHERE jobID = ?',
            [job.jobID]
          );

          console.log(`Sent deadline reminder notifications for job ${job.jobID}: ${job.title} to ${studentsWithSavedJob.length} students`);
        } else {
          console.log(`No students have saved job ${job.jobID}: ${job.title}, skipping notifications`);
        }
      }

      console.log(`Sent a total of ${notificationCount} deadline reminder notifications`);
    } catch (error) {
      console.error('Error in sendApplicationDeadlineReminders task:', error);
    }
  }

  /**
   * Send job posting statistics
   * This should be run weekly
   */
  async sendJobPostingStats() {
    try {
      console.log('Running scheduled task: sendJobPostingStats');

      // Get active jobs that haven't had stats sent in the last week
      const [activeJobs] = await this.pool.execute(`
        SELECT j.*, c.companyName, c.userID as companyUserID
        FROM jobs j
        JOIN companies c ON j.companyID = c.companyID
        WHERE j.status = 'active'
        AND (j.lastStatsSent IS NULL OR j.lastStatsSent < DATE_SUB(NOW(), INTERVAL 7 DAY))
      `);

      console.log(`Found ${activeJobs.length} jobs for stats notifications`);

      // Send statistics notifications for each job
      for (const job of activeJobs) {
        // Get view count (this would need a job_views table in your database)
        const [viewsResult] = await this.pool.execute(
          'SELECT COUNT(*) as viewCount FROM job_views WHERE jobID = ?',
          [job.jobID]
        );
        const viewCount = viewsResult[0]?.viewCount || 0;

        // Get application count
        const [applicationsResult] = await this.pool.execute(
          'SELECT COUNT(*) as applicationCount FROM job_applications WHERE jobID = ?',
          [job.jobID]
        );
        const applicationCount = applicationsResult[0]?.applicationCount || 0;

        await this.notificationTriggers.jobPostingStats(job, viewCount, applicationCount);

        // Update last stats sent timestamp
        await this.pool.execute(
          'UPDATE jobs SET lastStatsSent = NOW() WHERE jobID = ?',
          [job.jobID]
        );

        console.log(`Sent stats notification for job ${job.jobID}: ${job.title} (Views: ${viewCount}, Applications: ${applicationCount})`);
      }
    } catch (error) {
      console.error('Error in sendJobPostingStats task:', error);
    }
  }

  /**
   * Check for incomplete profiles and send reminders
   * This should be run weekly
   */
  async checkIncompleteProfiles() {
    try {
      console.log('Running scheduled task: checkIncompleteProfiles');

      // Check for incomplete student profiles
      const [incompleteStudentProfiles] = await this.pool.execute(`
        SELECT s.*, u.userID, u.email
        FROM students s
        JOIN users u ON s.userID = u.userID
        WHERE u.roleID = 2
        AND (
          s.studentName IS NULL OR
          s.studentContactNumber IS NULL OR
          s.studentDescription IS NULL OR
          s.studentProfileImagePath IS NULL OR
          s.studentCategory IS NULL
        )
        AND (s.lastProfileReminder IS NULL OR s.lastProfileReminder < DATE_SUB(NOW(), INTERVAL 7 DAY))
      `);

      console.log(`Found ${incompleteStudentProfiles.length} incomplete student profiles`);

      // Send notifications for incomplete student profiles
      for (const student of incompleteStudentProfiles) {
        // Calculate completion percentage and missing fields
        const fields = {
          'Name': student.studentName,
          'Contact Number': student.studentContactNumber,
          'Description': student.studentDescription,
          'Profile Image': student.studentProfileImagePath,
          'Category': student.studentCategory
        };

        const missingFields = Object.entries(fields)
          .filter(([_, value]) => !value)
          .map(([field]) => field)
          .join(', ');

        const totalFields = Object.keys(fields).length;
        const completedFields = totalFields - missingFields.split(', ').length;
        const completionPercentage = Math.round((completedFields / totalFields) * 100);

        await this.notificationTriggers.profileIncomplete(
          student.userID,
          'Student',
          completionPercentage,
          missingFields
        );

        // Update last reminder timestamp
        await this.pool.execute(
          'UPDATE students SET lastProfileReminder = NOW() WHERE userID = ?',
          [student.userID]
        );

        console.log(`Sent profile completion reminder to student ${student.userID}: ${student.email} (${completionPercentage}% complete)`);
      }

      // Similar checks can be implemented for counselor and company profiles
    } catch (error) {
      console.error('Error in checkIncompleteProfiles task:', error);
    }
  }

  /**
   * Run all scheduled tasks
   * This can be called from a cron job
   */
  async runAllDailyTasks() {
    await this.checkExpiringJobs();
    await this.sendApplicationDeadlineReminders();
    await this.checkIncompleteProfiles();
  }

  /**
   * Run weekly tasks
   * This can be called from a cron job
   */
  async runAllWeeklyTasks() {
    await this.sendJobPostingStats();
  }
}

module.exports = ScheduledTasks;
