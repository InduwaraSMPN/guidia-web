# Third-Party Components

This document tracks the third-party components used in the Guidia web application, their versions, and security status.

## Frontend Dependencies

| Package | Version | Purpose | Security Notes |
|---------|---------|---------|---------------|
| React | 18.x | UI library | Keep updated with security patches |
| TypeScript | 5.x | Type checking | Keep updated with security patches |
| Vite | 6.x | Build tool | Keep updated with security patches |
| React Router | 7.x | Routing | Keep updated with security patches |
| Tailwind CSS | 3.x | Styling | Keep updated with security patches |
| shadcn/ui | latest | UI components | Keep updated with security patches |
| React Context API | built-in | State management | N/A |
| React Hook Form | latest | Form handling | Keep updated with security patches |
| Zod | latest | Schema validation | Keep updated with security patches |
| Radix UI | latest | Accessible components | Keep updated with security patches |
| Framer Motion | latest | Animations | Keep updated with security patches |
| Axios | latest | HTTP client | Keep updated with security patches |
| Sonner | latest | Toast notifications | Keep updated with security patches |
| Socket.IO client | latest | Real-time communication | Keep updated with security patches |
| React PDF | latest | PDF rendering | Keep updated with security patches |
| Quill | latest | Rich text editor | Keep updated with security patches |
| React Markdown | latest | Markdown rendering | Keep updated with security patches |

## Backend Dependencies

| Package | Version | Purpose | Security Notes |
|---------|---------|---------|---------------|
| Express.js | 4.x | Web framework | Keep updated with security patches |
| MySQL2 | latest | Database driver | Keep updated with security patches |
| JWT | latest | Authentication | Keep updated with security patches |
| bcrypt | latest | Password hashing | Keep updated with security patches |
| Azure Blob Storage | latest | File storage | Keep updated with security patches |
| Nodemailer | latest | Email sending | Keep updated with security patches |
| Socket.IO server | latest | Real-time communication | Keep updated with security patches |
| Express Rate Limit | latest | Rate limiting | Keep updated with security patches |
| CORS | latest | Cross-origin resource sharing | Keep updated with security patches |
| OpenAI SDK | latest | AI integration | Keep updated with security patches |
| Firebase Admin | latest | Real-time database | Keep updated with security patches |
| Helmet | latest | Security headers | Keep updated with security patches |
| DOMPurify | latest | HTML sanitization | Keep updated with security patches |
| validator | latest | Input validation | Keep updated with security patches |
| xss | latest | XSS protection | Keep updated with security patches |

## External Services

| Service | Purpose | Security Notes |
|---------|---------|---------------|
| Firebase Realtime Database | Real-time messaging | Ensure proper authentication and authorization |
| Azure Blob Storage | Document and image storage | Use SAS tokens with appropriate permissions and expiry |
| SambaNova AI | AI provider | Secure API key storage, validate inputs and outputs |
| DeepSeek AI | AI provider | Secure API key storage, validate inputs and outputs |

## Security Monitoring

Regular security audits are performed using:

1. `npm audit` - To check for known vulnerabilities in dependencies
2. `npm outdated` - To check for outdated packages
3. Custom security audit script - To generate comprehensive security reports

## Update Process

1. **Regular Updates**: Dependencies are updated monthly for minor and patch versions
2. **Major Updates**: Major version updates are evaluated individually for breaking changes and security improvements
3. **Security Patches**: Critical security patches are applied immediately
4. **Compatibility Testing**: All updates are tested in a development environment before deployment

## Vulnerability Management

1. **Monitoring**: Dependencies are monitored for security vulnerabilities using GitHub security alerts and npm audit
2. **Assessment**: Vulnerabilities are assessed for impact and exploitability
3. **Remediation**: Vulnerabilities are remediated based on severity and impact
4. **Documentation**: All vulnerabilities and remediation actions are documented

## Last Audit

**Date**: [Insert Date]

**Status**: [Insert Status]

**Actions Taken**: [Insert Actions]
