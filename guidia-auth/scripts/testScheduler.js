require('dotenv').config();
const mysql = require('mysql2/promise');
const Scheduler = require('../utils/scheduler');

/**
 * Script to test the scheduler
 * This is useful for verifying that the scheduler is working correctly
 */
async function main() {
  console.log(`Testing scheduler at ${new Date().toISOString()}`);
  
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
    // Initialize scheduler
    const scheduler = new Scheduler(pool);
    
    // Run daily tasks
    console.log('Running daily tasks...');
    await scheduler.runDailyTasks();
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error testing scheduler:', error);
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
