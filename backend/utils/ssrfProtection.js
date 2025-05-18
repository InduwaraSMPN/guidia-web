/**
 * SSRF Protection utilities for Guidia Web
 * Provides functions to prevent Server-Side Request Forgery attacks
 */
const url = require('url');
const dns = require('dns');
const net = require('net');
const ipaddr = require('ipaddr.js');

/**
 * Check if a URL is allowed based on hostname and IP address
 * @param {string} urlString - URL to check
 * @param {Object} options - Options for validation
 * @returns {Promise<Object>} - Validation result
 */
async function validateUrl(urlString, options = {}) {
  const {
    allowedHosts = [],
    allowedDomains = [],
    blockedIps = [],
    allowPrivateIps = false,
    allowLocalhost = false,
    allowOnlyHttps = true,
    timeout = 5000 // 5 seconds timeout for DNS resolution
  } = options;
  
  const result = {
    isValid: false,
    url: urlString,
    reason: null
  };
  
  try {
    // Parse the URL
    const parsedUrl = new URL(urlString);
    
    // Check protocol
    if (allowOnlyHttps && parsedUrl.protocol !== 'https:') {
      result.reason = 'Only HTTPS URLs are allowed';
      return result;
    }
    
    // Get hostname
    const hostname = parsedUrl.hostname;
    
    // Check if hostname is in allowed hosts
    if (allowedHosts.length > 0 && !allowedHosts.includes(hostname)) {
      // Check if hostname is a subdomain of an allowed domain
      const isSubdomainAllowed = allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );
      
      if (!isSubdomainAllowed) {
        result.reason = `Hostname ${hostname} is not in the allowed hosts list`;
        return result;
      }
    }
    
    // Check if hostname is localhost
    if (!allowLocalhost && (
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname === '::1' ||
      hostname.startsWith('127.') ||
      hostname === '[::1]'
    )) {
      result.reason = 'Localhost URLs are not allowed';
      return result;
    }
    
    // Resolve hostname to IP addresses
    const ips = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`DNS resolution timeout for ${hostname}`));
      }, timeout);
      
      dns.resolve(hostname, (err, addresses) => {
        clearTimeout(timeoutId);
        if (err) {
          reject(err);
        } else {
          resolve(addresses);
        }
      });
    });
    
    // Check each IP address
    for (const ip of ips) {
      // Check if IP is in blocked list
      if (blockedIps.includes(ip)) {
        result.reason = `IP address ${ip} is blocked`;
        return result;
      }
      
      // Check if IP is private
      if (!allowPrivateIps) {
        const parsedIp = ipaddr.parse(ip);
        if (parsedIp.range() !== 'unicast') {
          result.reason = `Private IP addresses are not allowed: ${ip}`;
          return result;
        }
      }
    }
    
    // URL is valid
    result.isValid = true;
    return result;
  } catch (error) {
    result.reason = `URL validation error: ${error.message}`;
    return result;
  }
}

/**
 * Create a middleware to protect against SSRF attacks
 * @param {Object} options - Options for validation
 * @returns {Function} - Express middleware
 */
function ssrfProtectionMiddleware(options = {}) {
  return async (req, res, next) => {
    try {
      // Get URL from request
      const urlParam = req.body.url || req.query.url;
      
      // Skip if no URL is provided
      if (!urlParam) {
        return next();
      }
      
      // Validate URL
      const validationResult = await validateUrl(urlParam, options);
      
      // If URL is not valid, return error
      if (!validationResult.isValid) {
        return res.status(400).json({
          error: 'Invalid URL',
          message: validationResult.reason
        });
      }
      
      // URL is valid, continue
      next();
    } catch (error) {
      console.error('SSRF protection error:', error);
      res.status(500).json({
        error: 'Server error',
        message: 'Failed to validate URL'
      });
    }
  };
}

/**
 * Create a safe HTTP client that protects against SSRF attacks
 * @param {Object} options - Options for validation
 * @returns {Function} - Safe HTTP client function
 */
function createSafeHttpClient(options = {}) {
  const axios = require('axios');
  
  return async function safeHttpRequest(urlString, requestOptions = {}) {
    // Validate URL
    const validationResult = await validateUrl(urlString, options);
    
    // If URL is not valid, throw error
    if (!validationResult.isValid) {
      throw new Error(`SSRF protection: ${validationResult.reason}`);
    }
    
    // URL is valid, make request
    return axios({
      url: urlString,
      ...requestOptions,
      // Set timeout to prevent long-running requests
      timeout: requestOptions.timeout || 10000
    });
  };
}

module.exports = {
  validateUrl,
  ssrfProtectionMiddleware,
  createSafeHttpClient
};
