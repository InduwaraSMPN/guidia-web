/**
 * Test script for database context enrichment
 *
 * This script tests the database context service and its integration with the AI service
 * It can work with or without a database connection
 *
 * Usage:
 * node tests/test-db-context.js [userID]
 */

const DbContextService = require('../services/dbContextService');
const OpenAIService = require('../services/openaiService');
const pool = require('../config/db');

// Mock data to use when database is not available
const mockUserContext = {
  user: {
    id: 1,
    username: "johndoe",
    email: "john.doe@example.com",
    role: "Student"
  },
  profile: {
    id: 101,
    name: "John Doe",
    title: "Computer Science Student",
    email: "john.doe@example.com",
    description: "Final year computer science student interested in software development and AI.",
    category: "Undergraduate",
    level: "Year 4",
    careerPathways: ["Software Development", "Data Science", "AI Research"]
  }
};

const mockRecentConversations = [
  {
    id: 201,
    title: "Career advice for software development",
    updatedAt: new Date().toISOString(),
    recentMessages: [
      {
        content: "What skills should I focus on for a career in software development?",
        isUserMessage: true,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        content: "For software development, focus on programming languages like JavaScript, Python, or Java, version control with Git, and understanding of data structures and algorithms. Web frameworks, database knowledge, and soft skills like communication are also important.",
        isUserMessage: false,
        timestamp: new Date(Date.now() - 3500000).toISOString()
      }
    ]
  }
];

// Mock jobs data
const mockJobs = [
  {
    id: 301,
    title: "Software Developer",
    company: "TechCorp",
    location: "Colombo, Sri Lanka",
    type: "Full-time",
    salary: "Rs. 150,000 - Rs. 200,000",
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Looking for a skilled software developer with experience in React and Node.js."
  },
  {
    id: 302,
    title: "Data Scientist",
    company: "DataInsights",
    location: "Remote",
    type: "Full-time",
    salary: "Rs. 180,000 - Rs. 250,000",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Seeking a data scientist with expertise in machine learning and statistical analysis."
  }
];

// Mock events data
const mockEvents = [
  {
    id: 401,
    title: "Career Fair 2025",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://example.com/career-fair.jpg"
  },
  {
    id: 402,
    title: "Tech Workshop: AI Fundamentals",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://example.com/ai-workshop.jpg"
  }
];

// Mock news data
const mockNews = [
  {
    id: 501,
    title: "University of Kelaniya Partners with Leading Tech Companies",
    content: "The University of Kelaniya has announced new partnerships with several leading technology companies to enhance student opportunities.",
    publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://example.com/partnership-news.jpg"
  },
  {
    id: 502,
    title: "New Career Guidance Resources Available",
    content: "The Career Guidance Unit has launched new resources to help students prepare for job interviews and career planning.",
    publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: "https://example.com/resources-news.jpg"
  }
];

// Mock meetings data
const mockMeetings = [
  {
    id: 601,
    title: "Career Counseling Session",
    description: "One-on-one career guidance session to discuss career options and job search strategies.",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: "Confirmed",
    role: "requestor",
    otherPartyName: "Dr. Sarah Johnson"
  }
];

// Mock job applications data
const mockJobApplications = [
  {
    id: 701,
    jobTitle: "Junior Software Engineer",
    companyName: "InnovateX",
    applicationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Under Review"
  },
  {
    id: 702,
    jobTitle: "Data Analyst Intern",
    companyName: "DataTech Solutions",
    applicationDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: "Interview Scheduled"
  }
];

async function testDbContext() {
  console.log('Testing Database Context Enrichment...');
  console.log('=====================================');

  // Get user ID from command line or use default
  const userID = process.argv[2] || 5; // Default to user ID 5 if not provided
  console.log(`Using user ID: ${userID}`);

  // Flag to track if we're using mock data
  let usingMockData = false;
  let userContext = null;
  let recentConversations = [];

  try {
    // Test 1: Get user context
    console.log('\n1. Testing User Context Retrieval:');
    console.log('--------------------------------');
    try {
      userContext = await DbContextService.getUserContext(userID);
      if (!userContext) {
        console.log('No user context found in database, using mock data');
        userContext = mockUserContext;
        usingMockData = true;
      }
    } catch (error) {
      console.log('Error connecting to database, using mock data instead');
      console.log('Error details:', error.message);
      userContext = mockUserContext;
      usingMockData = true;
    }
    console.log('User context retrieved:');
    console.log(JSON.stringify(userContext, null, 2));

    // Test 2: Get recent chat history
    console.log('\n2. Testing Recent Chat History Retrieval:');
    console.log('--------------------------------------');
    try {
      if (!usingMockData) {
        recentConversations = await DbContextService.getRecentChatHistory(userID, 2);
        if (!recentConversations || recentConversations.length === 0) {
          console.log('No recent conversations found in database, using mock data');
          recentConversations = mockRecentConversations;
          usingMockData = true;
        }
      } else {
        recentConversations = mockRecentConversations;
      }
    } catch (error) {
      console.log('Error retrieving chat history, using mock data instead');
      console.log('Error details:', error.message);
      recentConversations = mockRecentConversations;
      usingMockData = true;
    }
    console.log('Recent conversations retrieved:');
    console.log(JSON.stringify(recentConversations, null, 2));

    // Test 3: Get additional context data
    console.log('\n3. Testing Additional Context Data:');
    console.log('--------------------------------');

    // Get jobs data
    let jobs = [];
    try {
      if (!usingMockData) {
        jobs = await DbContextService.getRecentJobs(userID, 3);
        if (jobs.length === 0) {
          console.log('No jobs found in database, using mock data');
          jobs = mockJobs;
        }
      } else {
        jobs = mockJobs;
      }
    } catch (error) {
      console.log('Error retrieving jobs data, using mock data instead');
      console.log('Error details:', error.message);
      jobs = mockJobs;
    }
    console.log('Jobs data retrieved:', jobs.length, 'jobs');

    // Get events data
    let events = [];
    try {
      if (!usingMockData) {
        events = await DbContextService.getUpcomingEvents(2);
        if (events.length === 0) {
          console.log('No events found in database, using mock data');
          events = mockEvents;
        }
      } else {
        events = mockEvents;
      }
    } catch (error) {
      console.log('Error retrieving events data, using mock data instead');
      console.log('Error details:', error.message);
      events = mockEvents;
    }
    console.log('Events data retrieved:', events.length, 'events');

    // Get news data
    let news = [];
    try {
      if (!usingMockData) {
        news = await DbContextService.getLatestNews(2);
        if (news.length === 0) {
          console.log('No news found in database, using mock data');
          news = mockNews;
        }
      } else {
        news = mockNews;
      }
    } catch (error) {
      console.log('Error retrieving news data, using mock data instead');
      console.log('Error details:', error.message);
      news = mockNews;
    }
    console.log('News data retrieved:', news.length, 'articles');

    // Get meetings data
    let meetings = [];
    try {
      if (!usingMockData) {
        meetings = await DbContextService.getUserMeetings(userID, 2);
        if (meetings.length === 0) {
          console.log('No meetings found in database, using mock data');
          meetings = mockMeetings;
        }
      } else {
        meetings = mockMeetings;
      }
    } catch (error) {
      console.log('Error retrieving meetings data, using mock data instead');
      console.log('Error details:', error.message);
      meetings = mockMeetings;
    }
    console.log('Meetings data retrieved:', meetings.length, 'meetings');

    // Get job applications data
    let jobApplications = [];
    try {
      if (!usingMockData) {
        jobApplications = await DbContextService.getUserJobApplications(userID, 3);
        if (jobApplications.length === 0) {
          console.log('No job applications found in database, using mock data');
          jobApplications = mockJobApplications;
        }
      } else {
        jobApplications = mockJobApplications;
      }
    } catch (error) {
      console.log('Error retrieving job applications data, using mock data instead');
      console.log('Error details:', error.message);
      jobApplications = mockJobApplications;
    }
    console.log('Job applications data retrieved:', jobApplications.length, 'applications');

    // Test 4: Format context for prompt
    console.log('\n4. Testing Context Formatting:');
    console.log('----------------------------');
    const dbContext = {
      ...userContext,
      recentConversations,
      jobs,
      events,
      news,
      meetings,
      jobApplications
    };
    const formattedContext = DbContextService.formatContextForPrompt(dbContext);
    console.log('Formatted context:');
    console.log(formattedContext);

    // Test 5: Test AI service with context
    console.log('\n5. Testing AI Service with Context:');
    console.log('--------------------------------');
    const aiService = new OpenAIService();

    // First test without context
    console.log('\nSending message WITHOUT context:');
    try {
      const responseWithoutContext = await aiService.sendMessage(
        'Tell me about my profile',
        [],
        false
      );
      console.log('Response WITHOUT context:');
      console.log(responseWithoutContext);
    } catch (error) {
      console.error('Error getting response without context:', error.message);
    }

    // Then test with context
    console.log('\nSending message WITH context:');
    try {
      const responseWithContext = await aiService.sendMessage(
        'Tell me about my profile',
        [],
        false,
        null,
        formattedContext
      );
      console.log('Response WITH context:');
      console.log(responseWithContext);
    } catch (error) {
      console.error('Error getting response with context:', error.message);
    }

    console.log('\nTests completed.');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    // Close the database connection if it's open
    try {
      if (pool) {
        await pool.end();
        console.log('Database connection closed');
      }
    } catch (error) {
      console.log('Error closing database connection:', error.message);
    }
    console.log('\nTest script completed');
    process.exit();
  }
}

// Run the tests
testDbContext();
