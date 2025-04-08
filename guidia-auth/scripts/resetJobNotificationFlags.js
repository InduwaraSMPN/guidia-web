require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Script to reset notification flags for jobs
 * This is useful when you want to re-trigger notifications for jobs
 */
async function main() {
  const jobId = process.argv[2]; // Optional job ID to reset flags for a specific job
  
  console.log(`Resetting job notification flags at ${new Date().toISOString()}`);
  
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
    let query;
    let params = [];
    
    if (jobId) {
      // Reset flags for a specific job
      query = `
        UPDATE jobs 
        SET notifiedExpiring = 0, notifiedDeadline = 0 
        WHERE jobID = ?
      `;
      params = [jobId];
      console.log(`Resetting notification flags for job ID: ${jobId}`);
    } else {
      // Reset flags for all active jobs with deadlines in the future
      query = `
        UPDATE jobs 
        SET notifiedExpiring = 0, notifiedDeadline = 0 
        WHERE status = 'active' AND endDate > NOW()
      `;
      console.log('Resetting notification flags for all active jobs with future deadlines');
    }
    
    const [result] = await pool.execute(query, params);
    
    console.log(`Reset notification flags for ${result.affectedRows} jobs`);
  } catch (error) {
    console.error('Error resetting job notification flags:', error);
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
