# Guidia Web Application Threat Model

## Overview

This document outlines the threat model for the Guidia web application, a comprehensive career guidance platform connecting students, counselors, and companies. The threat model identifies potential security risks, their impact, and mitigation strategies.

## System Architecture

Guidia is a web application with the following components:

- **Frontend**: React-based SPA with TypeScript
- **Backend**: Node.js/Express.js REST API server
- **Database**: MySQL for structured data
- **Real-time**: Firebase Realtime Database for messaging, Socket.IO for notifications
- **Storage**: Azure Blob Storage for documents and images
- **AI**: Integration with SambaNova and DeepSeek AI providers

## Trust Boundaries

1. **User Browser ↔ Frontend**: Communication over HTTPS
2. **Frontend ↔ Backend API**: REST API calls over HTTPS with JWT authentication
3. **Backend ↔ Database**: Internal connection with parameterized queries
4. **Backend ↔ Firebase**: Server-to-server communication with Firebase Admin SDK
5. **Backend ↔ Azure Storage**: Server-to-server communication with Azure SDK
6. **Backend ↔ AI Providers**: Server-to-server API calls with API keys

## User Roles and Permissions

1. **Admin**: Full system access, user management, content moderation
2. **Student**: Profile management, job applications, messaging, meeting scheduling
3. **Counselor**: Profile management, student guidance, messaging, meeting scheduling
4. **Company**: Profile management, job posting, application review, messaging, meeting scheduling

## Threat Actors

1. **Malicious Users**: Authenticated users attempting to access unauthorized resources
2. **External Attackers**: Unauthenticated attackers attempting to exploit vulnerabilities
3. **Insider Threats**: Staff or privileged users misusing their access
4. **Automated Bots**: Automated scripts attempting to scrape data or perform brute force attacks

## Potential Threats and Mitigations

### 1. Authentication and Authorization

**Threats**:
- Brute force attacks on login
- Session hijacking
- Privilege escalation
- JWT token theft or forgery

**Mitigations**:
- Rate limiting on authentication endpoints
- Secure JWT implementation with proper expiration
- Role-based access control (RBAC)
- Resource-based access control
- CSRF protection
- HTTP-only, secure cookies
- Strong password policies

### 2. Data Protection

**Threats**:
- Sensitive data exposure
- Data leakage through APIs
- Insecure storage of credentials
- Unencrypted data at rest

**Mitigations**:
- Encryption of sensitive data at rest
- Proper data sanitization in responses
- Secure credential storage with bcrypt
- Proper access controls on all data endpoints
- Data minimization in API responses

### 3. Injection Attacks

**Threats**:
- SQL injection
- NoSQL injection (Firebase)
- Cross-site scripting (XSS)
- Command injection

**Mitigations**:
- Parameterized SQL queries
- Input validation and sanitization
- Content Security Policy (CSP)
- HTML sanitization for rich text
- Secure coding practices

### 4. External Service Integration

**Threats**:
- API key exposure
- Insecure file uploads
- Server-side request forgery (SSRF)
- Dependency vulnerabilities

**Mitigations**:
- Secure storage of API keys in environment variables
- File type validation and scanning
- Allowlisting for external requests
- Regular dependency updates and audits

### 5. Real-time Communication

**Threats**:
- Unauthorized socket connections
- Message interception
- Denial of service on WebSockets

**Mitigations**:
- Socket authentication middleware
- Rate limiting on socket connections
- Proper validation of socket messages
- Secure WebSocket configuration

## Security Controls

### Preventive Controls

1. **Input Validation**: All user inputs are validated and sanitized
2. **Authentication**: JWT-based authentication with proper expiration
3. **Authorization**: Role-based and resource-based access control
4. **Encryption**: Sensitive data encrypted at rest and in transit
5. **Rate Limiting**: Protection against brute force and DoS attacks
6. **Content Security Policy**: Protection against XSS attacks

### Detective Controls

1. **Logging**: Comprehensive logging of security events
2. **Monitoring**: Real-time monitoring of suspicious activities
3. **Auditing**: Regular security audits and code reviews

### Responsive Controls

1. **Error Handling**: Secure error handling without information leakage
2. **Incident Response**: Documented procedures for security incidents
3. **Backup and Recovery**: Regular data backups and recovery procedures

## Secure Development Practices

1. **Security Requirements**: Security requirements defined early in development
2. **Secure Coding**: Adherence to secure coding guidelines
3. **Security Testing**: Regular security testing including SAST, DAST, and penetration testing
4. **Security Training**: Regular security training for developers

## Conclusion

This threat model provides a foundation for securing the Guidia web application. It should be regularly reviewed and updated as the application evolves. All identified threats should be addressed with appropriate mitigations, and new threats should be incorporated as they are discovered.

## References

1. OWASP Top Ten: https://owasp.org/www-project-top-ten/
2. OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
3. NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
