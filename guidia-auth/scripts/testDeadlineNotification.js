require('dotenv').config();
const mysql = require('mysql2/promise');
const NotificationTriggers = require('../utils/notificationTriggers');

async function main() {
  console.log(`Testing JOB_APPLICATION_DEADLINE notification at ${new Date().toISOString()}`);
  
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
    
    // Get a job to test with
    const [jobs] = await pool.execute(`
      SELECT j.*, c.companyName, c.userID as companyUserID 
      FROM jobs j 
      JOIN companies c ON j.companyID = c.companyID 
      WHERE j.status = 'active'
      LIMIT 1
    `);

    if (jobs.length === 0) {
      console.error('No active jobs found to test with');
      process.exit(1);
    }

    const job = jobs[0];
    const daysLeft = 2; // Simulate 2 days left until deadline
    
    console.log(`Testing with job: ${job.jobID} - ${job.title}`);
    
    // Trigger the notification
    await notificationTriggers.jobApplicationDeadlineReminder(job, job, daysLeft);
    
    console.log('Notification triggered successfully');
  } catch (error) {
    console.error('Error testing notification:', error);
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
