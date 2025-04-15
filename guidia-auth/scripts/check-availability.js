require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  console.log('Checking meeting availability settings...');
  
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
    
    // Get all users with availability settings
    const [users] = await pool.query(`
      SELECT DISTINCT ma.userID, u.username, u.email, u.roleID
      FROM meeting_availability ma
      JOIN users u ON ma.userID = u.userID
      ORDER BY ma.userID
    `);
    
    console.log(`Found ${users.length} users with availability settings:`);
    
    // For each user, get their availability settings
    for (const user of users) {
      console.log(`\nUser ID: ${user.userID}, Username: ${user.username}, Role: ${user.roleID}`);
      
      const [availability] = await pool.query(`
        SELECT * FROM meeting_availability
        WHERE userID = ?
        ORDER BY dayOfWeek, startTime
      `, [user.userID]);
      
      console.log(`Found ${availability.length} availability slots:`);
      
      availability.forEach((slot, index) => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[slot.dayOfWeek];
        
        console.log(`  ${index + 1}. ${slot.isRecurring ? `${dayName} (recurring)` : `Specific date: ${slot.specificDate}`}`);
        console.log(`     Time: ${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`);
      });
    }
    
    // Check for a specific user ID if provided as command line argument
    const specificUserId = process.argv[2];
    if (specificUserId) {
      console.log(`\nChecking available slots for user ID ${specificUserId} for today:`);
      
      const today = new Date().toISOString().split('T')[0];
      const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      console.log(`Today: ${today}, Day of week: ${dayOfWeek}`);
      
      const [availabilitySlots] = await pool.query(`
        SELECT * FROM meeting_availability
        WHERE userID = ? AND
        ((isRecurring = 1 AND dayOfWeek = ?) OR
         (isRecurring = 0 AND specificDate = ?))
        ORDER BY startTime
      `, [specificUserId, dayOfWeek, today]);
      
      console.log(`Found ${availabilitySlots.length} availability slots for today:`);
      
      availabilitySlots.forEach((slot, index) => {
        console.log(`  ${index + 1}. Time: ${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`);
      });
      
      // Check existing meetings for this user today
      const [existingMeetings] = await pool.query(`
        SELECT * FROM meetings
        WHERE (requestorID = ? OR recipientID = ?)
        AND meetingDate = ?
        AND status IN ('accepted', 'requested')
      `, [specificUserId, specificUserId, today]);
      
      console.log(`Found ${existingMeetings.length} existing meetings for today:`);
      
      existingMeetings.forEach((meeting, index) => {
        console.log(`  ${index + 1}. Meeting ID: ${meeting.meetingID}, Time: ${meeting.startTime.substring(0, 5)} - ${meeting.endTime.substring(0, 5)}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking availability settings:', error);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

main();
