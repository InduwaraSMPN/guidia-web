/**
 * Script to set up the meeting_unavailability table in the database
 * This table stores periods when users are unavailable for meetings
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupMeetingUnavailabilityTable() {
  let connection;

  try {
    // Create connection to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'guidia',
    });

    console.log('Connected to MySQL database');

    // Create meeting_unavailability table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS meeting_unavailability (
        unavailabilityID INT AUTO_INCREMENT PRIMARY KEY,
        userID INT NOT NULL,
        startDateTime DATETIME NOT NULL,
        endDateTime DATETIME NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);

    console.log('✅ meeting_unavailability table created or already exists');

    // Add indexes for better performance
    try {
      await connection.execute(`
        CREATE INDEX idx_meeting_unavailability_user ON meeting_unavailability(userID)
      `);
      console.log('✅ Index on userID created');
    } catch (error) {
      // Index might already exist, which is fine
      console.log('Note: Index on userID might already exist');
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_meeting_unavailability_dates ON meeting_unavailability(startDateTime, endDateTime)
      `);
      console.log('✅ Index on date fields created');
    } catch (error) {
      // Index might already exist, which is fine
      console.log('Note: Index on date fields might already exist');
    }

    console.log('✅ Setup completed successfully');
  } catch (error) {
    console.error('Error setting up meeting_unavailability table:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the setup function
setupMeetingUnavailabilityTable();
