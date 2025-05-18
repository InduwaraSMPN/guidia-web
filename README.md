# Guidia Web Application

This project has been restructured into a frontend and backend architecture.

## Project Structure

- `/frontend` - Contains the React frontend application
- `/backend` - Contains the Express.js backend application

## Getting Started

### Installation

To install all dependencies:

```bash
npm run install:all
```

Or install separately:

```bash
# Install frontend dependencies
npm run install:frontend

# Install backend dependencies
npm run install:backend
```

### Development

To run both frontend and backend in development mode:

```bash
npm run dev
```

Or run separately:

```bash
# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend
```

### Building

To build both frontend and backend:

```bash
npm run build
```

Or build separately:

```bash
# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend
```

## Configuration

- Frontend configuration is in the `/frontend` directory
- Backend configuration is in the `/backend` directory

Each directory contains its own package.json file with specific dependencies and scripts.