/**
 * Security configuration for Guidia Web
 * Centralizes security settings for the application
 */

// Allowed hosts for external requests
const ALLOWED_HOSTS = [
  'api.openai.com',
  'api.sambanova.ai',
  'api.deepseek.com',
  'guidiacloudstorage.blob.core.windows.net'
];

// Allowed domains (including subdomains)
const ALLOWED_DOMAINS = [
  'openai.com',
  'sambanova.ai',
  'deepseek.com',
  'blob.core.windows.net'
];

// Blocked IP addresses
const BLOCKED_IPS = [
  // Add known malicious IPs here
];

// SSRF protection options
const SSRF_PROTECTION_OPTIONS = {
  allowedHosts: ALLOWED_HOSTS,
  allowedDomains: ALLOWED_DOMAINS,
  blockedIps: BLOCKED_IPS,
  allowPrivateIps: false,
  allowLocalhost: process.env.NODE_ENV === 'development',
  allowOnlyHttps: process.env.NODE_ENV === 'production'
};

// CORS options
const CORS_OPTIONS = {
  origin: process.env.FRONTEND_URL || 'http://localhost:1030',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'x-csrf-token'
  ],
  exposedHeaders: [
    'X-CSRF-Token',
    'x-csrf-token',
    'Content-Type',
    'Authorization'
  ]
};

// Rate limiting options
const RATE_LIMIT_OPTIONS = {
  // General API rate limit
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per 15 minutes
  },
  
  // Authentication rate limit
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // 5 requests per 15 minutes
  },
  
  // Password reset rate limit
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3 // 3 requests per hour
  },
  
  // Registration rate limit
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5 // 5 requests per hour
  },
  
  // Sensitive operations rate limit
  sensitiveOperations: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20 // 20 requests per hour
  },
  
  // Enumeration rate limit
  enumeration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50 // 50 requests per hour
  }
};

// JWT options
const JWT_OPTIONS = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRY || '1h',
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  algorithm: 'HS256',
  issuer: 'guidia-web',
  audience: 'guidia-users'
};

// Password policy
const PASSWORD_POLICY = {
  minLength: 8,
  requireLowercase: true,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
};

// Account lockout policy
const ACCOUNT_LOCKOUT_POLICY = {
  maxAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  resetAfter: 24 * 60 * 60 * 1000 // 24 hours
};

// File upload policy
const FILE_UPLOAD_POLICY = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  allowedExtensions: [
    'pdf',
    'doc',
    'docx',
    'jpg',
    'jpeg',
    'png',
    'gif'
  ]
};

// Security audit log settings
const SECURITY_AUDIT_LOG_SETTINGS = {
  enabled: true,
  logToFile: process.env.NODE_ENV === 'production',
  logToDatabase: true,
  logToConsole: true,
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  retentionDays: 90
};

module.exports = {
  ALLOWED_HOSTS,
  ALLOWED_DOMAINS,
  BLOCKED_IPS,
  SSRF_PROTECTION_OPTIONS,
  CORS_OPTIONS,
  RATE_LIMIT_OPTIONS,
  JWT_OPTIONS,
  PASSWORD_POLICY,
  ACCOUNT_LOCKOUT_POLICY,
  FILE_UPLOAD_POLICY,
  SECURITY_AUDIT_LOG_SETTINGS
};
