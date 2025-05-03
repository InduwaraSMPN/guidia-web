/**
 * Script to execute SQL commands for creating security tables
 * 
 * Usage:
 * node scripts/execute-sql.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Execute SQL query via the API
 * @param {string} sql - SQL query to execute
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Object>} - Query result
 */
async function executeQuery(sql, token) {
  try {
    console.log(`${colors.blue}Executing query:${colors.reset}`);
    console.log(sql);
    
    // Execute the query via the API
    const response = await axios.post('http://localhost:3001/api/admin/execute-sql', {
      sql
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`${colors.green}Query executed successfully:${colors.reset}`);
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error(`${colors.red}Error executing query:${colors.reset}`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Login to get JWT token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<string>} - JWT token
 */
async function login(email, password) {
  try {
    console.log(`${colors.blue}Logging in as ${email}...${colors.reset}`);
    
    const response = await axios.post('http://localhost:3001/auth/login', {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`${colors.green}Login successful!${colors.reset}`);
    
    return response.data.token;
  } catch (error) {
    console.error(`${colors.red}Login failed:${colors.reset}`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Execute SQL script
 * @param {string} scriptPath - Path to SQL script
 * @param {string} token - JWT token for authentication
 */
async function executeScript(scriptPath, token) {
  try {
    console.log(`${colors.blue}Reading SQL script from ${scriptPath}...${colors.reset}`);
    
    // Read SQL script
    const sql = fs.readFileSync(scriptPath, 'utf8');
    
    // Split SQL into individual queries
    const queries = sql
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);
    
    console.log(`${colors.blue}Found ${queries.length} queries in the script.${colors.reset}`);
    
    // Execute each query
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`${colors.blue}Executing query ${i + 1} of ${queries.length}...${colors.reset}`);
      
      try {
        await executeQuery(query, token);
      } catch (error) {
        console.error(`${colors.red}Error executing query ${i + 1}:${colors.reset}`, error.message);
        
        // Ask user if they want to continue
        const answer = await new Promise(resolve => {
          rl.question(`${colors.yellow}Continue with the next query? (y/n)${colors.reset} `, resolve);
        });
        
        if (answer.toLowerCase() !== 'y') {
          console.log(`${colors.yellow}Execution aborted.${colors.reset}`);
          break;
        }
      }
    }
    
    console.log(`${colors.green}Script execution completed.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error executing script:${colors.reset}`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(`${colors.bold}${colors.cyan}SQL Script Executor${colors.reset}\n`);
    
    // Get admin credentials
    const email = await new Promise(resolve => {
      rl.question(`${colors.yellow}Enter admin email:${colors.reset} `, resolve);
    });
    
    const password = await new Promise(resolve => {
      rl.question(`${colors.yellow}Enter admin password:${colors.reset} `, resolve);
    });
    
    // Login to get JWT token
    const token = await login(email, password);
    
    // Get script path
    const scriptPath = path.resolve(__dirname, 'create-security-tables.sql');
    
    // Execute script
    await executeScript(scriptPath, token);
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
  } finally {
    // Close readline interface
    rl.close();
  }
}

// Run the main function
main();
