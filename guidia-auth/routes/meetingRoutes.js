const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { verifyToken } = require('../middleware/auth');

// Availability routes
router.get('/availability/:userId', verifyToken, meetingController.getUserAvailability);
router.post('/availability', verifyToken, meetingController.createOrUpdateAvailability);
router.delete('/availability/:availabilityId', verifyToken, meetingController.deleteAvailability);

// Meeting routes
router.post('/meetings', verifyToken, meetingController.requestMeeting);
router.get('/meetings', verifyToken, meetingController.getUserMeetings);
router.get('/meetings/:meetingId', verifyToken, meetingController.getMeetingDetails);
router.put('/meetings/:meetingId/accept', verifyToken, meetingController.acceptMeeting);
router.put('/meetings/:meetingId/decline', verifyToken, meetingController.declineMeeting);
router.put('/meetings/:meetingId/cancel', verifyToken, meetingController.cancelMeeting);
router.get('/meetings/available-slots/:userId/:date', verifyToken, meetingController.getAvailableSlots);

// Feedback routes
router.post('/meetings/:meetingId/feedback', verifyToken, meetingController.submitFeedback);
router.get('/meetings/:meetingId/feedback', verifyToken, meetingController.getMeetingFeedback);

// Analytics routes (admin only)
router.get('/analytics/meetings', verifyToken, meetingController.getMeetingAnalytics);
router.get('/analytics/meetings/user/:userId', verifyToken, meetingController.getUserMeetingAnalytics);

module.exports = router;
