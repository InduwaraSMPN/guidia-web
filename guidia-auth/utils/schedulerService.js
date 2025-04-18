const schedule = require('node-schedule');
const ScheduledTasks = require('./scheduledTasks');
const mysql = require('mysql2/promise');
require('dotenv').config();

class SchedulerService {
  constructor() {
    this.jobs = {};
    this.initialized = false;
    this.scheduledTasks = null;
  }

  async initialize() {
    if (this.initialized) {
      console.log('Scheduler already initialized');
      return;
    }

    try {
      // Create database connection pool
      const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Initialize scheduled tasks with the pool
      this.scheduledTasks = new ScheduledTasks(pool);

      // Schedule all tasks
      this.scheduleAllTasks();

      this.initialized = true;
      console.log('Scheduler service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize scheduler service:', error);
      throw error;
    }
  }

  scheduleAllTasks() {
    // Schedule daily tasks to run at midnight (00:00)
    this.jobs.daily = schedule.scheduleJob('0 0 * * *', async () => {
      console.log(`Running daily scheduled tasks at ${new Date().toISOString()}`);
      try {
        await this.scheduledTasks.runAllDailyTasks();
        console.log(`Completed daily scheduled tasks at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Error running daily tasks:', error);
      }
    });

    // Schedule weekly tasks to run at midnight on Sunday (00:00)
    this.jobs.weekly = schedule.scheduleJob('0 0 * * 0', async () => {
      console.log(`Running weekly scheduled tasks at ${new Date().toISOString()}`);
      try {
        await this.scheduledTasks.runAllWeeklyTasks();
        console.log(`Completed weekly scheduled tasks at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Error running weekly tasks:', error);
      }
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

    // Schedule pending registrations check to run every 2 hours
    this.jobs.pendingRegistrationsCheck = schedule.scheduleJob('0 */2 * * *', async () => {
      console.log(`Running pending registrations check at ${new Date().toISOString()}`);
      try {
        await this.scheduledTasks.checkPendingRegistrations();
        console.log(`Completed pending registrations check at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Error running pending registrations check:', error);
      }
    });

    console.log('All scheduled tasks have been set up');
  }

  // Method to manually trigger tasks (useful for testing)
  async runTask(taskType) {
    if (!this.initialized || !this.scheduledTasks) {
      throw new Error('Scheduler not initialized');
    }

    switch (taskType) {
      case 'daily':
        await this.scheduledTasks.runAllDailyTasks();
        break;
      case 'weekly':
        await this.scheduledTasks.runAllWeeklyTasks();
        break;
      case 'deadlineReminders':
        await this.scheduledTasks.sendApplicationDeadlineReminders();
        break;
      case 'expiringJobs':
        await this.scheduledTasks.checkExpiringJobs();
        break;
      case 'incompleteProfiles':
        await this.scheduledTasks.checkIncompleteProfiles();
        break;
      case 'jobStats':
        await this.scheduledTasks.sendJobPostingStats();
        break;
      case 'pendingRegistrations':
        await this.scheduledTasks.checkPendingRegistrations();
        break;
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  // Gracefully shut down all scheduled jobs
  shutdown() {
    console.log('Shutting down scheduler service');
    Object.values(this.jobs).forEach(job => {
      if (job) {
        job.cancel();
      }
    });
    this.jobs = {};
    this.initialized = false;
    console.log('All scheduled jobs have been cancelled');
  }
}

// Create a singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;
