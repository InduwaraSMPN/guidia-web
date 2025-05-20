# Guidia Web Application
![Logo](https://ik.imagekit.io/pasindunaduninduwara/logo.svg)
## Project Overview

Guidia is a comprehensive career guidance platform designed to connect students with counselors and companies. The platform facilitates career exploration, job searching, and professional networking in an educational context. Guidia serves as a bridge between educational institutions and the job market, helping students transition from education to employment with personalized guidance.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Routing**: React Router v7
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives
- **Data Visualization**: Recharts
- **PDF Handling**: React PDF
- **Rich Text Editing**: Quill
- **Notifications**: Sonner
- **Error Tracking**: Sentry

### Backend
- **Runtime**: Node.js with Express
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.IO
- **Email Service**: Nodemailer with Gmail
- **File Storage**: Azure Blob Storage
- **Security**: Helmet, XSS protection, CSRF protection, rate limiting
- **AI Integration**: OpenAI, SambaNova, DeepSeek
- **Task Scheduling**: Node-schedule
- **Firebase**: Real-time database for notifications

### Architecture
- **Client-Server Architecture**: Separate frontend and backend applications
- **RESTful API**: Communication between frontend and backend
- **WebSockets**: Real-time notifications and messaging
- **Microservices**: Modular backend services for different functionalities

## Main Features

### User Management
- **Multiple User Roles**: Admin, Student, Counselor, Company
- **Authentication**: Secure login, registration, and password reset
- **Profile Management**: Customizable profiles for each user type
- **Email Verification**: Secure account creation process

### Student Features
- **Career Pathway Exploration**: Browse and select career interests
- **Document Management**: Upload and manage resumes and other documents
- **Job Applications**: Apply to job postings from companies
- **Meeting Scheduling**: Book sessions with counselors
- **AI Assistant**: Get career guidance from Guidia AI

### Counselor Features
- **Specialization Management**: Define areas of expertise
- **Availability Settings**: Set meeting availability
- **Student Interaction**: Message and meet with students
- **Language Settings**: Specify languages spoken

### Company Features
- **Job Posting**: Create and manage job listings
- **Application Management**: Review and respond to student applications
- **Company Profile**: Showcase company information
- **Student Recruitment**: Connect with potential candidates

### Admin Features
- **User Management**: Approve registrations and manage users
- **Content Management**: Manage news and events
- **System Monitoring**: View system health and activity
- **Security Auditing**: Track security events
- **Reporting**: Generate system reports

### Communication
- **Messaging System**: Direct messaging between users
- **Notifications**: Real-time notifications for important events
- **Meeting Scheduling**: Calendar integration for appointments

### Content
- **News**: Platform announcements and career news
- **Events**: Career events and important dates

## Installation Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Git

### Setup Steps

1. **Clone the repository**
   ```powershell
   git clone <repository-url>
   cd guidia-web
   ```

2. **Install dependencies**
   ```powershell
   npm run install:all
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the variables with your configuration

4. **Set up the database**
   - Create a MySQL database named `guidia-web-db`
   - Import the database schema (if available) or run migrations

5. **Start the development servers**
   ```powershell
   npm run dev
   ```

## Configuration

### Environment Variables

#### Backend (.env)
```
# Database configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=guidia-web-db

# JWT configuration
JWT_SECRET=your_jwt_secret_key

# Email configuration
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Azure Storage configuration
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
AZURE_STORAGE_CONTAINER_NAME=your_azure_container_name

# Server configuration
PORT=3001
FRONTEND_URL=http://localhost:1030

# Firebase configuration
FIREBASE_DATABASE_URL=your_firebase_database_url

# AI configuration
SAMBANOVA_API_KEY=your_sambanova_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
```

#### Frontend (.env)
```
# API configuration
VITE_API_BASE_URL=http://localhost:3001

# Firebase configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
```

## Development Workflow

### Available Scripts

#### Root Directory
- `npm run dev` - Start both frontend and backend development servers
- `npm run dev:frontend` - Start only the frontend development server
- `npm run dev:backend` - Start only the backend development server
- `npm run install:all` - Install dependencies for both frontend and backend
- `npm run install:frontend` - Install frontend dependencies
- `npm run install:backend` - Install backend dependencies
- `npm run build` - Build both frontend and backend for production
- `npm run build:frontend` - Build only the frontend for production
- `npm run build:backend` - Build only the backend for production
- `npm run lint` - Run linting on the frontend code

#### Backend Directory
- `npm run start` - Start the backend server
- `npm run dev` - Start the backend server in development mode
- `npm run test-firebase` - Test Firebase connection
- `npm run rotate-key` - Rotate Firebase service account key
- `npm run schedule-rotation` - Schedule Firebase key rotation

#### Frontend Directory
- `npm run dev` - Start the frontend development server
- `npm run build` - Build the frontend for production
- `npm run lint` - Run linting
- `npm run preview` - Preview the production build locally

### Development Process
1. Start the development servers using `npm run dev`
2. Frontend will be available at http://localhost:1030
3. Backend API will be available at http://localhost:3001
4. Make changes to the code
5. The servers will automatically reload when changes are detected

## Project Structure

### Root Directory
- `frontend/` - Frontend React application
- `backend/` - Backend Express API
- `package.json` - Root package.json for running both applications
- `.ps1` - PowerShell script for starting development environment

### Frontend Structure
- `src/` - Source code
  - `components/` - Reusable UI components
  - `contexts/` - React context providers
  - `features/` - Feature-specific components
  - `lib/` - Utility functions and helpers
  - `pages/` - Page components
  - `firebase/` - Firebase configuration
  - `App.tsx` - Main application component
  - `main.tsx` - Application entry point
- `public/` - Static assets
- `vite.config.ts` - Vite configuration

### Backend Structure
- `config/` - Configuration files
- `controllers/` - Request handlers
- `middleware/` - Express middleware
- `routes/` - API routes
- `services/` - Business logic
- `utils/` - Utility functions
- `email-templates/` - Email templates
- `scripts/` - Utility scripts
- `index.js` - Server entry point

## API Documentation

The backend provides RESTful API endpoints for various functionalities:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/email-verification` - Verify email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password

### Users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:userID` - Get student by user ID
- `POST /api/students/profile` - Update student profile

### Counselors
- `GET /api/counselors` - Get all counselors
- `GET /api/counselors/:id` - Get counselor by ID
- `POST /api/counselors/profile` - Update counselor profile

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies/profile` - Update company profile

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `POST /api/jobs/:id/apply` - Apply for job

### Meetings
- `GET /api/meeting` - Get user meetings
- `POST /api/meeting` - Create meeting
- `PUT /api/meeting/:id` - Update meeting
- `DELETE /api/meeting/:id` - Delete meeting

### Messages
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message

### AI Assistant
- `POST /api/openai/chat` - Send message to AI

## Database Schema

The application uses a MySQL database with the following main tables:

- `users` - User accounts and authentication
- `students` - Student profiles
- `counselors` - Counselor profiles
- `companies` - Company profiles
- `jobs` - Job listings
- `job_applications` - Job applications
- `meetings` - Scheduled meetings
- `messages` - User messages
- `news` - News articles
- `events` - Event listings
- `ai_chat_conversations` - AI chat history
- `notifications` - User notifications

## Deployment Instructions

### Production Build
1. Create production builds for both frontend and backend:
   ```powershell
   npm run build
   ```

2. Set up environment variables for production:
   - Update `.env` files with production values
   - Set `NODE_ENV=production`

3. Deploy the backend:
   - Copy the backend directory to your server
   - Install production dependencies: `npm install --production`
   - Start the server: `npm start`

4. Deploy the frontend:
   - Copy the contents of `frontend/dist` to your web server
   - Configure the web server to serve the static files
   - Set up URL rewriting for client-side routing

### Hosting Options
- **Frontend**: Vercel, Netlify, Azure Static Web Apps
- **Backend**: Azure App Service, AWS Elastic Beanstalk, Heroku
- **Database**: Azure Database for MySQL, AWS RDS, managed MySQL hosting

## Contributing Guidelines

1. **Fork the repository**
2. **Create a feature branch**
   ```powershell
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run linting and tests**
   ```powershell
   npm run lint
   ```
5. **Commit your changes**
   ```powershell
   git commit -m "Add your feature description"
   ```
6. **Push to your branch**
   ```powershell
   git push origin feature/your-feature-name
   ```
7. **Create a pull request**

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify database credentials in `.env` file
   - Ensure MySQL server is running
   - Check network connectivity to database server

2. **Authentication Issues**
   - Verify JWT_SECRET is set correctly
   - Check token expiration settings
   - Clear browser cookies and local storage

3. **File Upload Problems**
   - Verify Azure Storage connection string
   - Check container permissions
   - Ensure file size is within limits

4. **Development Server Not Starting**
   - Check for port conflicts
   - Verify all dependencies are installed
   - Check for syntax errors in recent changes

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

© 2023-2024 Guidia. All rights reserved.