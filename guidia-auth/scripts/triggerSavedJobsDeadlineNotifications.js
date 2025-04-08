require('dotenv').config();
const mysql = require('mysql2/promise');
const NotificationTriggers = require('../utils/notificationTriggers');

/**
 * Script to manually trigger deadline notifications for saved jobs
 * This is useful when the scheduled task has not run correctly
 */
async function main() {
  console.log(`Triggering saved jobs deadline notifications at ${new Date().toISOString()}`);
  
  // Create database connection
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Initialize notification triggers
    const notificationTriggers = new NotificationTriggers(pool);
    
    // Get all active jobs with deadlines in the next 2 days
    // Note: We're ignoring the notifiedDeadline flag to ensure notifications are sent
    const [jobsWithDeadlines] = await pool.execute(`
      SELECT j.*, c.companyName, c.userID as companyUserID 
      FROM jobs j 
      JOIN companies c ON j.companyID = c.companyID 
      WHERE j.status = 'active' 
      AND j.endDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 DAY)
    `);

    console.log(`Found ${jobsWithDeadlines.length} jobs with approaching deadlines`);

    // Get all saved jobs to check which ones need notifications
    const [savedJobs] = await pool.execute(`
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
        await notificationTriggers.jobApplicationDeadlineReminder(job, job, daysLeft);
        notificationCount += studentsWithSavedJob.length;
        
        // Mark job as notified for deadline
        await pool.execute(
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
    console.error('Error triggering deadline notifications:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
