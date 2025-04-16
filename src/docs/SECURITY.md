# Security Documentation

This document provides an overview of the security measures implemented in the Guidia Web application.

## Authentication

The authentication system is based on JSON Web Tokens (JWT) and provides:

1. **Token-based authentication**: Using JWT for stateless authentication
2. **Token refresh**: Automatic refresh of expired tokens
3. **Role-based access control**: Different middleware for different user roles
4. **Database validation**: Verification that users exist in the database

See [AUTHENTICATION.md](./AUTHENTICATION.md) for more details.

## Rate Limiting

Rate limiting is implemented to prevent brute force attacks and abuse:

1. **Authentication endpoints**: Limited to 10 requests per 15 minutes per IP
2. **Registration endpoints**: Limited to 5 requests per hour per IP
3. **Password reset**: Limited to 3 requests per hour per IP
4. **General API**: Limited to 100 requests per 15 minutes per IP

Rate limiting is implemented using the `express-rate-limit` package.

## CSRF Protection

Cross-Site Request Forgery (CSRF) protection is implemented for sensitive operations:

1. **Token generation**: CSRF tokens are generated for authenticated users
2. **Token verification**: CSRF tokens are verified for mutating operations (POST, PUT, DELETE)
3. **Token expiration**: CSRF tokens expire after 1 hour

CSRF protection is implemented using a custom middleware.

### Protected Endpoints

The following endpoints are protected with CSRF:

- `POST /api/users/change-password` - Change user password
- `PUT /api/users/profile` - Update user profile

### How CSRF Protection Works

1. When a user logs in, a CSRF token is generated and returned in the `X-CSRF-Token` response header
2. The frontend stores this token in localStorage
3. For sensitive operations, the frontend includes the token in the `X-CSRF-Token` request header
4. The server verifies that the token is valid and belongs to the authenticated user
5. If the token is invalid or missing, the request is rejected with a 403 Forbidden response

## Best Practices

The following security best practices are implemented:

1. **Input validation**: All user input is validated before processing
2. **Parameterized queries**: SQL queries use parameterized statements to prevent SQL injection
3. **Error handling**: Errors are handled properly without leaking sensitive information
4. **HTTPS**: All communication should be over HTTPS in production
5. **Password hashing**: Passwords are hashed using bcrypt
6. **Logging**: Security events are logged for auditing purposes

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

To use CSRF protection in the frontend:

1. Get the CSRF token from the response headers after authentication
2. Include the token in the `X-CSRF-Token` header for mutating requests

```javascript
// Get the CSRF token
const csrfToken = response.headers.get('X-CSRF-Token');

// Include the token in subsequent requests
fetch('/api/users/change-password', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ newPassword: 'password123' })
});
```

## Security Recommendations

1. **Enable HTTPS**: Always use HTTPS in production
2. **Regular updates**: Keep dependencies up to date
3. **Security audits**: Regularly audit the codebase for security vulnerabilities
4. **Monitoring**: Implement monitoring for suspicious activity
5. **Backups**: Regularly backup the database
6. **Disaster recovery**: Have a disaster recovery plan in place
