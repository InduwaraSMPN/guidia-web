/**
 * Input validation utilities for Guidia Web
 * Provides functions to validate and sanitize user input
 */
const validator = require('validator');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create a DOMPurify instance
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - HTML content to sanitize
 * @param {Object} options - DOMPurify options
 * @returns {string} - Sanitized HTML
 */
function sanitizeHtml(html, options = {}) {
  // Default options for sanitization
  const defaultOptions = {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      'strong', 'em', 'b', 'i', 'u', 's', 'strike',
      'blockquote', 'code', 'pre',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'class', 'id', 'style',
      'width', 'height',
      'colspan', 'rowspan'
    ],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: true }
  };
  
  // Merge default options with user-provided options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Sanitize the HTML
  return purify.sanitize(html || '', mergedOptions);
}

/**
 * Validate and sanitize an email address
 * @param {string} email - Email address to validate
 * @returns {Object} - Validation result with isValid and sanitized value
 */
function validateEmail(email) {
  if (!email) {
    return { isValid: false, value: '', error: 'Email is required' };
  }
  
  const sanitized = validator.trim(email);
  const isValid = validator.isEmail(sanitized);
  
  return {
    isValid,
    value: sanitized,
    error: isValid ? null : 'Invalid email format'
  };
}

/**
 * Validate and sanitize a username
 * @param {string} username - Username to validate
 * @returns {Object} - Validation result with isValid and sanitized value
 */
function validateUsername(username) {
  if (!username) {
    return { isValid: false, value: '', error: 'Username is required' };
  }
  
  const sanitized = validator.trim(username);
  
  // Username should be 3-30 characters and contain only alphanumeric characters, underscores, and hyphens
  const isValid = validator.isLength(sanitized, { min: 3, max: 30 }) &&
                 validator.matches(sanitized, /^[a-zA-Z0-9_-]+$/);
  
  return {
    isValid,
    value: sanitized,
    error: isValid ? null : 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'
  };
}

/**
 * Validate and sanitize a phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} - Validation result with isValid and sanitized value
 */
function validatePhone(phone) {
  if (!phone) {
    return { isValid: false, value: '', error: 'Phone number is required' };
  }
  
  // Remove all non-numeric characters except +
  const sanitized = phone.replace(/[^\d+]/g, '');
  
  // Basic phone validation (allows international format with +)
  const isValid = /^\+?\d{8,15}$/.test(sanitized);
  
  return {
    isValid,
    value: sanitized,
    error: isValid ? null : 'Invalid phone number format'
  };
}

/**
 * Validate and sanitize a URL
 * @param {string} url - URL to validate
 * @returns {Object} - Validation result with isValid and sanitized value
 */
function validateUrl(url) {
  if (!url) {
    return { isValid: false, value: '', error: 'URL is required' };
  }
  
  const sanitized = validator.trim(url);
  const isValid = validator.isURL(sanitized, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
  
  return {
    isValid,
    value: sanitized,
    error: isValid ? null : 'Invalid URL format (must include http:// or https://)'
  };
}

/**
 * Validate and sanitize a date string
 * @param {string} date - Date string to validate (YYYY-MM-DD)
 * @returns {Object} - Validation result with isValid and sanitized value
 */
function validateDate(date) {
  if (!date) {
    return { isValid: false, value: '', error: 'Date is required' };
  }
  
  const sanitized = validator.trim(date);
  const isValid = validator.isDate(sanitized, { format: 'YYYY-MM-DD' });
  
  return {
    isValid,
    value: sanitized,
    error: isValid ? null : 'Invalid date format (must be YYYY-MM-DD)'
  };
}

/**
 * Sanitize a string for use in SQL queries
 * Note: This is a backup; always use parameterized queries
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeForSql(str) {
  if (!str) return '';
  
  // Remove SQL injection characters
  return String(str)
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

/**
 * Validate and sanitize a general text input
 * @param {string} text - Text to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result with isValid and sanitized value
 */
function validateText(text, options = {}) {
  const { required = true, minLength = 1, maxLength = 255 } = options;
  
  if (!text && required) {
    return { isValid: false, value: '', error: 'Text is required' };
  }
  
  if (!text && !required) {
    return { isValid: true, value: '', error: null };
  }
  
  const sanitized = validator.trim(text);
  
  if (sanitized.length < minLength) {
    return { 
      isValid: false, 
      value: sanitized, 
      error: `Text must be at least ${minLength} character${minLength === 1 ? '' : 's'} long` 
    };
  }
  
  if (sanitized.length > maxLength) {
    return { 
      isValid: false, 
      value: sanitized.substring(0, maxLength), 
      error: `Text must be no more than ${maxLength} characters long` 
    };
  }
  
  return {
    isValid: true,
    value: sanitized,
    error: null
  };
}

/**
 * Validate and sanitize a numeric input
 * @param {string|number} num - Number to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result with isValid and sanitized value
 */
function validateNumber(num, options = {}) {
  const { required = true, min, max, integer = false } = options;
  
  if ((num === undefined || num === null || num === '') && required) {
    return { isValid: false, value: '', error: 'Number is required' };
  }
  
  if ((num === undefined || num === null || num === '') && !required) {
    return { isValid: true, value: null, error: null };
  }
  
  // Convert to string first to handle both string and number inputs
  const numStr = String(num).trim();
  
  // Check if it's a valid number
  if (!validator.isNumeric(numStr) && !(numStr.includes('.') && validator.isFloat(numStr))) {
    return { isValid: false, value: numStr, error: 'Invalid number format' };
  }
  
  // Convert to number for further validation
  const numValue = integer ? parseInt(numStr, 10) : parseFloat(numStr);
  
  // Check min value if specified
  if (min !== undefined && numValue < min) {
    return { 
      isValid: false, 
      value: numValue, 
      error: `Number must be at least ${min}` 
    };
  }
  
  // Check max value if specified
  if (max !== undefined && numValue > max) {
    return { 
      isValid: false, 
      value: numValue, 
      error: `Number must be no more than ${max}` 
    };
  }
  
  return {
    isValid: true,
    value: numValue,
    error: null
  };
}

/**
 * Validate request parameters against a schema
 * @param {Object} data - Request data (body, query, params)
 * @param {Object} schema - Validation schema
 * @returns {Object} - Validation result with isValid, sanitized values, and errors
 */
function validateRequest(data, schema) {
  const result = {
    isValid: true,
    sanitized: {},
    errors: {}
  };
  
  // Process each field in the schema
  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    let fieldResult;
    
    // Apply the appropriate validation based on the field type
    switch (rules.type) {
      case 'email':
        fieldResult = validateEmail(value);
        break;
      case 'username':
        fieldResult = validateUsername(value);
        break;
      case 'phone':
        fieldResult = validatePhone(value);
        break;
      case 'url':
        fieldResult = validateUrl(value);
        break;
      case 'date':
        fieldResult = validateDate(value);
        break;
      case 'number':
        fieldResult = validateNumber(value, rules.options);
        break;
      case 'html':
        fieldResult = {
          isValid: true,
          value: sanitizeHtml(value, rules.options),
          error: null
        };
        break;
      case 'text':
      default:
        fieldResult = validateText(value, rules.options);
        break;
    }
    
    // Add the sanitized value to the result
    result.sanitized[field] = fieldResult.value;
    
    // If the field is invalid, add the error and update the overall validity
    if (!fieldResult.isValid) {
      result.isValid = false;
      result.errors[field] = fieldResult.error;
    }
  });
  
  return result;
}

module.exports = {
  sanitizeHtml,
  validateEmail,
  validateUsername,
  validatePhone,
  validateUrl,
  validateDate,
  sanitizeForSql,
  validateText,
  validateNumber,
  validateRequest
};
