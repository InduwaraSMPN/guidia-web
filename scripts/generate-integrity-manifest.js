/**
 * Script to generate integrity manifest for Guidia Web
 *
 * Usage:
 * node scripts/generate-integrity-manifest.js
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the integrity utils
import { generateIntegrityManifest, saveIntegrityManifest } from '../guidia-auth/utils/integrityUtils.js';

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
    console.log(`${colors.bold}${colors.cyan}Generating Integrity Manifest for Guidia Web${colors.reset}\n`);

    // Create integrity manifests directory if it doesn't exist
    const manifestsDir = path.join(__dirname, '..', 'integrity-manifests');
    if (!fs.existsSync(manifestsDir)) {
      fs.mkdirSync(manifestsDir, { recursive: true });
    }

    // Generate manifest for frontend
    console.log(`${colors.blue}Generating manifest for frontend...${colors.reset}`);
    const frontendDir = path.join(__dirname, '..');
    const frontendManifest = await generateIntegrityManifest(
      frontendDir,
      'sha256',
      ['node_modules', '.git', 'dist', 'build', 'integrity-manifests', 'security-reports']
    );

    const frontendManifestPath = path.join(manifestsDir, `frontend-manifest-${new Date().toISOString().split('T')[0]}.json`);
    await saveIntegrityManifest(frontendManifest, frontendManifestPath);
    console.log(`${colors.green}Frontend manifest saved to: ${frontendManifestPath}${colors.reset}`);
    console.log(`${colors.yellow}Files included: ${Object.keys(frontendManifest).length}${colors.reset}\n`);

    // Generate manifest for backend
    console.log(`${colors.blue}Generating manifest for backend...${colors.reset}`);
    const backendDir = path.join(__dirname, '..', 'guidia-auth');
    const backendManifest = await generateIntegrityManifest(
      backendDir,
      'sha256',
      ['node_modules', '.git', 'dist', 'build']
    );

    const backendManifestPath = path.join(manifestsDir, `backend-manifest-${new Date().toISOString().split('T')[0]}.json`);
    await saveIntegrityManifest(backendManifest, backendManifestPath);
    console.log(`${colors.green}Backend manifest saved to: ${backendManifestPath}${colors.reset}`);
    console.log(`${colors.yellow}Files included: ${Object.keys(backendManifest).length}${colors.reset}\n`);

    // Create a combined manifest
    console.log(`${colors.blue}Generating combined manifest...${colors.reset}`);
    // Read package.json using fs
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const combinedManifest = {
      frontend: frontendManifest,
      backend: backendManifest,
      generatedAt: new Date().toISOString(),
      version: packageJson.version
    };

    const combinedManifestPath = path.join(manifestsDir, `combined-manifest-${new Date().toISOString().split('T')[0]}.json`);
    await saveIntegrityManifest(combinedManifest, combinedManifestPath);
    console.log(`${colors.green}Combined manifest saved to: ${combinedManifestPath}${colors.reset}`);

    console.log(`\n${colors.bold}${colors.green}Integrity manifests generated successfully!${colors.reset}`);
    console.log(`${colors.yellow}Use 'node scripts/verify-integrity.js' to verify file integrity against these manifests.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error generating integrity manifest:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the main function
main();
