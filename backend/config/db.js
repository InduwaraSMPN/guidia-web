const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Add SSL configuration if needed for Azure MySQL
if (process.env.DB_SSL === 'true') {
  console.log('Using SSL for database connection');
  dbConfig.ssl = {
    // Azure MySQL requires SSL
    rejectUnauthorized: true
  };
} else if (process.env.DB_HOST && process.env.DB_HOST.includes('azure')) {
  // If connecting to Azure but SSL not explicitly set, enable it by default
  console.log('Azure MySQL detected, enabling SSL by default');
  dbConfig.ssl = {
    rejectUnauthorized: true
  };
}

// Log connection details (without sensitive info)
console.log('Database connection details:');
console.log(`Host: ${dbConfig.host}`);
console.log(`Database: ${dbConfig.database}`);
console.log(`SSL enabled: ${!!dbConfig.ssl}`);

// Create a database connection pool
const pool = mysql.createPool(dbConfig);

// Export the pool for use in other modules
module.exports = pool;
