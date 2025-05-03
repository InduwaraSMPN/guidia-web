# Guidia Web Security Documentation

This document provides a comprehensive overview of the security measures implemented in the Guidia Web application to protect against the OWASP Top Ten vulnerabilities and other security threats.

## Table of Contents

1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [Rate Limiting](#rate-limiting)
4. [CSRF Protection](#csrf-protection)
5. [Input Validation](#input-validation)
6. [Secure Communications](#secure-communications)
7. [Data Protection](#data-protection)
8. [Logging and Monitoring](#logging-and-monitoring)
9. [File Security](#file-security)
10. [OWASP Top Ten Mitigations](#owasp-top-ten-mitigations)
11. [Implementation Details](#implementation-details)
12. [Security Recommendations](#security-recommendations)

## Authentication

The authentication system is based on JSON Web Tokens (JWT) and provides:

1. **Token-based authentication**: Using JWT for stateless authentication
2. **Token refresh**: Automatic refresh of expired tokens
3. **Role-based access control**: Different middleware for different user roles
4. **Database validation**: Verification that users exist in the database
5. **Account lockout**: Temporary lockout after multiple failed login attempts
6. **Secure password reset**: Secure token-based password reset flow
7. **Password strength enforcement**: Requirements for strong passwords


## Authorization

The authorization system provides:

1. **Role-based access control (RBAC)**: Different permissions for different user roles
2. **Resource-based access control**: Access control based on resource ownership
3. **Middleware-based protection**: Routes protected with authentication middleware
4. **Fine-grained permissions**: Specific permissions for specific operations

## Rate Limiting

Rate limiting is implemented to prevent brute force attacks and abuse:

1. **Authentication endpoints**: Limited to 5 requests per 15 minutes per IP
2. **Registration endpoints**: Limited to 5 requests per hour per IP
3. **Password reset**: Limited to 3 requests per hour per IP
4. **General API**: Limited to 100 requests per 15 minutes per IP
5. **Sensitive operations**: Limited to 20 requests per hour per IP
6. **Enumeration prevention**: Limited to 50 requests per hour per IP

Rate limiting is implemented using the `express-rate-limit` package and enhanced with custom tracking of failed attempts.

## CSRF Protection

Cross-Site Request Forgery (CSRF) protection is implemented for sensitive operations:

1. **Token generation**: CSRF tokens are generated for authenticated users
2. **Token verification**: CSRF tokens are verified for mutating operations (POST, PUT, DELETE)
3. **Token expiration**: CSRF tokens expire after 1 hour
4. **Secure storage**: Tokens are stored securely with HTTP-only cookies
5. **Double submit cookie pattern**: Tokens are validated using the double submit cookie pattern

CSRF protection is implemented using a custom middleware.

### Protected Endpoints

The following endpoints are protected with CSRF:

- `POST /api/users/change-password` - Change user password
- `PUT /api/users/profile` - Update user profile
- `POST /auth/reset-password` - Reset password
- All administrative endpoints
- All data modification endpoints

### How CSRF Protection Works

1. When a user logs in, a CSRF token is generated and returned in the `X-CSRF-Token` response header
2. The frontend stores this token in localStorage
3. For sensitive operations, the frontend includes the token in the `X-CSRF-Token` request header
4. The server verifies that the token is valid and belongs to the authenticated user
5. If the token is invalid or missing, the request is rejected with a 403 Forbidden response

## Input Validation

Comprehensive input validation is implemented to prevent injection attacks:

1. **Server-side validation**: All user input is validated on the server
2. **Type checking**: Input is validated for correct data types
3. **Format validation**: Input is validated for correct format (email, phone, etc.)
4. **Length validation**: Input is validated for appropriate length
5. **Content validation**: Input is validated for appropriate content
6. **HTML sanitization**: Rich text input is sanitized to prevent XSS

## Secure Communications

Secure communications are ensured through:

1. **HTTPS**: All communication should be over HTTPS in production
2. **Security headers**: Appropriate security headers are set
3. **Content Security Policy**: CSP is configured to prevent XSS
4. **CORS**: Proper CORS configuration to prevent unauthorized access
5. **Subresource Integrity**: SRI is used for external resources

## Data Protection

Sensitive data is protected through:

1. **Password hashing**: Passwords are hashed using bcrypt with appropriate cost factor
2. **Encryption**: Sensitive data is encrypted at rest
3. **Data minimization**: Only necessary data is collected and stored
4. **Secure storage**: Sensitive data is stored securely
5. **Secure transmission**: Sensitive data is transmitted securely

## Logging and Monitoring

Comprehensive logging and monitoring is implemented:

1. **Security event logging**: Security events are logged for auditing
2. **Centralized logging**: Logs are centralized for analysis
3. **Anomaly detection**: Unusual activity is detected and alerted
4. **Audit trails**: User actions are logged for accountability
5. **Log protection**: Logs are protected from tampering

## File Security

File uploads and downloads are secured through:

1. **File type validation**: Only allowed file types can be uploaded
2. **File size limits**: Maximum file size is enforced
3. **Virus scanning**: Files are scanned for malware
4. **Secure storage**: Files are stored securely in Azure Blob Storage
5. **Access control**: Files can only be accessed by authorized users
6. **Content disposition**: Proper content disposition headers are set

## OWASP Top Ten Mitigations

### A01:2021-Broken Access Control

- Role-based access control (RBAC)
- Resource-based access control
- JWT-based authentication
- Proper session management
- CORS configuration
- Principle of least privilege

### A02:2021-Cryptographic Failures

- Secure password hashing with bcrypt
- Secure JWT implementation
- Encryption of sensitive data
- HTTPS enforcement
- Secure key management
- Strong cryptographic algorithms

### A03:2021-Injection

- Parameterized SQL queries
- Input validation and sanitization
- HTML sanitization for rich text
- Content Security Policy
- XSS protection
- Command injection protection

### A04:2021-Insecure Design

- Threat modeling
- Security requirements
- Secure design patterns
- Defense in depth
- Principle of least privilege
- Secure defaults

### A05:2021-Security Misconfiguration

- Security headers
- Proper error handling
- Secure server configuration
- Environment-specific configuration
- Removal of default accounts and settings
- Security checklist

### A06:2021-Vulnerable and Outdated Components

- Regular dependency updates
- Dependency scanning
- Security audit script
- Tracking of third-party components
- Removal of unused dependencies
- Secure dependency management

### A07:2021-Identification and Authentication Failures

- Secure password policies
- Account lockout mechanism
- Multi-factor authentication
- Secure password reset
- Session management
- Credential stuffing protection

### A08:2021-Software and Data Integrity Failures

- File integrity checking
- Secure file uploads
- Subresource Integrity (SRI)
- Secure update process
- Integrity verification
- Supply chain security

### A09:2021-Security Logging and Monitoring Failures

- Comprehensive security logging
- Centralized log management
- Security event monitoring
- Audit logging
- Alerting for suspicious activities
- Log retention policy

### A10:2021-Server-Side Request Forgery (SSRF)

- URL validation
- Allowlisting of domains and hosts
- IP address validation
- Secure HTTP client
- Proper error handling
- Defense in depth

## Implementation Details

### Rate Limiting

Rate limiting is implemented in `middleware/rateLimiter.js` and applied to sensitive endpoints:

```javascript
// Auth endpoints
app.post('/auth/login', authLimiter, async (req, res) => {
  // ...
});

// Registration endpoint
app.post('/auth/register', registrationLimiter, async (req, res) => {
  // ...
});
```

### CSRF Protection

CSRF protection is implemented in `middleware/csrfProtection.js` and can be applied to sensitive routes:

```javascript
const { csrfProtection } = require('./middleware/csrfProtection');

// Apply CSRF protection to sensitive routes
app.post('/api/users/change-password', verifyToken, csrfProtection, (req, res) => {
  // ...
});
```

### Security Logging

Security logging is implemented in `middleware/securityMiddleware.js` and applied to all requests:

```javascript
const { securityLogging } = require('./middleware/securityMiddleware');

// Apply security logging to all requests
app.use(securityLogging);
```

### SSRF Protection

SSRF protection is implemented in `utils/ssrfProtection.js` and can be applied to routes that make external requests:

```javascript
const { ssrfProtectionMiddleware } = require('./utils/ssrfProtection');

// Apply SSRF protection to routes that make external requests
app.post('/api/fetch-external', ssrfProtectionMiddleware(), async (req, res) => {
  // ...
});
```

## Security Recommendations

1. **Enable HTTPS**: Always use HTTPS in production
2. **Regular updates**: Keep dependencies up to date using the security audit script
3. **Security audits**: Regularly audit the codebase for security vulnerabilities
4. **Monitoring**: Implement monitoring for suspicious activity using the security logging
5. **Backups**: Regularly backup the database and files
6. **Disaster recovery**: Have a disaster recovery plan in place
7. **Security training**: Provide security training for developers
8. **Security testing**: Regularly test the application for security vulnerabilities
9. **Security documentation**: Keep security documentation up to date
10. **Security incident response**: Have a security incident response plan in place
