/**
 * Security audit script for Guidia Web
 * Checks for vulnerable dependencies and outdated packages
 *
 * Usage:
 * node scripts/security-audit.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/**
 * Run npm audit in a directory
 * @param {string} dir - Directory to run audit in
 * @returns {Object} - Audit results
 */
function runAudit(dir) {
  try {
    console.log(`${colors.blue}Running npm audit in ${dir}...${colors.reset}`);

    // Run npm audit and capture the output
    const output = execSync('npm audit --json', {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Parse the JSON output
    return JSON.parse(output);
  } catch (error) {
    // npm audit returns non-zero exit code if vulnerabilities are found
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (parseError) {
        console.error(`${colors.red}Error parsing npm audit output:${colors.reset}`, parseError);
        return { error: true, message: error.message };
      }
    }

    console.error(`${colors.red}Error running npm audit:${colors.reset}`, error.message);
    return { error: true, message: error.message };
  }
}

/**
 * Run npm outdated in a directory
 * @param {string} dir - Directory to run outdated in
 * @returns {Object} - Outdated packages
 */
function runOutdated(dir) {
  try {
    console.log(`${colors.blue}Running npm outdated in ${dir}...${colors.reset}`);

    // Run npm outdated and capture the output
    const output = execSync('npm outdated --json', {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Parse the JSON output
    return JSON.parse(output);
  } catch (error) {
    // npm outdated returns non-zero exit code if outdated packages are found
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (parseError) {
        console.error(`${colors.red}Error parsing npm outdated output:${colors.reset}`, parseError);
        return { error: true, message: error.message };
      }
    }

    // If no outdated packages are found, return empty object
    if (error.status === 1 && !error.stdout) {
      return {};
    }

    console.error(`${colors.red}Error running npm outdated:${colors.reset}`, error.message);
    return { error: true, message: error.message };
  }
}

/**
 * Format audit results for display
 * @param {Object} auditResults - Audit results
 * @returns {string} - Formatted audit results
 */
function formatAuditResults(auditResults) {
  if (auditResults.error) {
    return `${colors.red}Error: ${auditResults.message}${colors.reset}`;
  }

  if (!auditResults.vulnerabilities) {
    return `${colors.green}No vulnerabilities found.${colors.reset}`;
  }

  const { vulnerabilities, metadata } = auditResults;

  // Count vulnerabilities by severity
  const severityCounts = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    info: 0
  };

  Object.values(vulnerabilities).forEach(vuln => {
    severityCounts[vuln.severity] += 1;
  });

  let output = `${colors.bold}Vulnerability Summary:${colors.reset}\n`;

  // Add summary counts
  if (severityCounts.critical > 0) output += `${colors.red}Critical: ${severityCounts.critical}${colors.reset}\n`;
  if (severityCounts.high > 0) output += `${colors.magenta}High: ${severityCounts.high}${colors.reset}\n`;
  if (severityCounts.moderate > 0) output += `${colors.yellow}Moderate: ${severityCounts.moderate}${colors.reset}\n`;
  if (severityCounts.low > 0) output += `${colors.blue}Low: ${severityCounts.low}${colors.reset}\n`;
  if (severityCounts.info > 0) output += `${colors.cyan}Info: ${severityCounts.info}${colors.reset}\n`;

  // Add total
  const total = Object.values(severityCounts).reduce((sum, count) => sum + count, 0);
  output += `${colors.bold}Total: ${total}${colors.reset}\n\n`;

  // Add details for critical and high vulnerabilities
  if (severityCounts.critical > 0 || severityCounts.high > 0) {
    output += `${colors.bold}Critical and High Severity Vulnerabilities:${colors.reset}\n`;

    Object.entries(vulnerabilities).forEach(([name, vuln]) => {
      if (vuln.severity === 'critical' || vuln.severity === 'high') {
        const severityColor = vuln.severity === 'critical' ? colors.red : colors.magenta;

        output += `${colors.bold}${name}:${colors.reset}\n`;
        output += `  ${severityColor}Severity: ${vuln.severity}${colors.reset}\n`;
        output += `  Via: ${vuln.via.map(v => typeof v === 'string' ? v : v.name).join(', ')}\n`;

        if (vuln.fixAvailable) {
          output += `  ${colors.green}Fix available: npm install ${vuln.fixAvailable.name}@${vuln.fixAvailable.version}${colors.reset}\n`;
        } else {
          output += `  ${colors.yellow}No direct fix available${colors.reset}\n`;
        }

        output += '\n';
      }
    });
  }

  // Add fix command if available
  if (metadata.vulnerabilities.total > 0) {
    output += `${colors.bold}Fix Command:${colors.reset}\n`;
    output += `${colors.green}npm audit fix${colors.reset}\n`;

    if (metadata.vulnerabilities.total !== metadata.vulnerabilities.fixable) {
      output += `\n${colors.yellow}Note: ${metadata.vulnerabilities.total - metadata.vulnerabilities.fixable} vulnerabilities require manual review${colors.reset}\n`;
    }
  }

  return output;
}

/**
 * Format outdated results for display
 * @param {Object} outdatedResults - Outdated results
 * @returns {string} - Formatted outdated results
 */
function formatOutdatedResults(outdatedResults) {
  if (outdatedResults.error) {
    return `${colors.red}Error: ${outdatedResults.message}${colors.reset}`;
  }

  if (Object.keys(outdatedResults).length === 0) {
    return `${colors.green}All packages are up to date.${colors.reset}`;
  }

  let output = `${colors.bold}Outdated Packages:${colors.reset}\n`;

  Object.entries(outdatedResults).forEach(([name, info]) => {
    const updateType =
      info.current.split('.')[0] !== info.latest.split('.')[0] ? 'Major' :
      info.current.split('.')[1] !== info.latest.split('.')[1] ? 'Minor' : 'Patch';

    const updateColor =
      updateType === 'Major' ? colors.red :
      updateType === 'Minor' ? colors.yellow : colors.green;

    output += `${colors.bold}${name}:${colors.reset}\n`;
    output += `  Current: ${info.current}\n`;
    output += `  Latest: ${info.latest}\n`;
    output += `  Type: ${updateColor}${updateType}${colors.reset}\n`;
    output += `  Location: ${info.location}\n`;
    output += '\n';
  });

  output += `${colors.bold}Update Command:${colors.reset}\n`;
  output += `${colors.green}npm update${colors.reset} (for minor and patch updates)\n`;
  output += `${colors.yellow}npm install <package>@latest${colors.reset} (for major updates, test carefully)\n`;

  return output;
}

/**
 * Generate a security report
 * @param {Object} auditResults - Audit results
 * @param {Object} outdatedResults - Outdated results
 * @returns {string} - Security report in markdown format
 */
function generateSecurityReport(rootAudit, rootOutdated, authAudit, authOutdated) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  let report = `# Guidia Web Security Audit Report\n\n`;
  report += `**Date:** ${dateStr}\n\n`;

  // Root project vulnerabilities
  report += `## Root Project Vulnerabilities\n\n`;

  if (rootAudit.error) {
    report += `Error running audit: ${rootAudit.message}\n\n`;
  } else if (!rootAudit.vulnerabilities || Object.keys(rootAudit.vulnerabilities).length === 0) {
    report += `No vulnerabilities found.\n\n`;
  } else {
    const { vulnerabilities, metadata } = rootAudit;

    // Count vulnerabilities by severity
    const severityCounts = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      info: 0
    };

    Object.values(vulnerabilities).forEach(vuln => {
      severityCounts[vuln.severity] += 1;
    });

    report += `### Vulnerability Summary\n\n`;
    report += `| Severity | Count |\n`;
    report += `| -------- | ----- |\n`;
    report += `| Critical | ${severityCounts.critical} |\n`;
    report += `| High | ${severityCounts.high} |\n`;
    report += `| Moderate | ${severityCounts.moderate} |\n`;
    report += `| Low | ${severityCounts.low} |\n`;
    report += `| Info | ${severityCounts.info} |\n`;
    report += `| **Total** | **${Object.values(severityCounts).reduce((sum, count) => sum + count, 0)}** |\n\n`;

    // Add details for critical and high vulnerabilities
    if (severityCounts.critical > 0 || severityCounts.high > 0) {
      report += `### Critical and High Severity Vulnerabilities\n\n`;

      Object.entries(vulnerabilities).forEach(([name, vuln]) => {
        if (vuln.severity === 'critical' || vuln.severity === 'high') {
          report += `#### ${name}\n\n`;
          report += `- **Severity:** ${vuln.severity}\n`;
          report += `- **Via:** ${vuln.via.map(v => typeof v === 'string' ? v : v.name).join(', ')}\n`;

          if (vuln.fixAvailable) {
            report += `- **Fix available:** \`npm install ${vuln.fixAvailable.name}@${vuln.fixAvailable.version}\`\n`;
          } else {
            report += `- **No direct fix available**\n`;
          }

          report += '\n';
        }
      });
    }

    // Add fix command if available
    if (metadata.vulnerabilities.total > 0) {
      report += `### Fix Command\n\n`;
      report += `\`\`\`\nnpm audit fix\n\`\`\`\n\n`;

      if (metadata.vulnerabilities.total !== metadata.vulnerabilities.fixable) {
        report += `**Note:** ${metadata.vulnerabilities.total - metadata.vulnerabilities.fixable} vulnerabilities require manual review\n\n`;
      }
    }
  }

  // Root project outdated packages
  report += `## Root Project Outdated Packages\n\n`;

  if (rootOutdated.error) {
    report += `Error checking outdated packages: ${rootOutdated.message}\n\n`;
  } else if (Object.keys(rootOutdated).length === 0) {
    report += `All packages are up to date.\n\n`;
  } else {
    report += `| Package | Current | Latest | Type |\n`;
    report += `| ------- | ------- | ------ | ---- |\n`;

    Object.entries(rootOutdated).forEach(([name, info]) => {
      const updateType =
        info.current.split('.')[0] !== info.latest.split('.')[0] ? 'Major' :
        info.current.split('.')[1] !== info.latest.split('.')[1] ? 'Minor' : 'Patch';

      report += `| ${name} | ${info.current} | ${info.latest} | ${updateType} |\n`;
    });

    report += '\n';
  }

  // Auth project vulnerabilities
  report += `## Auth Project Vulnerabilities\n\n`;

  if (authAudit.error) {
    report += `Error running audit: ${authAudit.message}\n\n`;
  } else if (!authAudit.vulnerabilities || Object.keys(authAudit.vulnerabilities).length === 0) {
    report += `No vulnerabilities found.\n\n`;
  } else {
    const { vulnerabilities, metadata } = authAudit;

    // Count vulnerabilities by severity
    const severityCounts = {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      info: 0
    };

    Object.values(vulnerabilities).forEach(vuln => {
      severityCounts[vuln.severity] += 1;
    });

    report += `### Vulnerability Summary\n\n`;
    report += `| Severity | Count |\n`;
    report += `| -------- | ----- |\n`;
    report += `| Critical | ${severityCounts.critical} |\n`;
    report += `| High | ${severityCounts.high} |\n`;
    report += `| Moderate | ${severityCounts.moderate} |\n`;
    report += `| Low | ${severityCounts.low} |\n`;
    report += `| Info | ${severityCounts.info} |\n`;
    report += `| **Total** | **${Object.values(severityCounts).reduce((sum, count) => sum + count, 0)}** |\n\n`;

    // Add details for critical and high vulnerabilities
    if (severityCounts.critical > 0 || severityCounts.high > 0) {
      report += `### Critical and High Severity Vulnerabilities\n\n`;

      Object.entries(vulnerabilities).forEach(([name, vuln]) => {
        if (vuln.severity === 'critical' || vuln.severity === 'high') {
          report += `#### ${name}\n\n`;
          report += `- **Severity:** ${vuln.severity}\n`;
          report += `- **Via:** ${vuln.via.map(v => typeof v === 'string' ? v : v.name).join(', ')}\n`;

          if (vuln.fixAvailable) {
            report += `- **Fix available:** \`npm install ${vuln.fixAvailable.name}@${vuln.fixAvailable.version}\`\n`;
          } else {
            report += `- **No direct fix available**\n`;
          }

          report += '\n';
        }
      });
    }

    // Add fix command if available
    if (metadata.vulnerabilities.total > 0) {
      report += `### Fix Command\n\n`;
      report += `\`\`\`\ncd guidia-auth && npm audit fix\n\`\`\`\n\n`;

      if (metadata.vulnerabilities.total !== metadata.vulnerabilities.fixable) {
        report += `**Note:** ${metadata.vulnerabilities.total - metadata.vulnerabilities.fixable} vulnerabilities require manual review\n\n`;
      }
    }
  }

  // Auth project outdated packages
  report += `## Auth Project Outdated Packages\n\n`;

  if (authOutdated.error) {
    report += `Error checking outdated packages: ${authOutdated.message}\n\n`;
  } else if (Object.keys(authOutdated).length === 0) {
    report += `All packages are up to date.\n\n`;
  } else {
    report += `| Package | Current | Latest | Type |\n`;
    report += `| ------- | ------- | ------ | ---- |\n`;

    Object.entries(authOutdated).forEach(([name, info]) => {
      const updateType =
        info.current.split('.')[0] !== info.latest.split('.')[0] ? 'Major' :
        info.current.split('.')[1] !== info.latest.split('.')[1] ? 'Minor' : 'Patch';

      report += `| ${name} | ${info.current} | ${info.latest} | ${updateType} |\n`;
    });

    report += '\n';
  }

  // Recommendations
  report += `## Recommendations\n\n`;

  // Add recommendations based on audit results
  const hasVulnerabilities =
    (!rootAudit.error && rootAudit.vulnerabilities && Object.keys(rootAudit.vulnerabilities).length > 0) ||
    (!authAudit.error && authAudit.vulnerabilities && Object.keys(authAudit.vulnerabilities).length > 0);

  const hasOutdatedPackages =
    (!rootOutdated.error && Object.keys(rootOutdated).length > 0) ||
    (!authOutdated.error && Object.keys(authOutdated).length > 0);

  if (hasVulnerabilities) {
    report += `1. **Fix vulnerabilities**: Run \`npm audit fix\` in both project directories to fix automatically fixable vulnerabilities.\n`;
    report += `2. **Review manual fixes**: Some vulnerabilities may require manual review and updates.\n`;
  }

  if (hasOutdatedPackages) {
    report += `${hasVulnerabilities ? '3' : '1'}. **Update packages**: Run \`npm update\` to update packages with minor and patch updates.\n`;
    report += `${hasVulnerabilities ? '4' : '2'}. **Test major updates**: For major updates, install packages individually and test thoroughly.\n`;
  }

  if (!hasVulnerabilities && !hasOutdatedPackages) {
    report += `- All packages are up to date and no vulnerabilities were found.\n`;
    report += `- Continue to run regular security audits to maintain security.\n`;
  }

  report += `\n## Regular Security Tasks\n\n`;
  report += `- Run \`npm audit\` regularly to check for new vulnerabilities.\n`;
  report += `- Run \`npm outdated\` regularly to check for outdated packages.\n`;
  report += `- Update dependencies regularly to stay current with security patches.\n`;
  report += `- Consider setting up automated dependency scanning in CI/CD pipeline.\n`;

  return report;
}

// Main function
async function main() {
  console.log(`${colors.bold}${colors.cyan}Guidia Web Security Audit${colors.reset}\n`);

  // Run audit and outdated in root directory
  const rootDir = path.resolve(__dirname, '..');
  const rootAudit = runAudit(rootDir);
  const rootOutdated = runOutdated(rootDir);

  // Run audit and outdated in guidia-auth directory
  const authDir = path.resolve(__dirname, '..', 'guidia-auth');
  const authAudit = runAudit(authDir);
  const authOutdated = runOutdated(authDir);

  // Print results
  console.log(`\n${colors.bold}${colors.cyan}Root Project Audit Results:${colors.reset}\n`);
  console.log(formatAuditResults(rootAudit));

  console.log(`\n${colors.bold}${colors.cyan}Root Project Outdated Packages:${colors.reset}\n`);
  console.log(formatOutdatedResults(rootOutdated));

  console.log(`\n${colors.bold}${colors.cyan}Auth Project Audit Results:${colors.reset}\n`);
  console.log(formatAuditResults(authAudit));

  console.log(`\n${colors.bold}${colors.cyan}Auth Project Outdated Packages:${colors.reset}\n`);
  console.log(formatOutdatedResults(authOutdated));

  // Generate security report
  const report = generateSecurityReport(rootAudit, rootOutdated, authAudit, authOutdated);

  // Write report to file
  const reportDir = path.resolve(__dirname, '..', 'security-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.resolve(reportDir, `security-report-${new Date().toISOString().split('T')[0]}.md`);
  fs.writeFileSync(reportPath, report);

  console.log(`\n${colors.bold}${colors.green}Security report generated: ${reportPath}${colors.reset}\n`);
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
