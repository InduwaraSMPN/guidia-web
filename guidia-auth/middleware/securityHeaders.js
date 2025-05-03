/**
 * Security headers middleware for Guidia Web
 * Implements recommended security headers to protect against common web vulnerabilities
 */

/**
 * Apply security headers to all responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function securityHeaders(req, res, next) {
  // Content Security Policy
  // Customize this based on your application's needs
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "img-src 'self' data: https://guidiacloudstorage.blob.core.windows.net",
      "font-src 'self' data:",
      "connect-src 'self' https://guidiacloudstorage.blob.core.windows.net wss://localhost:* ws://localhost:*",
      "frame-src 'none'",
      "object-src 'none'"
    ].join('; ')
  );
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Feature Policy / Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
}

/**
 * Apply security headers for file uploads
 * More permissive CSP for file upload pages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function uploadSecurityHeaders(req, res, next) {
  // More permissive CSP for file upload pages
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "img-src 'self' data: blob: https://guidiacloudstorage.blob.core.windows.net",
      "font-src 'self' data:",
      "connect-src 'self' https://guidiacloudstorage.blob.core.windows.net wss://localhost:* ws://localhost:*",
      "frame-src 'none'",
      "object-src 'none'",
      "media-src 'self' blob:",
      "worker-src 'self' blob:"
    ].join('; ')
  );
  
  // Other security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
}

/**
 * Apply security headers for API endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function apiSecurityHeaders(req, res, next) {
  // API endpoints don't need CSP
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Cache control for API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
}

module.exports = {
  securityHeaders,
  uploadSecurityHeaders,
  apiSecurityHeaders
};
