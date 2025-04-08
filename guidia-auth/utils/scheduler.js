const ScheduledTasks = require('./scheduledTasks');

/**
 * Scheduler for running tasks at regular intervals
 */
class Scheduler {
  constructor(pool) {
    this.pool = pool;
    this.scheduledTasks = new ScheduledTasks(pool);
    this.dailyTasksInterval = null;
    this.weeklyTasksInterval = null;
  }

  /**
   * Start the scheduler
   */
  start() {
    console.log('Starting scheduler...');
    
    // Run daily tasks immediately on startup
    this.runDailyTasks();
    
    // Then schedule daily tasks to run every 24 hours
    this.dailyTasksInterval = setInterval(() => {
      this.runDailyTasks();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Run weekly tasks every 7 days
    this.weeklyTasksInterval = setInterval(() => {
      this.runWeeklyTasks();
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
    
    console.log('Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop() {
    console.log('Stopping scheduler...');
    
    if (this.dailyTasksInterval) {
      clearInterval(this.dailyTasksInterval);
      this.dailyTasksInterval = null;
    }
    
    if (this.weeklyTasksInterval) {
      clearInterval(this.weeklyTasksInterval);
      this.weeklyTasksInterval = null;
    }
    
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
