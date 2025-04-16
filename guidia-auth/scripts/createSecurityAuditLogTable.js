require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Creating security_audit_log table...');

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
    console.log('Connected to database');

    // Read and execute the SQL file for creating security_audit_log table with securityAuditLogID and timeStamp columns
    const securityAuditLogSQL = fs.readFileSync(
      path.join(__dirname, '..', '..', 'security_audit_log.sql'),
      'utf8'
    );

    // Split the SQL file into individual statements
    const statements = securityAuditLogSQL
      .split(';')
      .filter(statement => statement.trim() !== '');

    // Execute each statement
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await pool.execute(statement);
        console.log('Statement executed successfully');
      } catch (error) {
        console.error(`Error executing statement: ${error.message}`);
        // Continue with next statement even if this one fails
      }
    }

    console.log('Security audit log table creation completed');
  } catch (error) {
    console.error('Error creating security audit log table:', error);
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
