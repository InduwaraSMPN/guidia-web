# Authentication System Documentation

This document provides an overview of the authentication system used in the Guidia Web application.

## Overview

The authentication system is based on JSON Web Tokens (JWT) and provides a standardized way to:

1. Verify user identity
2. Check user roles and permissions
3. Protect routes and resources
4. Authenticate WebSocket connections

## Authentication Middleware

All authentication middleware is centralized in `middleware/auth.js` for consistency and maintainability.

### Available Middleware

| Middleware | Description |
|------------|-------------|
| `verifyToken` | Verifies JWT token and adds user info to `req.user` |
| `verifyAdmin` | Ensures user has admin role (roleID = 1) |
| `verifyCompany` | Ensures user has company role (roleID = 3) |
| `verifyStudent` | Ensures user has student role (roleID = 2) |
| `verifyCounselor` | Ensures user has counselor role (roleID = 4) |
| `verifyOwnership` | Ensures user owns the requested resource |
| `socketAuth` | Authentication middleware for Socket.io connections |

### Programmatic Functions

| Function | Description |
|----------|-------------|
| `verifyTokenProgrammatically` | Verifies a token and returns user data (not middleware) |

## Usage Examples

### Protecting a Route

```javascript
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Protected route - requires authentication
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});
```

### Role-Based Access Control

```javascript
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Admin-only route
router.get('/admin/dashboard', verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

// Company-only route
router.get('/company/jobs', verifyToken, verifyCompany, (req, res) => {
  res.json({ message: 'Company jobs' });
});
```

### Resource Ownership

```javascript
const { verifyToken, verifyOwnership } = require('../middleware/auth');

// User can only access their own profile
router.get('/users/:userId/profile', verifyToken, verifyOwnership, (req, res) => {
  res.json({ message: 'User profile', userId: req.params.userId });
});
```

### Socket.io Authentication

Socket.io authentication is handled automatically by the `socketAuth` middleware:

```javascript
const { socketAuth } = require('./middleware/auth');

// Apply authentication middleware to Socket.io
io.use(socketAuth);

// Access authenticated user in socket handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  // ...
});
```

## Error Handling

The authentication middleware provides standardized error responses:

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 401 | Authentication required | No token provided |
| 401 | Authentication failed | Invalid token or user not found |
| 401 | Authentication expired | Token has expired |
| 403 | Access denied | User doesn't have required role |
| 400 | Bad request | Missing resource ID for ownership check |

## Security Considerations

1. **Token Storage**: Store tokens securely in HttpOnly cookies or localStorage (with proper security measures)
2. **Token Expiration**: Set appropriate expiration times for tokens
3. **HTTPS**: Always use HTTPS in production to protect tokens in transit
4. **Sensitive Routes**: Apply multiple middleware for sensitive operations (e.g., `verifyToken` + `verifyAdmin`)
5. **Error Messages**: Use generic error messages to avoid information leakage

## Best Practices

1. **Always use verifyToken first**: Role-based middleware depends on `req.user` being set
2. **Check database connection**: The middleware handles cases where the database connection fails
3. **Handle errors properly**: Catch errors from authentication middleware in your route handlers
4. **Use appropriate status codes**: Follow HTTP standards for authentication errors
5. **Document protected routes**: Make it clear which routes require authentication
