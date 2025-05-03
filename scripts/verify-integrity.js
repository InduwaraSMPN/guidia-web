/**
 * Script to verify file integrity against manifest for Guidia Web
 *
 * Usage:
 * node scripts/verify-integrity.js [manifest-path]
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the integrity utils
import { loadIntegrityManifest, verifyIntegrity } from '../guidia-auth/utils/integrityUtils.js';

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

async function main() {
  try {
    console.log(`${colors.bold}${colors.cyan}Verifying File Integrity for Guidia Web${colors.reset}\n`);

    // Get manifest path from command line arguments or use the latest manifest
    let manifestPath = process.argv[2];

    if (!manifestPath) {
      const manifestsDir = path.join(__dirname, '..', 'integrity-manifests');

      if (!fs.existsSync(manifestsDir)) {
        console.error(`${colors.red}Error: Integrity manifests directory not found.${colors.reset}`);
        console.error(`${colors.yellow}Run 'node scripts/generate-integrity-manifest.js' to generate a manifest first.${colors.reset}`);
        process.exit(1);
      }

      // Find the latest combined manifest
      const manifestFiles = fs.readdirSync(manifestsDir)
        .filter(file => file.startsWith('combined-manifest-'))
        .sort()
        .reverse();

      if (manifestFiles.length === 0) {
        console.error(`${colors.red}Error: No manifest files found.${colors.reset}`);
        console.error(`${colors.yellow}Run 'node scripts/generate-integrity-manifest.js' to generate a manifest first.${colors.reset}`);
        process.exit(1);
      }

      manifestPath = path.join(manifestsDir, manifestFiles[0]);
    }

    console.log(`${colors.blue}Loading manifest from: ${manifestPath}${colors.reset}`);
    const manifest = await loadIntegrityManifest(manifestPath);

    // Verify frontend integrity
    if (manifest.frontend) {
      console.log(`\n${colors.bold}Verifying frontend integrity...${colors.reset}`);
      const frontendDir = path.join(__dirname, '..');
      const frontendResults = await verifyIntegrity(frontendDir, manifest.frontend);

      if (frontendResults.verified) {
        console.log(`${colors.green}✓ Frontend integrity verified!${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ Frontend integrity verification failed!${colors.reset}`);

        if (frontendResults.modifiedFiles.length > 0) {
          console.log(`\n${colors.yellow}Modified files:${colors.reset}`);
          frontendResults.modifiedFiles.forEach(file => {
            console.log(`  ${colors.red}${file}${colors.reset}`);
          });
        }

        if (frontendResults.missingFiles.length > 0) {
          console.log(`\n${colors.yellow}Missing files:${colors.reset}`);
          frontendResults.missingFiles.forEach(file => {
            console.log(`  ${colors.red}${file}${colors.reset}`);
          });
        }

        if (frontendResults.newFiles.length > 0) {
          console.log(`\n${colors.yellow}New files:${colors.reset}`);
          frontendResults.newFiles.forEach(file => {
            console.log(`  ${colors.blue}${file}${colors.reset}`);
          });
        }
      }
    }

    // Verify backend integrity
    if (manifest.backend) {
      console.log(`\n${colors.bold}Verifying backend integrity...${colors.reset}`);
      const backendDir = path.join(__dirname, '..', 'guidia-auth');
      const backendResults = await verifyIntegrity(backendDir, manifest.backend);

      if (backendResults.verified) {
        console.log(`${colors.green}✓ Backend integrity verified!${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ Backend integrity verification failed!${colors.reset}`);

        if (backendResults.modifiedFiles.length > 0) {
          console.log(`\n${colors.yellow}Modified files:${colors.reset}`);
          backendResults.modifiedFiles.forEach(file => {
            console.log(`  ${colors.red}${file}${colors.reset}`);
          });
        }

        if (backendResults.missingFiles.length > 0) {
          console.log(`\n${colors.yellow}Missing files:${colors.reset}`);
          backendResults.missingFiles.forEach(file => {
            console.log(`  ${colors.red}${file}${colors.reset}`);
          });
        }

        if (backendResults.newFiles.length > 0) {
          console.log(`\n${colors.yellow}New files:${colors.reset}`);
          backendResults.newFiles.forEach(file => {
            console.log(`  ${colors.blue}${file}${colors.reset}`);
          });
        }
      }
    }

    // Print manifest information
    if (manifest.generatedAt) {
      console.log(`\n${colors.cyan}Manifest generated at: ${manifest.generatedAt}${colors.reset}`);
    }

    if (manifest.version) {
      console.log(`${colors.cyan}Application version: ${manifest.version}${colors.reset}`);
    }

  } catch (error) {
    console.error(`${colors.red}Error verifying integrity:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the main function
main();
