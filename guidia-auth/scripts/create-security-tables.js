/**
 * Script to create security tables in the database
 * 
 * Usage:
 * node scripts/create-security-tables.js
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ANSI color codes for output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

/**
 * Create a database connection
 * @returns {Promise<mysql.Connection>} - Database connection
 */
async function createConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_NAME || 'guidia-web-db',
      ssl: process.env.DB_SSL === 'true' ? true : undefined
    });
    
    console.log(`${colors.green}Connected to database${colors.reset}`);
    return connection;
  } catch (error) {
    console.error(`${colors.red}Error connecting to database:${colors.reset}`, error);
    throw error;
  }
}

/**
 * Execute SQL queries
 * @param {mysql.Connection} connection - Database connection
 * @param {string} sql - SQL queries to execute
 * @returns {Promise<void>}
 */
async function executeQueries(connection, sql) {
  try {
    // Split SQL into individual queries
    const queries = sql
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);
    
    // Execute each query
    for (const query of queries) {
      console.log(`${colors.blue}Executing query:${colors.reset}`);
      console.log(query);
      
      await connection.query(query);
      console.log(`${colors.green}Query executed successfully${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error executing queries:${colors.reset}`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  let connection;
  
  try {
    console.log(`${colors.bold}${colors.cyan}Creating Security Tables${colors.reset}\n`);
    
    // Create database connection
    connection = await createConnection();
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'sql', 'security_audit_log.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute queries
    await executeQueries(connection, sql);
    
    console.log(`\n${colors.bold}${colors.green}Security tables created successfully!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
      console.log(`${colors.blue}Database connection closed${colors.reset}`);
    }
  }
}

// Run the main function
main();
