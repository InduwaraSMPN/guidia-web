require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  console.log('Fixing duplicate availability slots...');
  
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
    
    // Find users with duplicate availability slots
    const [duplicates] = await pool.query(`
      SELECT userID, dayOfWeek, COUNT(*) as count
      FROM meeting_availability
      WHERE isRecurring = 1
      GROUP BY userID, dayOfWeek
      HAVING COUNT(*) > 1
    `);
    
    console.log(`Found ${duplicates.length} duplicate availability slot groups`);
    
    // Begin transaction
    await pool.query('START TRANSACTION');
    
    // For each user with duplicates, keep only one slot per day
    for (const dup of duplicates) {
      console.log(`Fixing duplicates for user ${dup.userID}, day ${dup.dayOfWeek}`);
      
      // Get all duplicate slots for this user and day
      const [slots] = await pool.query(`
        SELECT availabilityID, startTime, endTime
        FROM meeting_availability
        WHERE userID = ? AND dayOfWeek = ? AND isRecurring = 1
        ORDER BY availabilityID
      `, [dup.userID, dup.dayOfWeek]);
      
      console.log(`  Found ${slots.length} slots, keeping the first one (ID: ${slots[0].availabilityID})`);
      
      // Delete all but the first slot
      for (let i = 1; i < slots.length; i++) {
        await pool.query(`
          DELETE FROM meeting_availability
          WHERE availabilityID = ?
        `, [slots[i].availabilityID]);
        
        console.log(`  Deleted slot ID: ${slots[i].availabilityID}`);
      }
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    console.log('Successfully fixed duplicate availability slots');
    
    // Verify the fix
    const [usersAfterFix] = await pool.query(`
      SELECT DISTINCT ma.userID, u.username
      FROM meeting_availability ma
      JOIN users u ON ma.userID = u.userID
      WHERE ma.userID IN (${duplicates.map(d => d.userID).join(',')})
      ORDER BY ma.userID
    `);
    
    console.log('\nVerifying fix for users:');
    
    for (const user of usersAfterFix) {
      console.log(`\nUser ID: ${user.userID}, Username: ${user.username}`);
      
      const [availability] = await pool.query(`
        SELECT * FROM meeting_availability
        WHERE userID = ?
        ORDER BY dayOfWeek, startTime
      `, [user.userID]);
      
      console.log(`Found ${availability.length} availability slots after fix:`);
      
      availability.forEach((slot, index) => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[slot.dayOfWeek];
        
        console.log(`  ${index + 1}. ${slot.isRecurring ? `${dayName} (recurring)` : `Specific date: ${slot.specificDate}`}`);
        console.log(`     Time: ${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`);
      });
    }
    
  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Error fixing availability slots:', error);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed');
  }
}

main();
