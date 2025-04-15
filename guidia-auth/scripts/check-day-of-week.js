require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  console.log('Checking day of week values in availability settings...');
  
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
    
    // Get all availability records
    const [records] = await pool.query(`
      SELECT ma.*, u.username
      FROM meeting_availability ma
      JOIN users u ON ma.userID = u.userID
      WHERE ma.isRecurring = 1
      ORDER BY ma.userID, ma.dayOfWeek
    `);
    
    console.log(`Found ${records.length} recurring availability records`);
    
    // Group by user
    const userGroups = {};
    records.forEach(record => {
      if (!userGroups[record.userID]) {
        userGroups[record.userID] = {
          username: record.username,
          records: []
        };
      }
      userGroups[record.userID].records.push(record);
    });
    
    // Check each user's records
    for (const userId in userGroups) {
      const user = userGroups[userId];
      console.log(`\nUser ID: ${userId}, Username: ${user.username}`);
      console.log('Day of week values:');
      
      // Count occurrences of each day of week
      const dayCounts = {};
      user.records.forEach(record => {
        if (!dayCounts[record.dayOfWeek]) {
          dayCounts[record.dayOfWeek] = 0;
        }
        dayCounts[record.dayOfWeek]++;
      });
      
      // Display day counts
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (let i = 0; i < 7; i++) {
        const count = dayCounts[i] || 0;
        console.log(`  ${dayNames[i]} (${i}): ${count} records`);
      }
      
      // Check for potential issues
      const uniqueDays = Object.keys(dayCounts).length;
      const totalRecords = user.records.length;
      
      if (uniqueDays < 5 && totalRecords >= 5) {
        console.log('  WARNING: User has duplicate day of week values');
      }
      
      if (uniqueDays === 0) {
        console.log('  WARNING: User has no recurring availability');
      }
    }
    
    // Check for specific user if provided
    const specificUserId = process.argv[2];
    if (specificUserId) {
      console.log(`\nDetailed check for user ID ${specificUserId}:`);
      
      const [userRecords] = await pool.query(`
        SELECT * FROM meeting_availability
        WHERE userID = ?
        ORDER BY dayOfWeek, startTime
      `, [specificUserId]);
      
      console.log(`Found ${userRecords.length} availability records:`);
      
      userRecords.forEach((record, index) => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = record.isRecurring ? dayNames[record.dayOfWeek] : 'Specific date';
        
        console.log(`  ${index + 1}. ID: ${record.availabilityID}, Day: ${dayName} (${record.dayOfWeek}), Recurring: ${record.isRecurring}`);
        console.log(`     Time: ${record.startTime.substring(0, 5)} - ${record.endTime.substring(0, 5)}`);
        if (!record.isRecurring && record.specificDate) {
          console.log(`     Date: ${record.specificDate}`);
        }
      });
      
      // Check if we need to fix any issues
      if (process.argv[3] === 'fix') {
        console.log('\nChecking for issues to fix...');
        
        // Check for duplicate day of week values
        const dayCounts = {};
        userRecords.filter(r => r.isRecurring).forEach(record => {
          if (!dayCounts[record.dayOfWeek]) {
            dayCounts[record.dayOfWeek] = [];
          }
          dayCounts[record.dayOfWeek].push(record.availabilityID);
        });
        
        let hasIssues = false;
        for (const day in dayCounts) {
          if (dayCounts[day].length > 1) {
            hasIssues = true;
            console.log(`  Found duplicate records for day ${day}: ${dayCounts[day].join(', ')}`);
          }
        }
        
        if (hasIssues) {
          console.log('\nFixing issues...');
          
          // Begin transaction
          await pool.query('START TRANSACTION');
          
          // For each day with duplicates, keep only the first record
          for (const day in dayCounts) {
            if (dayCounts[day].length > 1) {
              const keepId = dayCounts[day][0];
              const deleteIds = dayCounts[day].slice(1);
              
              console.log(`  Keeping record ${keepId} for day ${day}, deleting ${deleteIds.join(', ')}`);
              
              for (const deleteId of deleteIds) {
                await pool.query('DELETE FROM meeting_availability WHERE availabilityID = ?', [deleteId]);
              }
            }
          }
          
          // Commit transaction
          await pool.query('COMMIT');
          console.log('Issues fixed successfully');
        } else {
          console.log('No issues found that need fixing');
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking day of week values:', error);
    if (pool) {
      await pool.query('ROLLBACK');
    }
  } finally {
    if (pool) {
      await pool.end();
    }
    console.log('\nDatabase connection closed');
  }
}

main();
