const NotificationService = require('../services/notificationService');

/**
 * Utility functions to trigger notifications for various events
 */
class NotificationTriggers {
  constructor(pool) {
    this.notificationService = new NotificationService(pool);
  }

  /**
   * Trigger a notification when a new job is posted
   * @param {Object} job - The job object
   * @param {Object} company - The company that posted the job
   */
  async newJobPosted(job, company) {
    try {
      // Get all students
      const [students] = await this.notificationService.pool.execute(
        'SELECT userID FROM users WHERE roleID = 2'
      );

      // Create a notification for each student
      const promises = students.map(student => 
        this.notificationService.createFromTemplate(
          student.userID,
          'NEW_JOB_POSTING',
          'Student',
          {
            jobTitle: job.title,
            companyName: company.companyName
          },
          {
            relatedJobID: job.jobID,
            relatedUserID: company.userID
          }
        )
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error triggering new job notification:', error);
    }
  }

  /**
   * Trigger a notification when a job application status changes
   * @param {Object} application - The job application
   * @param {string} status - The new status
   * @param {Object} job - The job
   * @param {Object} company - The company
   */
  async jobApplicationStatusChanged(application, status, job, company) {
    try {
      await this.notificationService.createFromTemplate(
        application.studentID,
        'JOB_APPLICATION_UPDATE',
        'Student',
        {
          jobTitle: job.title,
          companyName: company.companyName,
          status: status
        },
        {
          relatedJobID: job.jobID,
          relatedApplicationID: application.applicationID,
          relatedUserID: company.userID
        }
      );
    } catch (error) {
      console.error('Error triggering application status notification:', error);
    }
  }

  /**
   * Trigger a notification when a job application deadline is approaching
   * @param {Object} job - The job
   * @param {Object} company - The company
   * @param {number} daysLeft - Days left until deadline
   */
  async jobApplicationDeadlineReminder(job, company, daysLeft) {
    try {
      // Get all students who have shown interest in this job
      // This could be based on saved jobs, profile matches, etc.
      const [interestedStudents] = await this.notificationService.pool.execute(
        'SELECT DISTINCT userID FROM saved_jobs WHERE jobID = ?',
        [job.jobID]
      );

      // Create a notification for each interested student
      const promises = interestedStudents.map(student => 
        this.notificationService.createFromTemplate(
          student.userID,
          'JOB_APPLICATION_DEADLINE',
          'Student',
          {
            jobTitle: job.title,
            companyName: company.companyName,
            daysLeft: daysLeft.toString()
          },
          {
            relatedJobID: job.jobID,
            relatedUserID: company.userID
          }
        )
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error triggering deadline reminder notification:', error);
    }
  }

  /**
   * Trigger a notification when a profile is viewed
   * @param {number} profileUserID - The user whose profile was viewed
   * @param {string} profileUserRole - The role of the user whose profile was viewed
   * @param {number} viewerUserID - The user who viewed the profile
   * @param {string} viewerUserRole - The role of the user who viewed the profile
   * @param {string} viewerName - The name of the viewer
   */
  async profileViewed(profileUserID, profileUserRole, viewerUserID, viewerUserRole, viewerName) {
    try {
      await this.notificationService.createFromTemplate(
        profileUserID,
        'PROFILE_VIEW',
        profileUserRole,
        {
          viewerRole: viewerUserRole,
          viewerName: viewerName
        },
        {
          relatedUserID: viewerUserID,
          relatedProfileID: profileUserID
        }
      );
    } catch (error) {
      console.error('Error triggering profile view notification:', error);
    }
  }

  /**
   * Trigger a notification when a profile is incomplete
   * @param {number} userID - The user ID
   * @param {string} userRole - The user role
   * @param {number} completionPercentage - The profile completion percentage
   * @param {string} missingFields - Comma-separated list of missing fields
   */
  async profileIncomplete(userID, userRole, completionPercentage, missingFields) {
    try {
      await this.notificationService.createFromTemplate(
        userID,
        'PROFILE_INCOMPLETE',
        userRole,
        {
          completionPercentage: completionPercentage.toString(),
          missingFields: missingFields
        },
        {
          relatedProfileID: userID
        }
      );
    } catch (error) {
      console.error('Error triggering profile incomplete notification:', error);
    }
  }

  /**
   * Trigger a notification when a new job application is received
   * @param {Object} application - The job application
   * @param {Object} student - The student who applied
   * @param {Object} job - The job
   */
  async newJobApplication(application, student, job) {
    try {
      // Notify the company
      await this.notificationService.createFromTemplate(
        job.companyUserID,
        'NEW_JOB_APPLICATION',
        'Company',
        {
          studentName: student.studentName || `${student.firstName} ${student.lastName}`,
          jobTitle: job.title
        },
        {
          relatedJobID: job.jobID,
          relatedApplicationID: application.applicationID,
          relatedUserID: student.userID
        }
      );

      // Notify counselors who are associated with this student
      const [counselors] = await this.notificationService.pool.execute(
        'SELECT c.userID FROM counselor_student_relationships csr JOIN counselors c ON csr.counselorID = c.counselorID WHERE csr.studentID = ?',
        [student.studentID]
      );

      const promises = counselors.map(counselor => 
        this.notificationService.createFromTemplate(
          counselor.userID,
          'STUDENT_JOB_APPLICATION',
          'Counselor',
          {
            studentName: student.studentName || `${student.firstName} ${student.lastName}`,
            jobTitle: job.title,
            companyName: job.companyName
          },
          {
            relatedJobID: job.jobID,
            relatedApplicationID: application.applicationID,
            relatedUserID: student.userID
          }
        )
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error triggering new job application notification:', error);
    }
  }

  /**
   * Trigger a notification when a job posting is about to expire
   * @param {Object} job - The job
   * @param {number} daysLeft - Days left until expiration
   */
  async jobPostingExpiring(job, daysLeft) {
    try {
      await this.notificationService.createFromTemplate(
        job.companyUserID,
        'JOB_POSTING_EXPIRING',
        'Company',
        {
          jobTitle: job.title,
          daysLeft: daysLeft.toString()
        },
        {
          relatedJobID: job.jobID
        }
      );
    } catch (error) {
      console.error('Error triggering job expiring notification:', error);
    }
  }

  /**
   * Trigger a notification for job posting statistics
   * @param {Object} job - The job
   * @param {number} viewCount - Number of views
   * @param {number} applicationCount - Number of applications
   */
  async jobPostingStats(job, viewCount, applicationCount) {
    try {
      await this.notificationService.createFromTemplate(
        job.companyUserID,
        'JOB_POSTING_STATS',
        'Company',
        {
          jobTitle: job.title,
          viewCount: viewCount.toString(),
          applicationCount: applicationCount.toString()
        },
        {
          relatedJobID: job.jobID
        }
      );
    } catch (error) {
      console.error('Error triggering job stats notification:', error);
    }
  }

  /**
   * Trigger a notification for a new user registration
   * @param {Object} user - The new user
   */
  async newUserRegistration(user) {
    try {
      // Get all admins
      const [admins] = await this.notificationService.pool.execute(
        'SELECT userID FROM users WHERE roleID = 1'
      );

      // Create a notification for each admin
      const promises = admins.map(admin => 
        this.notificationService.createFromTemplate(
          admin.userID,
          'NEW_USER_REGISTRATION',
          'Admin',
          {
            userRole: user.userType || getRoleFromId(user.roleID),
            userName: user.username || user.email
          },
          {
            relatedUserID: user.userID
          }
        )
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error triggering new user registration notification:', error);
    }
  }

  /**
   * Trigger a notification for a system announcement
   * @param {string} message - The announcement message
   * @param {string} userRole - The target user role (optional, for role-specific announcements)
   */
  async platformAnnouncement(message, userRole = null) {
    try {
      let query = 'SELECT userID, roleID FROM users WHERE 1=1';
      const params = [];

      if (userRole) {
        const roleMap = { 'Admin': 1, 'Student': 2, 'Counselor': 3, 'Company': 4 };
        const roleID = roleMap[userRole];
        if (roleID) {
          query += ' AND roleID = ?';
          params.push(roleID);
        }
      }

      const [users] = await this.notificationService.pool.execute(query, params);

      // Create a notification for each user
      const promises = users.map(user => {
        const userRoleName = getRoleFromId(user.roleID);
        return this.notificationService.createFromTemplate(
          user.userID,
          'PLATFORM_ANNOUNCEMENT',
          userRoleName,
          { message }
        );
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error triggering platform announcement notification:', error);
    }
  }
}

// Helper function to get role name from ID
function getRoleFromId(roleId) {
  switch (roleId) {
    case 1: return 'Admin';
    case 2: return 'Student';
    case 3: return 'Counselor';
    case 4: return 'Company';
    default: return 'Unknown';
  }
}

module.exports = NotificationTriggers;
