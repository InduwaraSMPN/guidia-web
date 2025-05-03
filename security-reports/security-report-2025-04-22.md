# Guidia Web Security Audit Report

**Date:** 2025-04-22

## Root Project Vulnerabilities

No vulnerabilities found.

## Root Project Outdated Packages

| Package | Current | Latest | Type |
| ------- | ------- | ------ | ---- |
| @azure/storage-blob | 12.26.0 | 12.27.0 | Minor |
| @radix-ui/react-checkbox | 1.1.4 | 1.2.2 | Minor |
| @radix-ui/react-dialog | 1.1.7 | 1.1.10 | Patch |
| @radix-ui/react-label | 2.1.2 | 2.1.4 | Patch |
| @radix-ui/react-popover | 1.1.7 | 1.1.10 | Patch |
| @radix-ui/react-progress | 1.1.3 | 1.1.4 | Patch |
| @radix-ui/react-scroll-area | 1.2.4 | 1.2.5 | Patch |
| @radix-ui/react-select | 2.1.7 | 2.2.2 | Minor |
| @radix-ui/react-separator | 1.1.3 | 1.1.4 | Patch |
| @radix-ui/react-switch | 1.1.4 | 1.2.2 | Minor |
| @radix-ui/react-tabs | 1.1.4 | 1.1.8 | Patch |
| @radix-ui/react-toggle | 1.1.3 | 1.1.6 | Patch |
| @sentry/react | 9.5.0 | 9.13.0 | Minor |
| @sentry/vite-plugin | 3.2.2 | 3.3.1 | Minor |
| @types/node | 22.10.10 | 22.14.1 | Minor |
| @types/react | 18.3.18 | 19.1.2 | Major |
| @types/react-dom | 18.3.5 | 19.1.2 | Major |
| @vitejs/plugin-react | 4.3.4 | 4.4.1 | Minor |
| autoprefixer | 10.4.20 | 10.4.21 | Patch |
| axios | 1.8.3 | 1.8.4 | Patch |
| dompurify | 3.2.4 | 3.2.5 | Patch |
| framer-motion | 10.18.0 | 12.7.4 | Major |
| globals | 15.14.0 | 16.0.0 | Major |
| lucide-react | 0.453.0 | 0.503.0 | Minor |
| react | 18.3.1 | 19.1.0 | Major |
| react-day-picker | 9.6.6 | 9.6.7 | Patch |
| react-dom | 18.3.1 | 19.1.0 | Major |
| react-hook-form | 7.55.0 | 7.56.0 | Minor |
| react-router-dom | 7.1.3 | 7.5.1 | Minor |
| recharts | 2.15.2 | 2.15.3 | Patch |
| sonner | 2.0.1 | 2.0.3 | Patch |
| tailwind-merge | 2.6.0 | 3.2.0 | Major |
| tailwindcss | 3.4.17 | 4.1.4 | Major |
| typescript | 5.7.3 | 5.8.3 | Minor |
| vite | 6.2.6 | 6.3.2 | Minor |
| zod | 3.24.2 | 3.24.3 | Patch |

## Auth Project Vulnerabilities

No vulnerabilities found.

## Auth Project Outdated Packages

| Package | Current | Latest | Type |
| ------- | ------- | ------ | ---- |
| @azure/storage-blob | 12.26.0 | 12.27.0 | Minor |
| express | 4.21.2 | 5.1.0 | Major |
| helmet | 7.2.0 | 8.1.0 | Major |
| jsdom | 24.1.3 | 26.1.0 | Major |
| multer | 1.4.5-lts.1 | 1.4.5-lts.2 | Patch |
| mysql2 | 3.13.0 | 3.14.0 | Minor |
| nodemailer | 6.10.0 | 6.10.1 | Patch |

## Recommendations

1. **Update packages**: Run `npm update` to update packages with minor and patch updates.
2. **Test major updates**: For major updates, install packages individually and test thoroughly.

## Regular Security Tasks

- Run `npm audit` regularly to check for new vulnerabilities.
- Run `npm outdated` regularly to check for outdated packages.
- Update dependencies regularly to stay current with security patches.
- Consider setting up automated dependency scanning in CI/CD pipeline.
