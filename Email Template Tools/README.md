# Email Template Tools

This package provides tools to check and preview email templates in the Guidia project.

The tools are designed to work with the email templates located in the `../guidia-auth/email-templates` directory.

## Tools Included

1. **Email Template Checker** - Validates templates for common issues and consistency
2. **Email Template Previewer** - Generates visual previews of all email templates

## Features

### Email Template Checker
- Validates basic template structure
- Checks for proper variable interpolation
- Validates HTML structure
- Checks for accessibility issues (alt text, link text)
- Verifies image URLs are accessible
- Verifies links are valid
- Ensures consistent styling across templates

### Email Template Previewer
- Generates HTML previews of all email templates
- Creates an index page to navigate between previews
- Shows email metadata (from, to, subject)
- Provides both rendered preview and source code view

## Installation

1. Install the required dependencies:

```bash
npm install --save-dev chalk@4.1.2 jsdom@22.1.0 node-fetch@2.7.0
```

Or use the provided package.json:

```bash
npm install
```

## Usage

### Email Template Checker

Run the script to check all email templates:

```bash
node email-template-checker.js
```

Or use the npm script:

```bash
npm run check
```

### Email Template Previewer

Run the script to generate previews of all email templates:

```bash
node email-template-previewer.js
```

This will create an `email-previews` directory with HTML files for each template. Open the `index.html` file in your browser to view all previews.

### Using the Interactive Scripts

For a more user-friendly experience, you can use one of the provided interactive scripts:

```
node run-email-tools.js   # Cross-platform Node.js script
check-emails.bat         # Windows batch file
check-emails.ps1         # Windows PowerShell script
```

These scripts will:
1. Install the required dependencies
2. Present a menu of options
3. Run the selected tool(s)
4. Automatically open the preview in your default browser when applicable

## What It Checks

- **Template Structure**: Ensures each template exports a function that returns an object with required fields (from, to, subject, html)
- **HTML Structure**: Checks for proper DOCTYPE, html, head, body tags
- **Accessibility**: Checks for images without alt text and links without text content
- **Variable Interpolation**: Looks for potential issues with template variables
- **Consistent Styling**: Ensures brand colors and fonts are used consistently
- **Image URLs**: Verifies that image URLs are accessible
- **Links**: Checks that links are valid and accessible

## Output

The script provides detailed output for each template, highlighting any issues found with color-coded messages:

- ✅ Green: Checks that passed
- ⚠️ Yellow: Warnings about potential issues
- ❌ Red: Critical errors that need to be fixed
- ℹ️ Blue: Informational messages

## Example Output

```
Starting Email Template Check
==============================
Found 9 template files

Checking template: otp-template.js
✅ HTML structure is valid
✅ Accessibility checks passed
✅ Variable interpolation looks good
✅ Styling is consistent
ℹ️ Found 2 images in template
  Checking image: https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/public/logos/logo-dark.svg
  ✅ Image URL is accessible
ℹ️ Found 2 links in template
  Checking link: https://example.com
  ✅ Link URL is accessible
✅ Template check completed

...

==============================
Template Check Summary: 9/9 templates passed
```
