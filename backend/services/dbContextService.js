/**
 * Database Context Service
 *
 * This service is responsible for fetching relevant database context
 * to enhance AI chat prompts with user-specific information.
 */
const pool = require('../config/db');

class DbContextService {
  /**
   * Get user context based on user ID and role
   * @param {number} userID - The user's ID
   * @returns {Promise<Object>} - User context data
   */
  async getUserContext(userID) {
    try {
      if (!userID) {
        console.log('No user ID provided for context');
        return null;
      }

      // Get user role information
      const [users] = await pool.query(
        `SELECT
          u.userID,
          u.username,
          u.email,
          u.roleID,
          CASE u.roleID
            WHEN 1 THEN 'Admin'
            WHEN 2 THEN 'Student'
            WHEN 3 THEN 'Counselor'
            WHEN 4 THEN 'Company'
          END as role_name
        FROM users u
        WHERE u.userID = ?`,
        [userID]
      );

      if (users.length === 0) {
        console.log(`No user found with ID: ${userID}`);
        return null;
      }

      const user = users[0];
      let profileData = null;

      // Get role-specific profile data
      switch (user.roleID) {
        case 2: // Student
          profileData = await this.getStudentProfile(userID);
          break;
        case 3: // Counselor
          profileData = await this.getCounselorProfile(userID);
          break;
        case 4: // Company
          profileData = await this.getCompanyProfile(userID);
          break;
        default:
          // Admin or unknown role
          break;
      }

      return {
        user: {
          id: user.userID,
          username: user.username,
          email: user.email,
          role: user.role_name
        },
        profile: profileData
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  /**
   * Get student profile data
   * @param {number} userID - The user's ID
   * @returns {Promise<Object>} - Student profile data
   */
  async getStudentProfile(userID) {
    try {
      const [students] = await pool.query(
        `SELECT
          s.studentID,
          s.studentNumber,
          s.studentName,
          s.studentTitle,
          s.studentContactNumber,
          s.studentEmail,
          s.studentDescription,
          s.studentCategory,
          s.studentLevel,
          s.studentCareerPathways
        FROM students s
        WHERE s.userID = ?`,
        [userID]
      );

      if (students.length === 0) {
        return null;
      }

      const student = students[0];

      // Handle career pathways based on data type
      let careerPathways = [];
      if (student.studentCareerPathways) {
        try {
          // Check data type and handle accordingly
          if (typeof student.studentCareerPathways === 'object') {
            // Already a parsed JSON object (array)
            careerPathways = student.studentCareerPathways;
          } else if (typeof student.studentCareerPathways === 'string') {
            // Try to parse as JSON string
            if (student.studentCareerPathways.startsWith('[') || student.studentCareerPathways.startsWith('{')) {
              careerPathways = JSON.parse(student.studentCareerPathways);
            } else {
              // Handle comma-separated string format
              careerPathways = student.studentCareerPathways.split(',').map(item => item.trim());
            }
          } else {
            // Unknown format, convert to string and use as single item
            console.warn('Unknown format for career pathways:', typeof student.studentCareerPathways);
            careerPathways = [String(student.studentCareerPathways)];
          }
        } catch (e) {
          console.warn('Failed to parse career pathways:', e);
          // Fallback: if it's a string, try to split by comma
          if (typeof student.studentCareerPathways === 'string') {
            try {
              careerPathways = student.studentCareerPathways.split(',').map(item => item.trim());
            } catch (fallbackError) {
              console.warn('Failed to parse career pathways as comma-separated string:', fallbackError);
              careerPathways = [student.studentCareerPathways];
            }
          } else {
            // Last resort: convert to string and use as single item
            careerPathways = [String(student.studentCareerPathways)];
          }
        }
      }

      return {
        id: student.studentID,
        name: student.studentName,
        title: student.studentTitle,
        email: student.studentEmail,
        description: student.studentDescription,
        category: student.studentCategory,
        level: student.studentLevel,
        careerPathways
      };
    } catch (error) {
      console.error('Error getting student profile:', error);
      return null;
    }
  }

  /**
   * Get counselor profile data
   * @param {number} userID - The user's ID
   * @returns {Promise<Object>} - Counselor profile data
   */
  async getCounselorProfile(userID) {
    try {
      const [counselors] = await pool.query(
        `SELECT
          c.counselorID,
          c.counselorName,
          c.counselorTitle,
          c.counselorContactNumber,
          c.counselorEmail,
          c.counselorDescription,
          c.counselorSpecializations
        FROM counselors c
        WHERE c.userID = ?`,
        [userID]
      );

      if (counselors.length === 0) {
        return null;
      }

      const counselor = counselors[0];

      // Handle specializations based on data type
      let specializations = [];
      if (counselor.counselorSpecializations) {
        try {
          // Check data type and handle accordingly
          if (typeof counselor.counselorSpecializations === 'object') {
            // Already a parsed JSON object (array)
            specializations = counselor.counselorSpecializations;
          } else if (typeof counselor.counselorSpecializations === 'string') {
            // Try to parse as JSON string
            if (counselor.counselorSpecializations.startsWith('[') || counselor.counselorSpecializations.startsWith('{')) {
              specializations = JSON.parse(counselor.counselorSpecializations);
            } else {
              // Handle comma-separated string format
              specializations = counselor.counselorSpecializations.split(',').map(item => item.trim());
            }
          } else {
            // Unknown format, convert to string and use as single item
            console.warn('Unknown format for counselor specializations:', typeof counselor.counselorSpecializations);
            specializations = [String(counselor.counselorSpecializations)];
          }
        } catch (e) {
          console.warn('Failed to parse counselor specializations:', e);
          // Fallback: if it's a string, try to split by comma
          if (typeof counselor.counselorSpecializations === 'string') {
            try {
              specializations = counselor.counselorSpecializations.split(',').map(item => item.trim());
            } catch (fallbackError) {
              console.warn('Failed to parse specializations as comma-separated string:', fallbackError);
              specializations = [counselor.counselorSpecializations];
            }
          } else {
            // Last resort: convert to string and use as single item
            specializations = [String(counselor.counselorSpecializations)];
          }
        }
      }

      return {
        id: counselor.counselorID,
        name: counselor.counselorName,
        title: counselor.counselorTitle,
        email: counselor.counselorEmail,
        description: counselor.counselorDescription,
        specializations
      };
    } catch (error) {
      console.error('Error getting counselor profile:', error);
      return null;
    }
  }

  /**
   * Get company profile data
   * @param {number} userID - The user's ID
   * @returns {Promise<Object>} - Company profile data
   */
  async getCompanyProfile(userID) {
    try {
      const [companies] = await pool.query(
        `SELECT
          c.companyID,
          c.companyName,
          c.companyEmail,
          c.companyPhone,
          c.companyDescription,
          c.companyIndustry
        FROM companies c
        WHERE c.userID = ?`,
        [userID]
      );

      if (companies.length === 0) {
        return null;
      }

      const company = companies[0];

      return {
        id: company.companyID,
        name: company.companyName,
        email: company.companyEmail,
        phone: company.companyPhone,
        description: company.companyDescription,
        industry: company.companyIndustry
      };
    } catch (error) {
      console.error('Error getting company profile:', error);
      return null;
    }
  }

  /**
   * Get recent chat history for a user
   * @param {number} userID - The user's ID
   * @param {number} limit - Maximum number of conversations to retrieve
   * @returns {Promise<Array>} - Recent conversations
   */
  async getRecentChatHistory(userID, limit = 3) {
    try {
      const [conversations] = await pool.query(
        `SELECT c.conversationID, c.title, c.updatedAt
         FROM ai_chat_conversations c
         WHERE c.userID = ?
         ORDER BY c.updatedAt DESC
         LIMIT ?`,
        [userID, limit]
      );

      const recentConversations = [];

      for (const conversation of conversations) {
        const [messages] = await pool.query(
          `SELECT content, isUserMessage, timestamp
           FROM ai_chat_messages
           WHERE conversationID = ?
           ORDER BY timestamp DESC
           LIMIT 5`,
          [conversation.conversationID]
        );

        recentConversations.push({
          id: conversation.conversationID,
          title: conversation.title,
          updatedAt: conversation.updatedAt,
          recentMessages: messages.reverse()
        });
      }

      return recentConversations;
    } catch (error) {
      console.error('Error getting recent chat history:', error);
      return [];
    }
  }

  /**
   * Get recent job listings relevant to the user
   * @param {number} userID - The user's ID
   * @param {number} limit - Maximum number of jobs to retrieve
   * @returns {Promise<Array>} - Recent job listings
   */
  async getRecentJobs(userID, limit = 5) {
    try {
      // First, get the user's role to determine how to fetch jobs
      const [users] = await pool.query(
        `SELECT roleID FROM users WHERE userID = ?`,
        [userID]
      );

      if (users.length === 0) {
        return [];
      }

      const roleID = users[0].roleID;

      let jobs = [];

      if (roleID === 2) { // Student
        // For students, get jobs based on their career pathways
        const [students] = await pool.query(
          `SELECT studentCareerPathways FROM students WHERE userID = ?`,
          [userID]
        );

        if (students.length > 0 && students[0].studentCareerPathways) {
          let careerPathways = [];

          try {
            // Check data type and handle accordingly
            if (typeof students[0].studentCareerPathways === 'object') {
              // Already a parsed JSON object (array)
              careerPathways = students[0].studentCareerPathways;
            } else if (typeof students[0].studentCareerPathways === 'string') {
              // Try to parse as JSON string
              if (students[0].studentCareerPathways.startsWith('[') || students[0].studentCareerPathways.startsWith('{')) {
                careerPathways = JSON.parse(students[0].studentCareerPathways);
              } else {
                // Handle comma-separated string format
                careerPathways = students[0].studentCareerPathways.split(',').map(item => item.trim());
              }
            } else {
              // Unknown format, convert to string and use as single item
              console.warn('Unknown format for career pathways in job matching:', typeof students[0].studentCareerPathways);
              careerPathways = [String(students[0].studentCareerPathways)];
            }
          } catch (e) {
            console.warn('Failed to parse career pathways for job matching:', e);
            // Fallback: if it's a string, try to split by comma
            if (typeof students[0].studentCareerPathways === 'string') {
              try {
                careerPathways = students[0].studentCareerPathways.split(',').map(item => item.trim());
              } catch (fallbackError) {
                console.warn('Failed to parse career pathways as comma-separated string:', fallbackError);
                careerPathways = [students[0].studentCareerPathways];
              }
            } else {
              // Last resort: convert to string and use as single item
              careerPathways = [String(students[0].studentCareerPathways)];
            }
          }

          // If we have career pathways, get matching jobs
          if (careerPathways.length > 0) {
            // Create a query with LIKE conditions for each career pathway
            const likeConditions = careerPathways.map(() => 'j.title LIKE ? OR j.description LIKE ? OR j.tags LIKE ?').join(' OR ');
            const params = [];

            // Add parameters for each career pathway
            careerPathways.forEach(pathway => {
              const likeParam = `%${pathway}%`;
              params.push(likeParam, likeParam, likeParam);
            });

            // Add limit parameter
            params.push(limit);

            // Execute the query
            const [matchingJobs] = await pool.query(
              `SELECT
                j.jobID,
                j.title,
                j.description,
                j.location,
                j.tags,
                j.status,
                j.startDate,
                j.endDate,
                c.companyName
              FROM jobs j
              JOIN companies c ON j.companyID = c.companyID
              WHERE (${likeConditions})
              AND j.endDate >= CURRENT_DATE()
              AND j.status = 'active'
              ORDER BY j.createdAt DESC
              LIMIT ?`,
              params
            );

            jobs = matchingJobs;
          }
        }

        // If no jobs found based on career pathways, get recent jobs
        if (jobs.length === 0) {
          const [recentJobs] = await pool.query(
            `SELECT
              j.jobID,
              j.title,
              j.description,
              j.location,
              j.tags,
              j.status,
              j.startDate,
              j.endDate,
              c.companyName
            FROM jobs j
            JOIN companies c ON j.companyID = c.companyID
            WHERE j.endDate >= CURRENT_DATE()
            AND j.status = 'active'
            ORDER BY j.createdAt DESC
            LIMIT ?`,
            [limit]
          );

          jobs = recentJobs;
        }
      } else if (roleID === 4) { // Company
        // For companies, get their own job listings
        const [companyJobs] = await pool.query(
          `SELECT
            j.jobID,
            j.title,
            j.description,
            j.location,
            j.tags,
            j.status,
            j.startDate,
            j.endDate,
            c.companyName
          FROM jobs j
          JOIN companies c ON j.companyID = c.companyID
          WHERE c.userID = ?
          ORDER BY j.createdAt DESC
          LIMIT ?`,
          [userID, limit]
        );

        jobs = companyJobs;
      } else {
        // For other roles (counselors, admins), get recent jobs
        const [recentJobs] = await pool.query(
          `SELECT
            j.jobID,
            j.title,
            j.description,
            j.location,
            j.tags,
            j.status,
            j.startDate,
            j.endDate,
            c.companyName
          FROM jobs j
          JOIN companies c ON j.companyID = c.companyID
          WHERE j.endDate >= CURRENT_DATE()
          AND j.status = 'active'
          ORDER BY j.createdAt DESC
          LIMIT ?`,
          [limit]
        );

        jobs = recentJobs;
      }

      return jobs.map(job => ({
        id: job.jobID,
        title: job.title,
        company: job.companyName,
        location: job.location,
        type: job.tags, // Using tags as job type
        status: job.status,
        startDate: job.startDate,
        endDate: job.endDate, // Using endDate as deadline
        // Truncate description to avoid too much text
        description: job.description ?
          (job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description) : ''
      }));
    } catch (error) {
      console.error('Error getting recent jobs:', error);
      return [];
    }
  }

  /**
   * Get upcoming events
   * @param {number} limit - Maximum number of events to retrieve
   * @returns {Promise<Array>} - Upcoming events
   */
  async getUpcomingEvents(limit = 3) {
    try {
      const [events] = await pool.query(
        `SELECT
          eventID,
          title,
          eventDate,
          imageURL
        FROM events
        WHERE eventDate >= CURRENT_DATE()
        ORDER BY eventDate ASC
        LIMIT ?`,
        [limit]
      );

      return events.map(event => ({
        id: event.eventID,
        title: event.title,
        date: event.eventDate,
        imageUrl: event.imageURL
      }));
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }

  /**
   * Get latest news articles
   * @param {number} limit - Maximum number of news articles to retrieve
   * @returns {Promise<Array>} - Latest news articles
   */
  async getLatestNews(limit = 3) {
    try {
      const [news] = await pool.query(
        `SELECT
          newsID,
          title,
          content,
          newsDate,
          imageURLs
        FROM news
        ORDER BY newsDate DESC
        LIMIT ?`,
        [limit]
      );

      return news.map(article => ({
        id: article.newsID,
        title: article.title,
        // Truncate content to avoid too much text
        content: article.content ?
          (article.content.length > 150 ? article.content.substring(0, 150) + '...' : article.content) : '',
        publishDate: article.newsDate,
        imageUrl: article.imageURLs ? article.imageURLs.split(',')[0] : null // Get first image URL if multiple
      }));
    } catch (error) {
      console.error('Error getting latest news:', error);
      return [];
    }
  }

  /**
   * Get user's upcoming meetings
   * @param {number} userID - The user's ID
   * @param {number} limit - Maximum number of meetings to retrieve
   * @returns {Promise<Array>} - User's upcoming meetings
   */
  async getUserMeetings(userID, limit = 3) {
    try {
      const [meetings] = await pool.query(
        `SELECT
          m.meetingID,
          m.meetingTitle as title,
          m.meetingDescription as description,
          CONCAT(m.meetingDate, ' ', m.startTime) as startTime,
          CONCAT(m.meetingDate, ' ', m.endTime) as endTime,
          m.status,
          CASE
            WHEN m.requestorID = ? THEN 'requestor'
            ELSE 'recipient'
          END as role,
          CASE
            WHEN m.requestorID = ? THEN r.name
            ELSE q.name
          END as otherPartyName
        FROM meetings m
        JOIN (
          SELECT userID as id,
            CASE
              WHEN roleID = 2 THEN (SELECT studentName FROM students WHERE userID = users.userID)
              WHEN roleID = 3 THEN (SELECT counselorName FROM counselors WHERE userID = users.userID)
              WHEN roleID = 4 THEN (SELECT companyName FROM companies WHERE userID = users.userID)
              ELSE username
            END as name
          FROM users
        ) q ON m.requestorID = q.id
        JOIN (
          SELECT userID as id,
            CASE
              WHEN roleID = 2 THEN (SELECT studentName FROM students WHERE userID = users.userID)
              WHEN roleID = 3 THEN (SELECT counselorName FROM counselors WHERE userID = users.userID)
              WHEN roleID = 4 THEN (SELECT companyName FROM companies WHERE userID = users.userID)
              ELSE username
            END as name
          FROM users
        ) r ON m.recipientID = r.id
        WHERE (m.requestorID = ? OR m.recipientID = ?)
        AND CONCAT(m.meetingDate, ' ', m.startTime) >= CURRENT_TIMESTAMP()
        ORDER BY m.meetingDate ASC, m.startTime ASC
        LIMIT ?`,
        [userID, userID, userID, userID, limit]
      );

      return meetings.map(meeting => ({
        id: meeting.meetingID,
        title: meeting.title,
        description: meeting.description,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        status: meeting.status,
        role: meeting.role,
        otherPartyName: meeting.otherPartyName
      }));
    } catch (error) {
      console.error('Error getting user meetings:', error);
      return [];
    }
  }

  /**
   * Get user's job applications (for students)
   * @param {number} userID - The user's ID
   * @param {number} limit - Maximum number of applications to retrieve
   * @returns {Promise<Array>} - User's job applications
   */
  async getUserJobApplications(userID, limit = 5) {
    try {
      // First check if the user is a student
      const [users] = await pool.query(
        `SELECT roleID FROM users WHERE userID = ?`,
        [userID]
      );

      if (users.length === 0 || users[0].roleID !== 2) {
        // Not a student, return empty array
        return [];
      }

      // Get the student's ID
      const [students] = await pool.query(
        `SELECT studentID FROM students WHERE userID = ?`,
        [userID]
      );

      if (students.length === 0) {
        return [];
      }

      const studentID = students[0].studentID;

      // Get the student's job applications
      const [applications] = await pool.query(
        `SELECT
          a.applicationID,
          a.submittedAt as applicationDate,
          a.status,
          j.title as jobTitle,
          c.companyName
        FROM job_applications a
        JOIN jobs j ON a.jobID = j.jobID
        JOIN companies c ON j.companyID = c.companyID
        WHERE a.studentID = ?
        ORDER BY a.submittedAt DESC
        LIMIT ?`,
        [studentID, limit]
      );

      return applications.map(app => ({
        id: app.applicationID,
        jobTitle: app.jobTitle,
        companyName: app.companyName,
        applicationDate: app.applicationDate,
        status: app.status
      }));
    } catch (error) {
      console.error('Error getting user job applications:', error);
      return [];
    }
  }

  /**
   * Format database context as a string for inclusion in AI prompts
   * @param {Object} context - The database context object
   * @returns {string} - Formatted context string
   */
  formatContextForPrompt(context) {
    if (!context) {
      return '';
    }

    let formattedContext = '### DATABASE CONTEXT ###\n';

    // Add user information
    if (context.user) {
      formattedContext += `\n## USER INFORMATION ##\n`;
      formattedContext += `User ID: ${context.user.id}\n`;
      formattedContext += `Username: ${context.user.username}\n`;
      formattedContext += `Role: ${context.user.role}\n`;
    }

    // Add profile information
    if (context.profile) {
      formattedContext += `\n## PROFILE INFORMATION ##\n`;

      if (context.user.role === 'Student') {
        formattedContext += `Student Name: ${context.profile.name}\n`;
        formattedContext += `Title: ${context.profile.title}\n`;
        formattedContext += `Level: ${context.profile.level}\n`;
        formattedContext += `Category: ${context.profile.category}\n`;

        if (context.profile.description) {
          formattedContext += `Description: ${context.profile.description}\n`;
        }

        if (context.profile.careerPathways && context.profile.careerPathways.length > 0) {
          formattedContext += `Career Pathways: ${context.profile.careerPathways.join(', ')}\n`;
        }
      } else if (context.user.role === 'Counselor') {
        formattedContext += `Counselor Name: ${context.profile.name}\n`;
        formattedContext += `Title: ${context.profile.title}\n`;

        if (context.profile.description) {
          formattedContext += `Description: ${context.profile.description}\n`;
        }

        if (context.profile.specializations && context.profile.specializations.length > 0) {
          formattedContext += `Specializations: ${context.profile.specializations.join(', ')}\n`;
        }
      } else if (context.user.role === 'Company') {
        formattedContext += `Company Name: ${context.profile.name}\n`;
        formattedContext += `Industry: ${context.profile.industry}\n`;

        if (context.profile.description) {
          formattedContext += `Description: ${context.profile.description}\n`;
        }
      }
    }

    // Add job applications (for students)
    if (context.jobApplications && context.jobApplications.length > 0) {
      formattedContext += `\n## JOB APPLICATIONS ##\n`;

      context.jobApplications.forEach((application, index) => {
        formattedContext += `${index + 1}. ${application.jobTitle} at ${application.companyName}\n`;
        formattedContext += `   Status: ${application.status}\n`;
        formattedContext += `   Applied: ${new Date(application.applicationDate).toLocaleDateString()}\n`;
      });
    }

    // Add upcoming meetings
    if (context.meetings && context.meetings.length > 0) {
      formattedContext += `\n## UPCOMING MEETINGS ##\n`;

      context.meetings.forEach((meeting, index) => {
        const startTime = new Date(meeting.startTime);
        const endTime = new Date(meeting.endTime);

        formattedContext += `${index + 1}. ${meeting.title}\n`;
        formattedContext += `   With: ${meeting.otherPartyName}\n`;
        formattedContext += `   When: ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}\n`;
        formattedContext += `   Status: ${meeting.status}\n`;

        if (meeting.description) {
          formattedContext += `   Description: ${meeting.description.substring(0, 100)}${meeting.description.length > 100 ? '...' : ''}\n`;
        }
      });
    }

    // Add relevant jobs
    if (context.jobs && context.jobs.length > 0) {
      formattedContext += `\n## RELEVANT JOBS ##\n`;

      context.jobs.forEach((job, index) => {
        formattedContext += `${index + 1}. ${job.title} at ${job.company}\n`;
        formattedContext += `   Location: ${job.location}\n`;
        formattedContext += `   Type: ${job.type}\n`;

        if (job.salary) {
          formattedContext += `   Salary: ${job.salary}\n`;
        }

        if (job.endDate) {
          formattedContext += `   End Date: ${new Date(job.endDate).toLocaleDateString()}\n`;
        }

        if (job.description) {
          formattedContext += `   Description: ${job.description}\n`;
        }
      });
    }

    // Add upcoming events
    if (context.events && context.events.length > 0) {
      formattedContext += `\n## UPCOMING EVENTS ##\n`;

      context.events.forEach((event, index) => {
        formattedContext += `${index + 1}. ${event.title}\n`;
        formattedContext += `   Date: ${new Date(event.date).toLocaleDateString()}\n`;
      });
    }

    // Add latest news
    if (context.news && context.news.length > 0) {
      formattedContext += `\n## LATEST NEWS ##\n`;

      context.news.forEach((article, index) => {
        formattedContext += `${index + 1}. ${article.title}\n`;
        formattedContext += `   Published: ${new Date(article.publishDate).toLocaleDateString()}\n`;

        if (article.content) {
          formattedContext += `   Summary: ${article.content}\n`;
        }
      });
    }

    // Add recent chat history
    if (context.recentConversations && context.recentConversations.length > 0) {
      formattedContext += `\n## RECENT CONVERSATIONS ##\n`;

      context.recentConversations.forEach((conversation, index) => {
        formattedContext += `\nConversation ${index + 1}: "${conversation.title}"\n`;

        if (conversation.recentMessages && conversation.recentMessages.length > 0) {
          conversation.recentMessages.forEach(message => {
            const role = message.isUserMessage ? 'User' : 'AI';
            formattedContext += `${role}: ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}\n`;
          });
        }
      });
    }

    formattedContext += '\n### END DATABASE CONTEXT ###\n';
    return formattedContext;
  }
}

module.exports = new DbContextService();
