/**
 * Update Database Configuration Script
 * 
 * This script updates the .env file with the correct database configuration
 * for Azure MySQL connections.
 * 
 * Usage:
 * node scripts/update-db-config.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Path to .env file
const envFilePath = path.join(__dirname, '..', '.env');

// Check if .env file exists
if (!fs.existsSync(envFilePath)) {
  console.error('.env file not found at:', envFilePath);
  console.log('Creating a new .env file from .env.example...');
  
  // Try to copy from .env.example
  const exampleEnvPath = path.join(__dirname, '..', '.env.example');
  if (fs.existsSync(exampleEnvPath)) {
    fs.copyFileSync(exampleEnvPath, envFilePath);
    console.log('Created .env file from .env.example');
  } else {
    // Create a minimal .env file
    fs.writeFileSync(envFilePath, '# Database configuration\n');
    console.log('Created a new empty .env file');
  }
}

// Read the current .env file
let envContent = fs.readFileSync(envFilePath, 'utf8');

// Check if DB_SSL is already in the file
if (!envContent.includes('DB_SSL=')) {
  // Add DB_SSL configuration
  console.log('Adding DB_SSL configuration to .env file...');
  
  // Determine if we're connecting to Azure
  const isAzure = process.env.DB_HOST && process.env.DB_HOST.includes('azure');
  
  // Add the configuration
  envContent += `\n# SSL configuration for database connection\n`;
  envContent += `DB_SSL=${isAzure ? 'true' : 'false'}\n`;
  
  // Write the updated content back to the file
  fs.writeFileSync(envFilePath, envContent);
  console.log(`Updated .env file with DB_SSL=${isAzure ? 'true' : 'false'}`);
} else {
  console.log('DB_SSL configuration already exists in .env file');
  
  // Check if we need to update the value
  const currentValue = process.env.DB_SSL;
  const isAzure = process.env.DB_HOST && process.env.DB_HOST.includes('azure');
  const recommendedValue = isAzure ? 'true' : 'false';
  
  if (currentValue !== recommendedValue) {
    console.log(`Current DB_SSL value is ${currentValue}, but recommended value is ${recommendedValue}`);
    console.log(`Consider updating DB_SSL to ${recommendedValue} for ${isAzure ? 'Azure MySQL' : 'local MySQL'} connections`);
  } else {
    console.log(`DB_SSL is correctly set to ${currentValue}`);
  }
}

// Check database connection parameters
console.log('\nCurrent database connection parameters:');
console.log(`DB_HOST: ${process.env.DB_HOST || 'not set'}`);
console.log(`DB_USER: ${process.env.DB_USER || 'not set'}`);
console.log(`DB_NAME: ${process.env.DB_NAME || 'not set'}`);
console.log(`DB_SSL: ${process.env.DB_SSL || 'not set'}`);

// Provide recommendations
console.log('\nRecommendations:');
if (!process.env.DB_HOST) {
  console.log('- Set DB_HOST to your database server address');
}
if (!process.env.DB_USER) {
  console.log('- Set DB_USER to your database username');
}
if (!process.env.DB_PASSWORD) {
  console.log('- Set DB_PASSWORD to your database password');
}
if (!process.env.DB_NAME) {
  console.log('- Set DB_NAME to your database name');
}

// Azure-specific recommendations
if (process.env.DB_HOST && process.env.DB_HOST.includes('azure')) {
  console.log('\nAzure MySQL specific recommendations:');
  console.log('- Ensure DB_SSL is set to "true" for Azure MySQL connections');
  console.log('- For Azure MySQL, the username should include the server name, e.g., "username@servername"');
  console.log('- Check that your IP address is allowed in the Azure MySQL firewall rules');
}

console.log('\nConfiguration update completed');
