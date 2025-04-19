/**
 * Email Template Tools Runner
 *
 * This script provides a command-line interface to run the email template tools.
 */

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to clear the console
function clearConsole() {
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    process.stdout.write('\x1Bc');
  } else {
    console.clear();
  }
}

// Function to run a command
function runCommand(command, args) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: 'inherit' });
    proc.on('close', (code) => {
      resolve(code);
    });
  });
}

// Function to open the preview in the default browser
function openPreview() {
  const previewPath = path.join(__dirname, 'email-previews', 'index.html');
  if (fs.existsSync(previewPath)) {
    console.log('\nOpening preview in browser...');
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      spawn('cmd', ['/c', 'start', '', previewPath], { stdio: 'ignore' });
    } else if (process.platform === 'darwin') { // macOS
      spawn('open', [previewPath], { stdio: 'ignore' });
    } else { // Linux
      spawn('xdg-open', [previewPath], { stdio: 'ignore' });
    }
  } else {
    console.log('\nPreview file not found. Run the previewer first.');
  }
}

// Function to show the menu
function showMenu() {
  clearConsole();
  console.log('===== Email Template Tools =====');
  console.log('1: Check email templates for issues');
  console.log('2: Generate email template previews');
  console.log('3: Run both tools');
  console.log('4: Open preview in browser');
  console.log('5: Exit');
  console.log('================================');

  rl.question('Enter your choice (1-5): ', async (choice) => {
    switch (choice) {
      case '1':
        console.log('\nRunning email template checker...');
        await runCommand('node', [path.join(__dirname, 'email-template-checker.js')]);
        pressAnyKey();
        break;

      case '2':
        console.log('\nGenerating email template previews...');
        await runCommand('node', [path.join(__dirname, 'email-template-previewer.js')]);
        openPreview();
        pressAnyKey();
        break;

      case '3':
        console.log('\nRunning email template checker...');
        await runCommand('node', [path.join(__dirname, 'email-template-checker.js')]);

        console.log('\nGenerating email template previews...');
        await runCommand('node', [path.join(__dirname, 'email-template-previewer.js')]);

        openPreview();
        pressAnyKey();
        break;

      case '4':
        openPreview();
        pressAnyKey();
        break;

      case '5':
        rl.close();
        break;

      default:
        console.log('Invalid choice. Please try again.');
        pressAnyKey();
        break;
    }
  });
}

// Function to prompt for any key
function pressAnyKey() {
  rl.question('\nPress Enter to continue...', () => {
    showMenu();
  });
}

// Check if dependencies are installed
const requiredDependencies = ['chalk', 'jsdom', 'node-fetch'];
let missingDependencies = [];

requiredDependencies.forEach(dep => {
  try {
    require(dep);
  } catch (err) {
    missingDependencies.push(dep);
  }
});

if (missingDependencies.length > 0) {
  console.log('Some dependencies are missing. Please run the following command:');
  console.log(`npm install --save-dev ${missingDependencies.join(' ')}`);
  rl.close();
} else {
  console.log('Starting Email Template Tools...');
  // Show the menu directly
  showMenu();
}

// Handle close event
rl.on('close', () => {
  console.log('Exiting...');
  process.exit(0);
});
