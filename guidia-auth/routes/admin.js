const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Get the scheduler instance
const scheduler = require('../utils/scheduler');

/**
 * Run a scheduled task manually (admin only)
 * POST /api/admin/run-task
 * Body: { taskType: 'daily' | 'weekly' | 'deadlineReminders' | 'expiringJobs' | 'incompleteProfiles' | 'jobStats' }
 */
router.post('/run-task', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { taskType } = req.body;

    if (!taskType) {
      return res.status(400).json({ error: 'Task type is required' });
    }

    const validTaskTypes = ['daily', 'weekly', 'deadlineReminders', 'expiringJobs', 'incompleteProfiles', 'jobStats'];

    if (!validTaskTypes.includes(taskType)) {
      return res.status(400).json({
        error: `Invalid task type. Must be one of: ${validTaskTypes.join(', ')}`
      });
    }

    // Run the task
    console.log(`Manually running task: ${taskType}`);

    switch (taskType) {
      case 'daily':
        await scheduler.runDailyTasks();
        break;
      case 'weekly':
        await scheduler.runWeeklyTasks();
        break;
      case 'deadlineReminders':
        await scheduler.scheduledTasks.sendApplicationDeadlineReminders();
        break;
      case 'expiringJobs':
        await scheduler.scheduledTasks.checkExpiringJobs();
        break;
      case 'incompleteProfiles':
        await scheduler.scheduledTasks.checkIncompleteProfiles();
        break;
      case 'jobStats':
        await scheduler.scheduledTasks.sendJobPostingStats();
        break;
    }

    res.json({ success: true, message: `Task ${taskType} executed successfully` });
  } catch (error) {
    console.error(`Error running task: ${error}`);
    res.status(500).json({ error: 'Failed to run task' });
  }
});

/**
 * Get scheduler status
 * GET /api/admin/scheduler-status
 */
router.get('/scheduler-status', verifyToken, verifyAdmin, (req, res) => {
  try {
    const status = {
      isRunning: !!scheduler.jobs && Object.keys(scheduler.jobs).length > 0,
      scheduledJobs: Object.keys(scheduler.jobs || {}).map(key => ({
        name: key,
        nextInvocation: scheduler.jobs[key]?.nextInvocation() || null
      }))
    };

    res.json(status);
  } catch (error) {
    console.error(`Error getting scheduler status: ${error}`);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

module.exports = router;
