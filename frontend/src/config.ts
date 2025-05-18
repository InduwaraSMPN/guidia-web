/**
 * Application configuration
 */

// API URL for backend requests
export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Default pagination limit
export const DEFAULT_PAGE_SIZE = 10;

// Token refresh settings
export const TOKEN_REFRESH = {
  // How many seconds before token expiry to trigger a refresh
  REFRESH_THRESHOLD_SECONDS: 300, // 5 minutes
};

// Application settings
export const APP_SETTINGS = {
  // Application name
  APP_NAME: 'Guidia',
  // Application version
  APP_VERSION: '1.0.0',
  // Support email
  SUPPORT_EMAIL: 'guidia.web@gmail.com',
};

// Date format settings
export const DATE_FORMATS = {
  // Default date format
  DEFAULT: 'MM/DD/YYYY',
  // Date format with time
  WITH_TIME: 'MM/DD/YYYY hh:mm A',
  // Time only format
  TIME_ONLY: 'hh:mm A',
};

// File upload settings
export const UPLOAD_SETTINGS = {
  // Maximum file size in bytes (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  // Allowed file types
  ALLOWED_FILE_TYPES: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp'],

  // File type categories
  FILE_TYPES: {
    // Document file types
    DOCUMENTS: ['.pdf', '.doc', '.docx'],
    // Image file types
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    // All supported file types
    ALL: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.webp']
  },

  // MIME type mapping
  MIME_TYPES: {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  },
};

// Environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
