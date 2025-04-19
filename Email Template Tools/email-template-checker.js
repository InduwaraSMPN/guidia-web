/**
 * Email Template Checker
 *
 * This script checks all email templates in the guidia-auth/email-templates directory
 * for common issues and consistency.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const chalk = require('chalk');
const fetch = require('node-fetch');

// Directory containing email templates
const TEMPLATES_DIR = path.join(__dirname, '..', 'guidia-auth', 'email-templates');

// Common variables that should be properly interpolated
const COMMON_VARIABLES = [
  '${email}',
  '${otp}',
  '${new Date().getFullYear()}',
  '${recipientEmail}',
  '${formattedDate}',
  '${formattedTime}',
  '${requestorName}',
  '${meetingTitle}',
  '${meetingDescription}',
  '${process.env.FRONTEND_URL}',
  '${resetUrl}',
  '${loginUrl}',
  '${userType}',
  '${acceptorName}',
  '${cancellerName}'
];

// Required fields in email template objects
const REQUIRED_FIELDS = ['from', 'to', 'subject', 'html'];

// Common image URLs to validate
const COMMON_IMAGES = [
  'https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg'
];

// Check if a URL is valid and accessible
async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Check if HTML has proper structure
function validateHtmlStructure(html) {
  const issues = [];

  if (!html.includes('<!DOCTYPE html>')) {
    issues.push('Missing DOCTYPE declaration');
  }

  if (!html.includes('<html')) {
    issues.push('Missing <html> tag');
  }

  if (!html.includes('<head>')) {
    issues.push('Missing <head> tag');
  }

  if (!html.includes('<meta charset')) {
    issues.push('Missing charset meta tag');
  }

  if (!html.includes('<meta name="viewport"')) {
    issues.push('Missing viewport meta tag');
  }

  if (!html.includes('<body')) {
    issues.push('Missing <body> tag');
  }

  return issues;
}

// Check for accessibility issues
function checkAccessibility(dom) {
  const issues = [];

  // Check for images without alt text
  const images = dom.window.document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === '') {
      issues.push(`Image missing alt text: ${img.outerHTML.substring(0, 100)}...`);
    }
  });

  // Check for links without text
  const links = dom.window.document.querySelectorAll('a');
  links.forEach(link => {
    if (link.textContent.trim() === '' && !link.querySelector('img')) {
      issues.push(`Link without text content: ${link.outerHTML.substring(0, 100)}...`);
    }
  });

  return issues;
}

// Check for variable interpolation issues
function checkVariableInterpolation(html, templateName) {
  const issues = [];

  // Check for potentially broken variable interpolation
  const suspiciousPatterns = [
    /\${[^}]*[^}]$/gm,  // Unclosed ${
    /\$\{[^}]*\s+[^}]*\}/g,  // Variables with spaces
    /\$\{[^a-zA-Z0-9_.()[\]]+\}/g  // Variables with unusual characters
  ];

  suspiciousPatterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.push(`Suspicious variable interpolation: ${match}`);
      });
    }
  });

  // Check for common variables that might be used in this template
  COMMON_VARIABLES.forEach(variable => {
    // Extract the variable name without the ${} syntax
    const varName = variable.replace(/\${|}|\(\)/g, '').trim();

    // If the variable name appears in the template content but not in the proper ${} syntax
    if (html.includes(varName) && !html.includes(variable) && !varName.includes('new Date')) {
      issues.push(`Variable '${varName}' might be missing proper interpolation syntax`);
    }
  });

  return issues;
}

// Check for consistent styling
function checkConsistentStyling(html) {
  const issues = [];

  // Check for brand color
  if (!html.includes('#800020')) {
    issues.push('Brand color #800020 not found in template');
  }

  // Check for font families
  const expectedFonts = [
    "'Open Sans'",
    "'Montserrat'",
    "'Segoe UI'"
  ];

  expectedFonts.forEach(font => {
    if (!html.includes(font)) {
      issues.push(`Expected font ${font} not found in template`);
    }
  });

  return issues;
}

// Main function to check a template
async function checkTemplate(templatePath, templateName) {
  console.log(chalk.cyan(`\nChecking template: ${templateName}`));

  try {
    // Load the template file
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    // Basic syntax check
    try {
      // Try to require the template (this will throw if there's a syntax error)
      const templateModule = require(templatePath);

      if (typeof templateModule !== 'function') {
        console.log(chalk.red('❌ Template does not export a function'));
        return false;
      }

      // Try to execute the function with mock parameters
      const mockParams = {
        email: 'test@example.com',
        otp: '123456',
        recipientEmail: 'test@example.com',
        requestorName: 'Test User',
        meetingDate: new Date().toISOString(),
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        meetingTitle: 'Test Meeting',
        meetingDescription: 'Test Description',
        resetUrl: 'https://example.com/reset',
        loginUrl: 'https://example.com/login',
        userType: 'Student',
        acceptorName: 'Test Acceptor',
        cancellerName: 'Test Canceller'
      };

      // Get the parameter names from the function
      const fnStr = templateModule.toString();
      const paramNames = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).split(',').map(p => p.trim());

      // Create an array of parameters to pass to the function
      const params = paramNames.map(name => mockParams[name] || `mock_${name}`);

      // Call the function with the parameters
      const result = templateModule(...params);

      // Check if the result has the required fields
      const missingFields = REQUIRED_FIELDS.filter(field => !result[field]);
      if (missingFields.length > 0) {
        console.log(chalk.red(`❌ Template is missing required fields: ${missingFields.join(', ')}`));
        return false;
      }

      // Get the HTML content for further checks
      const html = result.html;

      // Create a DOM from the HTML
      const dom = new JSDOM(html);

      // Validate HTML structure
      const structureIssues = validateHtmlStructure(html);
      if (structureIssues.length > 0) {
        console.log(chalk.yellow('⚠️ HTML structure issues:'));
        structureIssues.forEach(issue => console.log(chalk.yellow(`  - ${issue}`)));
      } else {
        console.log(chalk.green('✅ HTML structure is valid'));
      }

      // Check for accessibility issues
      const accessibilityIssues = checkAccessibility(dom);
      if (accessibilityIssues.length > 0) {
        console.log(chalk.yellow('⚠️ Accessibility issues:'));
        accessibilityIssues.forEach(issue => console.log(chalk.yellow(`  - ${issue}`)));
      } else {
        console.log(chalk.green('✅ Accessibility checks passed'));
      }

      // Check for variable interpolation issues
      const interpolationIssues = checkVariableInterpolation(html, templateName);
      if (interpolationIssues.length > 0) {
        console.log(chalk.yellow('⚠️ Variable interpolation issues:'));
        interpolationIssues.forEach(issue => console.log(chalk.yellow(`  - ${issue}`)));
      } else {
        console.log(chalk.green('✅ Variable interpolation looks good'));
      }

      // Check for consistent styling
      const stylingIssues = checkConsistentStyling(html);
      if (stylingIssues.length > 0) {
        console.log(chalk.yellow('⚠️ Styling consistency issues:'));
        stylingIssues.forEach(issue => console.log(chalk.yellow(`  - ${issue}`)));
      } else {
        console.log(chalk.green('✅ Styling is consistent'));
      }

      // Check image URLs
      const images = dom.window.document.querySelectorAll('img');
      console.log(chalk.blue(`ℹ️ Found ${images.length} images in template`));

      for (const img of images) {
        const src = img.getAttribute('src');
        console.log(chalk.blue(`  Checking image: ${src}`));

        const isAccessible = await checkUrl(src);
        if (!isAccessible) {
          console.log(chalk.red(`  ❌ Image URL is not accessible: ${src}`));
        } else {
          console.log(chalk.green(`  ✅ Image URL is accessible: ${src}`));
        }
      }

      // Check links
      const links = dom.window.document.querySelectorAll('a');
      console.log(chalk.blue(`ℹ️ Found ${links.length} links in template`));

      for (const link of links) {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('mailto:') && !href.includes('${')) {
          console.log(chalk.blue(`  Checking link: ${href}`));

          const isAccessible = await checkUrl(href);
          if (!isAccessible) {
            console.log(chalk.red(`  ❌ Link URL is not accessible: ${href}`));
          } else {
            console.log(chalk.green(`  ✅ Link URL is accessible: ${href}`));
          }
        } else if (href && href.includes('${')) {
          console.log(chalk.blue(`  Link contains variable: ${href}`));
        }
      }

      console.log(chalk.green('✅ Template check completed'));
      return true;

    } catch (error) {
      console.log(chalk.red(`❌ Error evaluating template: ${error.message}`));
      return false;
    }

  } catch (error) {
    console.log(chalk.red(`❌ Error reading template file: ${error.message}`));
    return false;
  }
}

// Main function to check all templates
async function checkAllTemplates() {
  console.log(chalk.bold.blue('Starting Email Template Check'));
  console.log(chalk.blue('=============================='));

  try {
    // Get all template files
    const files = fs.readdirSync(TEMPLATES_DIR);
    const templateFiles = files.filter(file => file.endsWith('-template.js'));

    console.log(chalk.blue(`Found ${templateFiles.length} template files`));

    let successCount = 0;

    // Check each template
    for (const file of templateFiles) {
      const templatePath = path.join(TEMPLATES_DIR, file);
      const success = await checkTemplate(templatePath, file);
      if (success) successCount++;
    }

    console.log(chalk.blue('\n=============================='));
    console.log(chalk.bold.blue(`Template Check Summary: ${successCount}/${templateFiles.length} templates passed`));

  } catch (error) {
    console.log(chalk.red(`Error checking templates: ${error.message}`));
  }
}

// Run the main function
checkAllTemplates();
