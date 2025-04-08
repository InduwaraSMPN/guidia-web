require('dotenv').config();
const mysql = require('mysql2/promise');
const ScheduledTasks = require('../utils/scheduledTasks');

// Get task type from command line arguments
const taskType = process.argv[2] || 'daily';

async function main() {
  console.log(`Running ${taskType} scheduled tasks at ${new Date().toISOString()}`);
  
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
    // Initialize scheduled tasks
    const scheduledTasks = new ScheduledTasks(pool);
    
    // Run tasks based on type
    if (taskType === 'daily') {
      await scheduledTasks.runAllDailyTasks();
    } else if (taskType === 'weekly') {
      await scheduledTasks.runAllWeeklyTasks();
    } else if (taskType === 'all') {
      await scheduledTasks.runAllDailyTasks();
      await scheduledTasks.runAllWeeklyTasks();
    } else {
      console.error(`Unknown task type: ${taskType}`);
      process.exit(1);
    }
    
    console.log(`Completed ${taskType} scheduled tasks at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Error running scheduled tasks:', error);
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
