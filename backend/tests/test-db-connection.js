/**
 * Test script for database connection
 * 
 * This script tests the connection to the MySQL database
 * 
 * Usage:
 * node tests/test-db-connection.js
 */

const pool = require('../config/db');

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  console.log('==============================');
  
  try {
    // Get a connection from the pool
    console.log('Attempting to get a connection from the pool...');
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database!');
    
    // Test a simple query
    console.log('\nTesting a simple query...');
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Query result:', rows[0].result);
    
    // Release the connection
    connection.release();
    console.log('Connection released');
    
    // Test database information
    console.log('\nGetting database information...');
    const [dbInfo] = await pool.query('SELECT VERSION() AS version, DATABASE() AS database_name');
    console.log('Database version:', dbInfo[0].version);
    console.log('Database name:', dbInfo[0].database_name);
    
    // List tables
    console.log('\nListing tables in the database...');
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables in the database:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });
    
    console.log('\nDatabase connection test completed successfully!');
  } catch (error) {
    console.error('Error connecting to the database:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\nThe connection was refused. Possible reasons:');
      console.error('1. The database server is not running');
      console.error('2. The host or port is incorrect');
      console.error('3. A firewall is blocking the connection');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nAccess denied. Possible reasons:');
      console.error('1. The username is incorrect');
      console.error('2. The password is incorrect');
      console.error('3. The user does not have permission to access the database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\nDatabase not found. Possible reasons:');
      console.error('1. The database name is incorrect');
      console.error('2. The database has not been created');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\nConnection timed out. Possible reasons:');
      console.error('1. The database server is not reachable');
      console.error('2. Network issues are preventing the connection');
    } else if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      console.error('\nSSL certificate error. Possible reasons:');
      console.error('1. The SSL certificate is invalid or expired');
      console.error('2. SSL configuration is incorrect');
      console.error('Try setting DB_SSL=false in your .env file if SSL is not required');
    }
    
    console.error('\nCheck your .env file for correct database configuration:');
    console.error('DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL');
  } finally {
    // Close the pool
    try {
      await pool.end();
      console.log('Connection pool closed');
    } catch (error) {
      console.error('Error closing connection pool:', error.message);
    }
  }
}

// Run the test
testDatabaseConnection();
