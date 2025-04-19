/**
 * Email Template Previewer
 *
 * This script generates HTML previews of all email templates in the guidia-auth/email-templates directory.
 * It allows you to see how the emails will look with sample data.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Directory containing email templates
const TEMPLATES_DIR = path.join(__dirname, '..', 'guidia-auth', 'email-templates');
const OUTPUT_DIR = path.join(__dirname, 'email-previews');

// Sample data for templates
const sampleData = {
  email: 'user@example.com',
  otp: '123456',
  recipientEmail: 'recipient@example.com',
  requestorName: 'John Doe',
  meetingDate: new Date().toISOString(),
  startTime: '10:00 AM',
  endTime: '11:00 AM',
  meetingTitle: 'Project Discussion',
  meetingDescription: 'Let\'s discuss the project progress and next steps.',
  resetUrl: 'https://example.com/reset-password?token=sample-token',
  loginUrl: 'https://example.com/login',
  userType: 'Counselor',
  acceptorName: 'Jane Smith',
  cancellerName: 'John Doe'
};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create index.html to list all previews
function createIndexHtml(templateNames) {
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template Previews</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #800020;
      border-bottom: 2px solid #800020;
      padding-bottom: 10px;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      margin-bottom: 10px;
      padding: 10px;
      background-color: #f9f9f9;
      border-radius: 5px;
    }
    a {
      color: #800020;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover {
      text-decoration: underline;
    }
    .preview-link {
      display: inline-block;
      margin-right: 15px;
    }
    .template-name {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Email Template Previews</h1>
  <p>Click on a template name to view its preview:</p>
  <ul>
    ${templateNames.map(name => `
      <li>
        <span class="template-name">${name}</span>
        <div>
          <a href="${name}.html" class="preview-link" target="_blank">View Preview</a>
          <a href="${name}-source.html" class="preview-link" target="_blank">View Source</a>
        </div>
      </li>
    `).join('')}
  </ul>
</body>
</html>
  `;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml);
  console.log(chalk.green(`✅ Created index.html with links to all ${templateNames.length} previews`));
}

// Create a source view HTML file
function createSourceView(templateName, html) {
  const sourceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Source: ${templateName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #800020;
      border-bottom: 2px solid #800020;
      padding-bottom: 10px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    a {
      color: #800020;
      text-decoration: none;
      font-weight: 500;
      display: inline-block;
      margin-bottom: 20px;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>Source Code: ${templateName}</h1>
  <a href="index.html">← Back to Index</a>
  <pre>${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>
  `;

  fs.writeFileSync(path.join(OUTPUT_DIR, `${templateName}-source.html`), sourceHtml);
}

// Generate preview for a template
async function generatePreview(templatePath, templateName) {
  console.log(chalk.cyan(`\nGenerating preview for: ${templateName}`));

  try {
    // Load the template file
    const templateModule = require(templatePath);

    if (typeof templateModule !== 'function') {
      console.log(chalk.red('❌ Template does not export a function'));
      return false;
    }

    // Get the parameter names from the function
    const fnStr = templateModule.toString();
    const paramNames = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).split(',').map(p => p.trim());

    // Create an array of parameters to pass to the function
    const params = paramNames.map(name => sampleData[name] || `mock_${name}`);

    // Call the function with the parameters
    const result = templateModule(...params);

    // Get the HTML content
    const html = result.html;

    // Create a wrapper HTML file for the preview
    const previewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${templateName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #800020;
      border-bottom: 2px solid #800020;
      padding-bottom: 10px;
    }
    .preview-container {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 20px;
      margin-top: 20px;
    }
    .email-details {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .detail-row {
      display: flex;
      margin-bottom: 8px;
    }
    .detail-label {
      font-weight: bold;
      width: 100px;
    }
    iframe {
      width: 100%;
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    a {
      color: #800020;
      text-decoration: none;
      font-weight: 500;
      display: inline-block;
      margin-bottom: 20px;
    }
    a:hover {
      text-decoration: underline;
    }
    .actions {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>Email Preview: ${templateName}</h1>

  <div class="actions">
    <a href="index.html">← Back to Index</a>
    <a href="${templateName}-source.html">View Source</a>
  </div>

  <div class="email-details">
    <div class="detail-row">
      <div class="detail-label">From:</div>
      <div>${result.from || 'process.env.EMAIL_USER'}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">To:</div>
      <div>${result.to}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Subject:</div>
      <div>${result.subject}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Text:</div>
      <div>${result.text ? result.text.substring(0, 100) + (result.text.length > 100 ? '...' : '') : 'Not provided'}</div>
    </div>
  </div>

  <div class="preview-container">
    <iframe srcdoc="${html.replace(/"/g, '&quot;')}" title="Email Preview"></iframe>
  </div>
</body>
</html>
    `;

    // Save the preview HTML
    fs.writeFileSync(path.join(OUTPUT_DIR, `${templateName}.html`), previewHtml);

    // Create source view
    createSourceView(templateName, html);

    console.log(chalk.green(`✅ Generated preview for ${templateName}`));
    return true;

  } catch (error) {
    console.log(chalk.red(`❌ Error generating preview: ${error.message}`));
    return false;
  }
}

// Main function to generate previews for all templates
async function generateAllPreviews() {
  console.log(chalk.bold.blue('Starting Email Template Preview Generation'));
  console.log(chalk.blue('========================================='));

  try {
    // Get all template files
    const files = fs.readdirSync(TEMPLATES_DIR);
    const templateFiles = files.filter(file => file.endsWith('-template.js'));

    console.log(chalk.blue(`Found ${templateFiles.length} template files`));

    let successCount = 0;
    const successfulTemplates = [];

    // Generate preview for each template
    for (const file of templateFiles) {
      const templatePath = path.join(TEMPLATES_DIR, file);
      const templateName = file.replace('.js', '');
      const success = await generatePreview(templatePath, templateName);

      if (success) {
        successCount++;
        successfulTemplates.push(templateName);
      }
    }

    // Create index.html
    createIndexHtml(successfulTemplates);

    console.log(chalk.blue('\n========================================='));
    console.log(chalk.bold.blue(`Preview Generation Summary: ${successCount}/${templateFiles.length} templates processed`));
    console.log(chalk.bold.green(`Preview index available at: ${path.join(OUTPUT_DIR, 'index.html')}`));

  } catch (error) {
    console.log(chalk.red(`Error generating previews: ${error.message}`));
  }
}

// Run the main function
generateAllPreviews();
