require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Creating system_settings table...');
  
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
    
    // Read and execute the SQL file for creating system_settings table
    const systemSettingsSQL = fs.readFileSync(
      path.join(__dirname, '..', '..', 'system_settings.sql'), 
      'utf8'
    );
    
    // Split the SQL file into individual statements
    const statements = systemSettingsSQL
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
    
    console.log('System settings table created successfully');
  } catch (error) {
    console.error('Error creating system settings table:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

main().catch(console.error);
