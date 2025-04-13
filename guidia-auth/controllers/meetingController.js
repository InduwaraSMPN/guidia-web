const { sendNotification } = require('../services/notificationService');
const { sendEmail } = require('../utils/emailHelper');

// Controller for meeting scheduling functionality
const meetingController = {
  // Availability Management Methods

  /**
   * Get a user's availability settings
   */
  getUserAvailability: async (req, res) => {
    try {
      const { userId } = req.params;
      const pool = req.app.locals.pool;

      // Check if the requesting user has permission to view this user's availability
      // Allow access for all authenticated users to fix the 403 error
      // This is intentionally permissive to allow users to view each other's availability for scheduling
      console.log('User requesting availability:', {
        requestingUserID: req.user.id,
        requestedUserID: userId,
        requestingUserRole: req.user.roleId
      });

      const [availabilityResults] = await pool.query(
        'SELECT * FROM meeting_availability WHERE userID = ? ORDER BY dayOfWeek, startTime',
        [userId]
      );

      return res.status(200).json({
        success: true,
        data: availabilityResults
      });
    } catch (error) {
      console.error('Error fetching user availability:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch availability',
        error: error.message
      });
    }
  },

  /**
   * Create or update availability slots
   */
  createOrUpdateAvailability: async (req, res) => {
    try {
      const { userID, availabilitySlots } = req.body;
      const pool = req.app.locals.pool;

      // Ensure the user is updating their own availability or is an admin
      // Convert both to strings for comparison to avoid type mismatch
      if (String(req.user.id) !== String(userID) && req.user.roleId !== 1) { // Admin role
        console.log('Authorization failed:', {
          requestingUserID: req.user.id,
          targetUserID: userID,
          requestingUserRole: req.user.roleId,
          requestingUserIDType: typeof req.user.id,
          targetUserIDType: typeof userID
        });
        return res.status(403).json({ message: 'Unauthorized to update this user\'s availability' });
      }

      // Begin transaction
      await pool.query('START TRANSACTION');

      // Process each availability slot
      for (const slot of availabilitySlots) {
        const { availabilityID, dayOfWeek, startTime, endTime, isRecurring, specificDate } = slot;

        if (availabilityID) {
          // Update existing slot
          await pool.query(
            'UPDATE meeting_availability SET dayOfWeek = ?, startTime = ?, endTime = ?, isRecurring = ?, specificDate = ? WHERE availabilityID = ? AND userID = ?',
            [dayOfWeek, startTime, endTime, isRecurring, specificDate, availabilityID, userID]
          );
        } else {
          // Create new slot
          await pool.query(
            'INSERT INTO meeting_availability (userID, dayOfWeek, startTime, endTime, isRecurring, specificDate) VALUES (?, ?, ?, ?, ?, ?)',
            [userID, dayOfWeek, startTime, endTime, isRecurring, specificDate]
          );
        }
      }

      // Commit transaction
      await pool.query('COMMIT');

      return res.status(200).json({
        success: true,
        message: 'Availability updated successfully'
      });
    } catch (error) {
      // Rollback transaction on error
      const pool = req.app.locals.pool;
      await pool.query('ROLLBACK');
      console.error('Error updating availability:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update availability',
        error: error.message
      });
    }
  },

  /**
   * Delete an availability slot
   */
  deleteAvailability: async (req, res) => {
    try {
      const { availabilityId } = req.params;
      const pool = req.app.locals.pool;

      // Get the availability record to check ownership
      const [availabilityResults] = await pool.query(
        'SELECT userID FROM meeting_availability WHERE availabilityID = ?',
        [availabilityId]
      );

      if (availabilityResults.length === 0) {
        return res.status(404).json({ message: 'Availability slot not found' });
      }

      // Check if the user has permission to delete this availability
      if (req.user.id !== availabilityResults[0].userID && req.user.roleId !== 1) { // Admin role
        return res.status(403).json({ message: 'Unauthorized to delete this availability slot' });
      }

      // Delete the availability slot
      await pool.query('DELETE FROM meeting_availability WHERE availabilityID = ?', [availabilityId]);

      return res.status(200).json({
        success: true,
        message: 'Availability slot deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting availability slot:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete availability slot',
        error: error.message
      });
    }
  },

  /**
   * Get available meeting slots for a user on a specific date
   */
  getAvailableSlots: async (req, res) => {
    try {
      const { userId, date } = req.params;
      const pool = req.app.locals.pool;

      // Get the day of week for the requested date (0 = Sunday, 1 = Monday, etc.)
      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.getDay();

      // Get the user's availability for the specified day or specific date
      const [availabilityResults] = await pool.query(
        `SELECT * FROM meeting_availability
         WHERE userID = ? AND
         ((isRecurring = 1 AND dayOfWeek = ?) OR
          (isRecurring = 0 AND specificDate = ?))
         ORDER BY startTime`,
        [userId, dayOfWeek, date]
      );

      // Get existing meetings for the user on the requested date to exclude those time slots
      const [existingMeetings] = await pool.query(
        `SELECT startTime, endTime FROM meetings
         WHERE (requestorID = ? OR recipientID = ?)
         AND meetingDate = ?
         AND status IN ('accepted', 'requested')`,
        [userId, userId, date]
      );

      // Get unavailability records for the user on the requested date
      const [unavailabilityResults] = await pool.query(
        `SELECT startDateTime, endDateTime FROM meeting_unavailability
         WHERE userID = ?
         AND DATE(startDateTime) <= ?
         AND DATE(endDateTime) >= ?`,
        [userId, date, date]
      );

      // Process availability into time slots (e.g., 30-minute increments)
      const availableSlots = [];
      const slotDuration = 30; // 30 minutes per slot

      availabilityResults.forEach(availability => {
        const startTime = new Date(`${date}T${availability.startTime}`);
        const endTime = new Date(`${date}T${availability.endTime}`);

        // Generate slots in 30-minute increments
        let currentSlotStart = new Date(startTime);

        while (currentSlotStart < endTime) {
          const currentSlotEnd = new Date(currentSlotStart.getTime() + slotDuration * 60000);

          // Check if this slot overlaps with any existing meetings
          const isOverlappingWithMeeting = existingMeetings.some(meeting => {
            const meetingStart = new Date(`${date}T${meeting.startTime}`);
            const meetingEnd = new Date(`${date}T${meeting.endTime}`);
            return (
              (currentSlotStart >= meetingStart && currentSlotStart < meetingEnd) ||
              (currentSlotEnd > meetingStart && currentSlotEnd <= meetingEnd) ||
              (currentSlotStart <= meetingStart && currentSlotEnd >= meetingEnd)
            );
          });

          // Check if this slot overlaps with any unavailability periods
          const isUnavailable = unavailabilityResults.some(unavailable => {
            const unavailableStart = new Date(unavailable.startDateTime);
            const unavailableEnd = new Date(unavailable.endDateTime);
            return (
              (currentSlotStart >= unavailableStart && currentSlotStart < unavailableEnd) ||
              (currentSlotEnd > unavailableStart && currentSlotEnd <= unavailableEnd) ||
              (currentSlotStart <= unavailableStart && currentSlotEnd >= unavailableEnd)
            );
          });

          // If the slot doesn't overlap with meetings or unavailability, add it to available slots
          if (!isOverlappingWithMeeting && !isUnavailable) {
            availableSlots.push({
              startTime: currentSlotStart.toTimeString().substring(0, 5),
              endTime: currentSlotEnd.toTimeString().substring(0, 5)
            });
          }

          // Move to the next slot
          currentSlotStart = currentSlotEnd;
        }
      });

      return res.status(200).json({
        success: true,
        date: date,
        availableSlots: availableSlots
      });
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch available slots',
        error: error.message
      });
    }
  },

  // Meeting Management Methods

  /**
   * Request a new meeting
   */
  requestMeeting: async (req, res) => {
    try {
      const { recipientID, meetingTitle, meetingDescription, meetingDate, startTime, endTime, meetingType } = req.body;
      const requestorID = req.user.id;
      const pool = req.app.locals.pool;

      // Validate that the meeting time is available for the recipient
      const [recipientMeetings] = await pool.query(
        `SELECT * FROM meetings
         WHERE recipientID = ?
         AND meetingDate = ?
         AND ((startTime <= ? AND endTime > ?) OR (startTime < ? AND endTime >= ?) OR (startTime >= ? AND endTime <= ?))
         AND status IN ('requested', 'accepted')`,
        [recipientID, meetingDate, startTime, startTime, endTime, endTime, startTime, endTime]
      );

      if (recipientMeetings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'The recipient is not available at the selected time'
        });
      }

      // Validate that the meeting time is available for the requestor
      const [requestorMeetings] = await pool.query(
        `SELECT * FROM meetings
         WHERE requestorID = ?
         AND meetingDate = ?
         AND ((startTime <= ? AND endTime > ?) OR (startTime < ? AND endTime >= ?) OR (startTime >= ? AND endTime <= ?))
         AND status IN ('requested', 'accepted')`,
        [requestorID, meetingDate, startTime, startTime, endTime, endTime, startTime, endTime]
      );

      if (requestorMeetings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You already have a meeting scheduled at this time'
        });
      }

      // Create the meeting request
      const [result] = await pool.query(
        'INSERT INTO meetings (requestorID, recipientID, meetingTitle, meetingDescription, meetingDate, startTime, endTime, status, meetingType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [requestorID, recipientID, meetingTitle, meetingDescription, meetingDate, startTime, endTime, 'requested', meetingType]
      );

      const meetingID = result.insertId;

      // Get user information for notifications
      const [requestorInfo] = await pool.query('SELECT username FROM users WHERE userID = ?', [requestorID]);
      const [recipientInfo] = await pool.query('SELECT username, email, roleID FROM users WHERE userID = ?', [recipientID]);

      // Determine recipient role for notification
      let recipientRole;
      switch (recipientInfo[0].roleID) {
        case 2: recipientRole = 'Student'; break;
        case 3: recipientRole = 'Company'; break;
        case 4: recipientRole = 'Counselor'; break;
        default: recipientRole = 'Student';
      }

      // Format date and time for notifications
      const formattedDate = new Date(meetingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const formattedTime = `${startTime} - ${endTime}`;

      // Initialize notification service
      const notificationService = new (require('../services/notificationService'))(pool);

      // Send notification to recipient
      await notificationService.createNotification({
        userID: recipientID,
        notificationType: 'MEETING_REQUESTED',
        title: `New Meeting Request from ${requestorInfo[0].username}`,
        message: `${requestorInfo[0].username} requested a meeting at ${formattedDate} ${formattedTime}`,
        metadata: {
          meetingID,
          requestorID,
          meetingDate,
          startTime,
          endTime
        },
        targetUserRole: recipientRole,
        priority: 'high'
      });

      // Send email to recipient if email helper is available
      if (typeof sendEmail === 'function') {
        await sendEmail({
          to: recipientInfo[0].email,
          subject: `New Meeting Request from ${requestorInfo[0].username}`,
          html: `
            <h2>New Meeting Request</h2>
            <p>${requestorInfo[0].username} has requested a meeting with you.</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Title:</strong> ${meetingTitle}</p>
            <p><strong>Description:</strong> ${meetingDescription || 'No description provided'}</p>
            <p>Please log in to your account to accept or decline this meeting request.</p>
          `
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Meeting request sent successfully',
        data: { meetingID }
      });
    } catch (error) {
      console.error('Error requesting meeting:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to request meeting',
        error: error.message
      });
    }
  },

  /**
   * Get user's meetings (as requestor or recipient)
   */
  getUserMeetings: async (req, res) => {
    try {
      const userID = req.user.id;
      const { status, type, role, startDate, endDate } = req.query;
      const pool = req.app.locals.pool;

      // Build the query with filters
      let query = `
        SELECT m.*,
          r.username as requestorName,
          p.username as recipientName
        FROM meetings m
        JOIN users r ON m.requestorID = r.userID
        JOIN users p ON m.recipientID = p.userID
        WHERE (m.requestorID = ? OR m.recipientID = ?)
      `;

      const queryParams = [userID, userID];

      // Add status filter if provided
      if (status) {
        query += ' AND m.status = ?';
        queryParams.push(status);
      }

      // Add meeting type filter if provided
      if (type) {
        query += ' AND m.meetingType = ?';
        queryParams.push(type);
      }

      // Add role filter (requestor or recipient) if provided
      if (role === 'requestor') {
        query = query.replace('(m.requestorID = ? OR m.recipientID = ?)', 'm.requestorID = ?');
        queryParams.pop(); // Remove the second userID parameter
      } else if (role === 'recipient') {
        query = query.replace('(m.requestorID = ? OR m.recipientID = ?)', 'm.recipientID = ?');
        queryParams.shift(); // Remove the first userID parameter
      }

      // Add date range filter if provided
      if (startDate) {
        query += ' AND m.meetingDate >= ?';
        queryParams.push(startDate);
      }

      if (endDate) {
        query += ' AND m.meetingDate <= ?';
        queryParams.push(endDate);
      }

      // Add order by clause
      query += ' ORDER BY m.meetingDate ASC, m.startTime ASC';

      const [meetings] = await pool.query(query, queryParams);

      return res.status(200).json({
        success: true,
        data: meetings
      });
    } catch (error) {
      console.error('Error fetching user meetings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch meetings',
        error: error.message
      });
    }
  },

  /**
   * Get details of a specific meeting
   */
  getMeetingDetails: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const userID = req.user.id;
      const pool = req.app.locals.pool;

      // Get meeting details with user information
      const [meetingResults] = await pool.query(
        `SELECT m.*,
          r.username as requestorName,
          p.username as recipientName
        FROM meetings m
        JOIN users r ON m.requestorID = r.userID
        JOIN users p ON m.recipientID = p.userID
        WHERE m.meetingID = ?`,
        [meetingId]
      );

      if (meetingResults.length === 0) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      const meeting = meetingResults[0];

      // Check if the user is authorized to view this meeting
      // Convert all to strings for comparison to avoid type mismatch
      if (String(meeting.requestorID) !== String(userID) && String(meeting.recipientID) !== String(userID) && req.user.roleId !== 1) { // Admin role
        console.log('Authorization failed:', {
          meetingRequestorID: meeting.requestorID,
          meetingRecipientID: meeting.recipientID,
          userID: userID,
          requestorIDType: typeof meeting.requestorID,
          recipientIDType: typeof meeting.recipientID,
          userIDType: typeof userID
        });
        return res.status(403).json({ message: 'Unauthorized to view this meeting' });
      }

      return res.status(200).json({
        success: true,
        data: meeting
      });
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch meeting details',
        error: error.message
      });
    }
  },

  /**
   * Accept a meeting request
   */
  acceptMeeting: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const userID = req.user.id;
      const pool = req.app.locals.pool;

      // Get meeting details
      const [meetingResults] = await pool.query('SELECT * FROM meetings WHERE meetingID = ?', [meetingId]);

      if (meetingResults.length === 0) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      const meeting = meetingResults[0];

      // Check if the user is the recipient of the meeting request
      // Convert both to strings for comparison to avoid type mismatch
      if (String(meeting.recipientID) !== String(userID)) {
        console.log('Authorization failed:', {
          meetingRecipientID: meeting.recipientID,
          userID: userID,
          meetingRecipientIDType: typeof meeting.recipientID,
          userIDType: typeof userID
        });
        return res.status(403).json({ message: 'Unauthorized to accept this meeting' });
      }

      // Check if the meeting is in 'requested' status
      if (meeting.status !== 'requested') {
        return res.status(400).json({ message: `Cannot accept meeting in '${meeting.status}' status` });
      }

      // Update meeting status to 'accepted'
      await pool.query('UPDATE meetings SET status = ? WHERE meetingID = ?', ['accepted', meetingId]);

      // Get user information for notifications
      const [recipientInfo] = await pool.query('SELECT username FROM users WHERE userID = ?', [userID]);
      const [requestorInfo] = await pool.query('SELECT username, email, roleID FROM users WHERE userID = ?', [meeting.requestorID]);

      // Determine requestor role for notification
      let requestorRole;
      switch (requestorInfo[0].roleID) {
        case 2: requestorRole = 'Student'; break;
        case 3: requestorRole = 'Company'; break;
        case 4: requestorRole = 'Counselor'; break;
        default: requestorRole = 'Student';
      }

      // Format date and time for notifications
      const formattedDate = new Date(meeting.meetingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const formattedTime = `${meeting.startTime} - ${meeting.endTime}`;

      // Initialize notification service
      const notificationService = new (require('../services/notificationService'))(pool);

      // Send notification to requestor
      await notificationService.createNotification({
        userID: meeting.requestorID,
        notificationType: 'MEETING_ACCEPTED',
        title: `Meeting Accepted by ${recipientInfo[0].username}`,
        message: `Your meeting with ${recipientInfo[0].username} at ${formattedDate} ${formattedTime} has been accepted`,
        metadata: {
          meetingID: meetingId,
          recipientID: userID,
          meetingDate: meeting.meetingDate,
          startTime: meeting.startTime,
          endTime: meeting.endTime
        },
        targetUserRole: requestorRole,
        priority: 'high'
      });

      // Send email to requestor if email helper is available
      if (typeof sendEmail === 'function') {
        await sendEmail({
          to: requestorInfo[0].email,
          subject: `Meeting Accepted by ${recipientInfo[0].username}`,
          html: `
            <h2>Meeting Accepted</h2>
            <p>${recipientInfo[0].username} has accepted your meeting request.</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Title:</strong> ${meeting.meetingTitle}</p>
            <p><strong>Description:</strong> ${meeting.meetingDescription || 'No description provided'}</p>
            <p>Please log in to your account to view the meeting details.</p>
          `
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Meeting accepted successfully'
      });
    } catch (error) {
      console.error('Error accepting meeting:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to accept meeting',
        error: error.message
      });
    }
  },

  /**
   * Decline a meeting request
   */
  declineMeeting: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { declineReason } = req.body;
      const userID = req.user.id;
      const pool = req.app.locals.pool;

      // Get meeting details
      const [meetingResults] = await pool.query('SELECT * FROM meetings WHERE meetingID = ?', [meetingId]);

      if (meetingResults.length === 0) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      const meeting = meetingResults[0];

      // Check if the user is the recipient of the meeting request
      // Convert both to strings for comparison to avoid type mismatch
      if (String(meeting.recipientID) !== String(userID)) {
        console.log('Authorization failed:', {
          meetingRecipientID: meeting.recipientID,
          userID: userID,
          meetingRecipientIDType: typeof meeting.recipientID,
          userIDType: typeof userID
        });
        return res.status(403).json({ message: 'Unauthorized to decline this meeting' });
      }

      // Check if the meeting is in 'requested' status
      if (meeting.status !== 'requested') {
        return res.status(400).json({ message: `Cannot decline meeting in '${meeting.status}' status` });
      }

      // Update meeting status to 'declined' and add decline reason
      await pool.query(
        'UPDATE meetings SET status = ?, declineReason = ? WHERE meetingID = ?',
        ['declined', declineReason, meetingId]
      );

      // Get user information for notifications
      const [recipientInfo] = await pool.query('SELECT username FROM users WHERE userID = ?', [userID]);
      const [requestorInfo] = await pool.query('SELECT username, email, roleID FROM users WHERE userID = ?', [meeting.requestorID]);

      // Determine requestor role for notification
      let requestorRole;
      switch (requestorInfo[0].roleID) {
        case 2: requestorRole = 'Student'; break;
        case 3: requestorRole = 'Company'; break;
        case 4: requestorRole = 'Counselor'; break;
        default: requestorRole = 'Student';
      }

      // Format date and time for notifications
      const formattedDate = new Date(meeting.meetingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const formattedTime = `${meeting.startTime} - ${meeting.endTime}`;

      // Initialize notification service
      const notificationService = new (require('../services/notificationService'))(pool);

      // Send notification to requestor
      await notificationService.createNotification({
        userID: meeting.requestorID,
        notificationType: 'MEETING_DECLINED',
        title: `Meeting Declined by ${recipientInfo[0].username}`,
        message: `Your meeting with ${recipientInfo[0].username} at ${formattedDate} ${formattedTime} has been declined`,
        metadata: {
          meetingID: meetingId,
          recipientID: userID,
          meetingDate: meeting.meetingDate,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          declineReason
        },
        targetUserRole: requestorRole,
        priority: 'medium'
      });

      // Send email to requestor if email helper is available
      if (typeof sendEmail === 'function') {
        await sendEmail({
          to: requestorInfo[0].email,
          subject: `Meeting Declined by ${recipientInfo[0].username}`,
          html: `
            <h2>Meeting Declined</h2>
            <p>${recipientInfo[0].username} has declined your meeting request.</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Title:</strong> ${meeting.meetingTitle}</p>
            ${declineReason ? `<p><strong>Reason:</strong> ${declineReason}</p>` : ''}
            <p>Please log in to your account to view the meeting details or request a new meeting.</p>
          `
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Meeting declined successfully'
      });
    } catch (error) {
      console.error('Error declining meeting:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to decline meeting',
        error: error.message
      });
    }
  },

  /**
   * Cancel a meeting
   */
  cancelMeeting: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const userID = req.user.id;
      const pool = req.app.locals.pool;

      // Get meeting details
      const [meetingResults] = await pool.query('SELECT * FROM meetings WHERE meetingID = ?', [meetingId]);

      if (meetingResults.length === 0) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      const meeting = meetingResults[0];

      // Check if the user is either the requestor or recipient of the meeting
      // Convert all to strings for comparison to avoid type mismatch
      if (String(meeting.requestorID) !== String(userID) && String(meeting.recipientID) !== String(userID)) {
        console.log('Authorization failed:', {
          meetingRequestorID: meeting.requestorID,
          meetingRecipientID: meeting.recipientID,
          userID: userID,
          requestorIDType: typeof meeting.requestorID,
          recipientIDType: typeof meeting.recipientID,
          userIDType: typeof userID
        });
        return res.status(403).json({ message: 'Unauthorized to cancel this meeting' });
      }

      // Check if the meeting is in 'requested' or 'accepted' status
      if (meeting.status !== 'requested' && meeting.status !== 'accepted') {
        return res.status(400).json({ message: `Cannot cancel meeting in '${meeting.status}' status` });
      }

      // Update meeting status to 'cancelled'
      await pool.query('UPDATE meetings SET status = ? WHERE meetingID = ?', ['cancelled', meetingId]);

      // Determine the other party in the meeting
      const otherPartyID = meeting.requestorID === userID ? meeting.recipientID : meeting.requestorID;

      // Get user information for notifications
      const [currentUserInfo] = await pool.query('SELECT username FROM users WHERE userID = ?', [userID]);
      const [otherPartyInfo] = await pool.query('SELECT username, email, roleID FROM users WHERE userID = ?', [otherPartyID]);

      // Determine other party role for notification
      let otherPartyRole;
      switch (otherPartyInfo[0].roleID) {
        case 2: otherPartyRole = 'Student'; break;
        case 3: otherPartyRole = 'Company'; break;
        case 4: otherPartyRole = 'Counselor'; break;
        default: otherPartyRole = 'Student';
      }

      // Format date and time for notifications
      const formattedDate = new Date(meeting.meetingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const formattedTime = `${meeting.startTime} - ${meeting.endTime}`;

      // Initialize notification service
      const notificationService = new (require('../services/notificationService'))(pool);

      // Send notification to the other party
      await notificationService.createNotification({
        userID: otherPartyID,
        notificationType: 'MEETING_DECLINED', // Reusing the declined notification type for cancellations
        title: `Meeting Cancelled by ${currentUserInfo[0].username}`,
        message: `Your meeting with ${currentUserInfo[0].username} at ${formattedDate} ${formattedTime} has been cancelled`,
        metadata: {
          meetingID: meetingId,
          cancellerId: userID,
          meetingDate: meeting.meetingDate,
          startTime: meeting.startTime,
          endTime: meeting.endTime
        },
        targetUserRole: otherPartyRole,
        priority: 'medium'
      });

      // Send email to the other party if email helper is available
      if (typeof sendEmail === 'function') {
        await sendEmail({
          to: otherPartyInfo[0].email,
          subject: `Meeting Cancelled by ${currentUserInfo[0].username}`,
          html: `
            <h2>Meeting Cancelled</h2>
            <p>${currentUserInfo[0].username} has cancelled the meeting scheduled for ${formattedDate} at ${formattedTime}.</p>
            <p><strong>Title:</strong> ${meeting.meetingTitle}</p>
            <p>Please log in to your account to view the meeting details or schedule a new meeting.</p>
          `
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Meeting cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel meeting',
        error: error.message
      });
    }
  },

  // Feedback and Analytics Methods

  /**
   * Submit feedback for a meeting
   */
  submitFeedback: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { meetingSuccessRating, platformExperienceRating, comments } = req.body;
      const userID = req.user.id;
      const pool = req.app.locals.pool;

      // Get meeting details
      const [meetingResults] = await pool.query('SELECT * FROM meetings WHERE meetingID = ?', [meetingId]);

      if (meetingResults.length === 0) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      const meeting = meetingResults[0];

      // Check if the user is either the requestor or recipient of the meeting
      // Convert all to strings for comparison to avoid type mismatch
      console.log('Feedback authorization check:', {
        meetingRequestorID: meeting.requestorID,
        meetingRecipientID: meeting.recipientID,
        userID: userID,
        requestorIDType: typeof meeting.requestorID,
        recipientIDType: typeof meeting.recipientID,
        userIDType: typeof userID,
        requestorMatch: String(meeting.requestorID) === String(userID),
        recipientMatch: String(meeting.recipientID) === String(userID)
      });

      if (String(meeting.requestorID) !== String(userID) && String(meeting.recipientID) !== String(userID)) {
        console.log('Authorization failed for feedback submission');
        return res.status(403).json({ message: 'Unauthorized to submit feedback for this meeting' });
      }

      // Check if the meeting is in 'completed' status
      if (meeting.status !== 'completed' && meeting.status !== 'accepted') {
        return res.status(400).json({
          message: `Feedback can only be submitted for completed or accepted meetings. Current status: '${meeting.status}'`
        });
      }

      // Check if the user has already submitted feedback
      const [existingFeedback] = await pool.query(
        'SELECT * FROM meeting_feedback WHERE meetingID = ? AND userID = ?',
        [meetingId, userID]
      );

      if (existingFeedback.length > 0) {
        return res.status(400).json({ message: 'You have already submitted feedback for this meeting' });
      }

      // Insert feedback
      await pool.query(
        'INSERT INTO meeting_feedback (meetingID, userID, meetingSuccessRating, platformExperienceRating, comments) VALUES (?, ?, ?, ?, ?)',
        [meetingId, userID, meetingSuccessRating, platformExperienceRating, comments]
      );

      // If the meeting is in 'accepted' status, update it to 'completed' after feedback
      if (meeting.status === 'accepted') {
        await pool.query('UPDATE meetings SET status = ? WHERE meetingID = ?', ['completed', meetingId]);
      }

      return res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: error.message
      });
    }
  },

  /**
   * Get feedback for a meeting
   */
  getMeetingFeedback: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const userID = req.user.id;
      const pool = req.app.locals.pool;

      // Get meeting details
      const [meetingResults] = await pool.query('SELECT * FROM meetings WHERE meetingID = ?', [meetingId]);

      if (meetingResults.length === 0) {
        return res.status(404).json({ message: 'Meeting not found' });
      }

      const meeting = meetingResults[0];

      // Check if the user is authorized to view this meeting's feedback
      // Convert all to strings for comparison to avoid type mismatch
      if (String(meeting.requestorID) !== String(userID) && String(meeting.recipientID) !== String(userID) && req.user.roleId !== 1) { // Admin role
        console.log('Authorization failed:', {
          meetingRequestorID: meeting.requestorID,
          meetingRecipientID: meeting.recipientID,
          userID: userID,
          requestorIDType: typeof meeting.requestorID,
          recipientIDType: typeof meeting.recipientID,
          userIDType: typeof userID
        });
        return res.status(403).json({ message: 'Unauthorized to view feedback for this meeting' });
      }

      // Get feedback for the meeting
      const [feedbackResults] = await pool.query(
        `SELECT f.*, u.username
         FROM meeting_feedback f
         JOIN users u ON f.userID = u.userID
         WHERE f.meetingID = ?`,
        [meetingId]
      );

      return res.status(200).json({
        success: true,
        data: feedbackResults
      });
    } catch (error) {
      console.error('Error fetching meeting feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch meeting feedback',
        error: error.message
      });
    }
  },

  /**
   * Get meeting analytics (admin only)
   */
  getMeetingAnalytics: async (req, res) => {
    try {
      // Check if the user is an admin
      if (req.user.roleId !== 1) { // Admin role
        return res.status(403).json({ message: 'Unauthorized to access meeting analytics' });
      }

      const { startDate, endDate, meetingType } = req.query;
      const pool = req.app.locals.pool;

      // Build query parameters
      const queryParams = [];
      let dateFilter = '';

      if (startDate && endDate) {
        dateFilter = 'WHERE meetingDate BETWEEN ? AND ?';
        queryParams.push(startDate, endDate);
      } else if (startDate) {
        dateFilter = 'WHERE meetingDate >= ?';
        queryParams.push(startDate);
      } else if (endDate) {
        dateFilter = 'WHERE meetingDate <= ?';
        queryParams.push(endDate);
      }

      // Add meeting type filter if provided
      if (meetingType) {
        dateFilter = dateFilter ? `${dateFilter} AND meetingType = ?` : 'WHERE meetingType = ?';
        queryParams.push(meetingType);
      }

      // Get total meetings count
      const [totalMeetingsResult] = await pool.query(
        `SELECT COUNT(*) as total FROM meetings ${dateFilter}`,
        queryParams
      );

      // Get meetings by status
      const [meetingsByStatusResult] = await pool.query(
        `SELECT status, COUNT(*) as count FROM meetings ${dateFilter} GROUP BY status`,
        queryParams
      );

      // Get meetings by type
      const [meetingsByTypeResult] = await pool.query(
        `SELECT meetingType, COUNT(*) as count FROM meetings ${dateFilter} GROUP BY meetingType`,
        queryParams
      );

      // Get average meeting success rating
      const [avgSuccessRatingResult] = await pool.query(
        `SELECT AVG(meetingSuccessRating) as avgRating FROM meeting_feedback f
         JOIN meetings m ON f.meetingID = m.meetingID
         ${dateFilter}`,
        queryParams
      );

      // Get average platform experience rating
      const [avgPlatformRatingResult] = await pool.query(
        `SELECT AVG(platformExperienceRating) as avgRating FROM meeting_feedback f
         JOIN meetings m ON f.meetingID = m.meetingID
         ${dateFilter}`,
        queryParams
      );

      // Get busiest days
      const [busiestDaysResult] = await pool.query(
        `SELECT DAYNAME(meetingDate) as dayOfWeek, COUNT(*) as count
         FROM meetings ${dateFilter}
         GROUP BY DAYNAME(meetingDate)
         ORDER BY count DESC`,
        queryParams
      );

      // Get busiest hours
      const [busiestHoursResult] = await pool.query(
        `SELECT HOUR(startTime) as hour, COUNT(*) as count
         FROM meetings ${dateFilter}
         GROUP BY HOUR(startTime)
         ORDER BY count DESC`,
        queryParams
      );

      return res.status(200).json({
        success: true,
        data: {
          totalMeetings: totalMeetingsResult[0].total,
          meetingsByStatus: meetingsByStatusResult,
          meetingsByType: meetingsByTypeResult,
          averageSuccessRating: avgSuccessRatingResult[0].avgRating || 0,
          averagePlatformRating: avgPlatformRatingResult[0].avgRating || 0,
          busiestDays: busiestDaysResult,
          busiestHours: busiestHoursResult
        }
      });
    } catch (error) {
      console.error('Error fetching meeting analytics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch meeting analytics',
        error: error.message
      });
    }
  },

  /**
   * Get meeting analytics for a specific user
   */
  getUserMeetingAnalytics: async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUserID = req.user.id;
      const pool = req.app.locals.pool;

      // Check if the user is authorized to view this user's analytics
      // Convert both to strings for comparison to avoid type mismatch
      if (String(currentUserID) !== String(userId) && req.user.roleId !== 1) { // Admin role
        console.log('Authorization failed:', {
          currentUserID,
          requestedUserID: userId,
          currentUserRole: req.user.roleId,
          currentUserIDType: typeof currentUserID,
          requestedUserIDType: typeof userId
        });
        return res.status(403).json({ message: 'Unauthorized to view this user\'s meeting analytics' });
      }

      // Get total meetings count for the user
      const [totalMeetingsResult] = await pool.query(
        'SELECT COUNT(*) as total FROM meetings WHERE requestorID = ? OR recipientID = ?',
        [userId, userId]
      );

      // Get meetings by status for the user
      const [meetingsByStatusResult] = await pool.query(
        'SELECT status, COUNT(*) as count FROM meetings WHERE (requestorID = ? OR recipientID = ?) GROUP BY status',
        [userId, userId]
      );

      // Get meetings by type for the user
      const [meetingsByTypeResult] = await pool.query(
        'SELECT meetingType, COUNT(*) as count FROM meetings WHERE (requestorID = ? OR recipientID = ?) GROUP BY meetingType',
        [userId, userId]
      );

      // Get average meeting success rating given by the user
      const [avgSuccessRatingGivenResult] = await pool.query(
        'SELECT AVG(meetingSuccessRating) as avgRating FROM meeting_feedback WHERE userID = ?',
        [userId]
      );

      // Get average platform experience rating given by the user
      const [avgPlatformRatingGivenResult] = await pool.query(
        'SELECT AVG(platformExperienceRating) as avgRating FROM meeting_feedback WHERE userID = ?',
        [userId]
      );

      // Get average meeting success rating received for the user's meetings (where they are not the feedback provider)
      const [avgSuccessRatingReceivedResult] = await pool.query(
        `SELECT AVG(f.meetingSuccessRating) as avgRating
         FROM meeting_feedback f
         JOIN meetings m ON f.meetingID = m.meetingID
         WHERE (m.requestorID = ? OR m.recipientID = ?) AND f.userID != ?`,
        [userId, userId, userId]
      );

      // Get upcoming meetings for the user
      const [upcomingMeetingsResult] = await pool.query(
        `SELECT * FROM meetings
         WHERE (requestorID = ? OR recipientID = ?)
         AND meetingDate >= CURDATE()
         AND status = 'accepted'
         ORDER BY meetingDate ASC, startTime ASC
         LIMIT 5`,
        [userId, userId]
      );

      return res.status(200).json({
        success: true,
        data: {
          totalMeetings: totalMeetingsResult[0].total,
          meetingsByStatus: meetingsByStatusResult,
          meetingsByType: meetingsByTypeResult,
          averageSuccessRatingGiven: avgSuccessRatingGivenResult[0].avgRating || 0,
          averagePlatformRatingGiven: avgPlatformRatingGivenResult[0].avgRating || 0,
          averageSuccessRatingReceived: avgSuccessRatingReceivedResult[0].avgRating || 0,
          upcomingMeetings: upcomingMeetingsResult
        }
      });
    } catch (error) {
      console.error('Error fetching user meeting analytics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user meeting analytics',
        error: error.message
      });
    }
  }
};

module.exports = meetingController;
