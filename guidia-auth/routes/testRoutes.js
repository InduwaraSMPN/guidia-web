const express = require('express');
const router = express.Router();

// Test endpoint to check day of week calculation
router.get('/day-of-week/:date', (req, res) => {
  try {
    const { date } = req.params;
    
    // Parse the date in different ways
    const date1 = new Date(date);
    
    // Parse using components to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const date2 = new Date(year, month - 1, day);
    
    res.json({
      inputDate: date,
      date1: {
        toString: date1.toString(),
        dayOfWeek: date1.getDay(),
        iso: date1.toISOString()
      },
      date2: {
        toString: date2.toString(),
        dayOfWeek: date2.getDay(),
        iso: date2.toISOString()
      },
      currentDate: {
        toString: new Date().toString(),
        dayOfWeek: new Date().getDay()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to check availability for a user on a specific date
router.get('/availability/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;
    const pool = req.app.locals.pool;
    
    // Parse the date to get day of week
    const [year, month, day] = date.split('-').map(Number);
    const requestedDate = new Date(year, month - 1, day);
    const dayOfWeek = requestedDate.getDay();
    
    // Get availability records
    const [availabilityResults] = await pool.query(
      `SELECT * FROM meeting_availability
       WHERE userID = ? AND
       ((isRecurring = 1 AND dayOfWeek = ?) OR
        (isRecurring = 0 AND specificDate = ?))
       ORDER BY startTime`,
      [userId, dayOfWeek, date]
    );
    
    // Get existing meetings
    const [existingMeetings] = await pool.query(
      `SELECT startTime, endTime FROM meetings
       WHERE (requestorID = ? OR recipientID = ?)
       AND meetingDate = ?
       AND status IN ('accepted', 'requested')`,
      [userId, userId, date]
    );
    
    res.json({
      userId,
      date,
      dayOfWeek,
      availabilityCount: availabilityResults.length,
      availabilityRecords: availabilityResults,
      meetingsCount: existingMeetings.length,
      meetings: existingMeetings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
