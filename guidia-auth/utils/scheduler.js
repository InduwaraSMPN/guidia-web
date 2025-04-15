const schedule = require('node-schedule');
const ScheduledTasks = require('./scheduledTasks');

/**
 * Scheduler for running tasks at regular intervals using node-schedule
 * This provides more reliable scheduling than setInterval
 */
class Scheduler {
  constructor(pool) {
    this.pool = pool;
    this.scheduledTasks = new ScheduledTasks(pool);
    this.jobs = {};
  }

  /**
   * Start the scheduler
   */
  start() {
    console.log('Starting scheduler with node-schedule...');

    // Run daily tasks immediately on startup
    this.runDailyTasks();

    // Schedule daily tasks to run at midnight (00:00)
    this.jobs.daily = schedule.scheduleJob('0 0 * * *', () => {
      this.runDailyTasks();
    });

    // Schedule weekly tasks to run at midnight on Sunday (00:00)
    this.jobs.weekly = schedule.scheduleJob('0 0 * * 0', () => {
      this.runWeeklyTasks();
    });

    // Schedule job application deadline check to run every 6 hours
    this.jobs.deadlineCheck = schedule.scheduleJob('0 */6 * * *', async () => {
      console.log(`Running job application deadline check at ${new Date().toISOString()}`);
      try {
        await this.scheduledTasks.sendApplicationDeadlineReminders();
        console.log(`Completed job application deadline check at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Error running deadline check:', error);
      }
    });

    // Schedule job expiration check to run every 12 hours
    this.jobs.expirationCheck = schedule.scheduleJob('0 */12 * * *', async () => {
      console.log(`Running job expiration check at ${new Date().toISOString()}`);
      try {
        await this.scheduledTasks.checkExpiringJobs();
        console.log(`Completed job expiration check at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Error running expiration check:', error);
      }
    });

    // Schedule meeting reminders to run every 4 hours
    this.jobs.meetingReminders = schedule.scheduleJob('0 */4 * * *', async () => {
      console.log(`Running meeting reminders check at ${new Date().toISOString()}`);
      try {
        await this.scheduledTasks.sendMeetingReminders();
        console.log(`Completed meeting reminders check at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Error running meeting reminders:', error);
      }
    });

    // Schedule meeting feedback requests to run daily at noon
    this.jobs.meetingFeedback = schedule.scheduleJob('0 12 * * *', async () => {
      console.log(`Running meeting feedback requests at ${new Date().toISOString()}`);
      try {
        await this.scheduledTasks.sendMeetingFeedbackRequests();
        console.log(`Completed meeting feedback requests at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Error running meeting feedback requests:', error);
      }
    });

    console.log('Scheduler started with the following schedule:');
    console.log('- Daily tasks: Every day at midnight (00:00)');
    console.log('- Weekly tasks: Every Sunday at midnight (00:00)');
    console.log('- Job deadline reminders: Every 6 hours');
    console.log('- Job expiration checks: Every 12 hours');
    console.log('- Meeting reminders: Every 4 hours');
    console.log('- Meeting feedback requests: Every day at noon (12:00)');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    console.log('Stopping scheduler...');

    // Cancel all scheduled jobs
    Object.values(this.jobs).forEach(job => {
      if (job) {
        job.cancel();
      }
    });

    this.jobs = {};
    console.log('Scheduler stopped');
  }

  /**
   * Run daily tasks
   */
  async runDailyTasks() {
    console.log(`Running daily tasks at ${new Date().toISOString()}`);
    try {
      await this.scheduledTasks.runAllDailyTasks();
      console.log(`Completed daily tasks at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Error running daily tasks:', error);
    }
  }

  /**
   * Run weekly tasks
   */
  async runWeeklyTasks() {
    console.log(`Running weekly tasks at ${new Date().toISOString()}`);
    try {
      await this.scheduledTasks.runAllWeeklyTasks();
      console.log(`Completed weekly tasks at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Error running weekly tasks:', error);
    }
  }
}

module.exports = Scheduler;
