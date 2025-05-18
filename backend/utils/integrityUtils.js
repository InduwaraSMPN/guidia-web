/**
 * File integrity utilities for Guidia Web
 * Provides functions to validate file integrity and prevent tampering
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Calculate hash of a file
 * @param {string} filePath - Path to the file
 * @param {string} algorithm - Hash algorithm to use (default: sha256)
 * @returns {Promise<string>} - Hex-encoded hash
 */
async function calculateFileHash(filePath, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => {
        hash.update(data);
      });

      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Validate file integrity using a hash
 * @param {string} filePath - Path to the file
 * @param {string} expectedHash - Expected hash value
 * @param {string} algorithm - Hash algorithm to use (default: sha256)
 * @returns {Promise<boolean>} - True if file hash matches expected hash
 */
async function validateFileIntegrity(filePath, expectedHash, algorithm = 'sha256') {
  try {
    const actualHash = await calculateFileHash(filePath, algorithm);
    return actualHash === expectedHash;
  } catch (error) {
    console.error(`Error validating file integrity: ${error.message}`);
    return false;
  }
}

/**
 * Generate integrity manifest for a directory
 * @param {string} directoryPath - Path to the directory
 * @param {string} algorithm - Hash algorithm to use (default: sha256)
 * @param {Array<string>} excludePatterns - Patterns to exclude (e.g., ['node_modules', '.git'])
 * @returns {Promise<Object>} - Object mapping file paths to hashes
 */
async function generateIntegrityManifest(directoryPath, algorithm = 'sha256', excludePatterns = ['node_modules', '.git', 'dist', 'build']) {
  const manifest = {};

  async function processDirectory(dirPath, relativePath = '') {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);

      // Skip excluded patterns
      if (excludePatterns.some(pattern => entryPath.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        await processDirectory(entryPath, entryRelativePath);
      } else {
        manifest[entryRelativePath] = await calculateFileHash(entryPath, algorithm);
      }
    }
  }

  await processDirectory(directoryPath);
  return manifest;
}

/**
 * Save integrity manifest to a file
 * @param {Object} manifest - Integrity manifest
 * @param {string} outputPath - Path to save the manifest
 * @returns {Promise<void>}
 */
async function saveIntegrityManifest(manifest, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const manifestJson = JSON.stringify(manifest, null, 2);
      fs.writeFileSync(outputPath, manifestJson);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Load integrity manifest from a file
 * @param {string} manifestPath - Path to the manifest file
 * @returns {Promise<Object>} - Integrity manifest
 */
async function loadIntegrityManifest(manifestPath) {
  return new Promise((resolve, reject) => {
    try {
      const manifestJson = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestJson);
      resolve(manifest);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Verify integrity of files against a manifest
 * @param {string} directoryPath - Path to the directory
 * @param {Object} manifest - Integrity manifest
 * @param {string} algorithm - Hash algorithm used in the manifest (default: sha256)
 * @returns {Promise<Object>} - Object with verification results
 */
async function verifyIntegrity(directoryPath, manifest, algorithm = 'sha256') {
  const results = {
    verified: true,
    modifiedFiles: [],
    missingFiles: [],
    newFiles: []
  };

  // Check for modified and missing files
  for (const [relativePath, expectedHash] of Object.entries(manifest)) {
    const filePath = path.join(directoryPath, relativePath);

    if (!fs.existsSync(filePath)) {
      results.verified = false;
      results.missingFiles.push(relativePath);
      continue;
    }

    const actualHash = await calculateFileHash(filePath, algorithm);
    if (actualHash !== expectedHash) {
      results.verified = false;
      results.modifiedFiles.push(relativePath);
    }
  }

  // Check for new files
  async function findNewFiles(dirPath, relativePath = '') {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);

      // Skip excluded patterns
      if (['node_modules', '.git', 'dist', 'build'].some(pattern => entryPath.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        await findNewFiles(entryPath, entryRelativePath);
      } else if (!manifest[entryRelativePath]) {
        results.newFiles.push(entryRelativePath);
      }
    }
  }

  await findNewFiles(directoryPath);

  return results;
}

/**
 * Validate uploaded file
 * @param {Object} file - Uploaded file object
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
function validateUploadedFile(file, options = {}) {
  const {
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
    allowedMimeTypes = [],
    allowedExtensions = []
  } = options;

  const result = {
    isValid: true,
    errors: []
  };

  // Check file size
  if (file.size > maxSizeBytes) {
    result.isValid = false;
    result.errors.push(`File size exceeds maximum allowed size (${Math.round(maxSizeBytes / 1024 / 1024)}MB)`);
  }

  // Check MIME type
  if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
    result.isValid = false;
    result.errors.push(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    if (!allowedExtensions.includes(fileExtension)) {
      result.isValid = false;
      result.errors.push(`File extension .${fileExtension} is not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }
  }

  return result;
}

/**
 * Generate a subresource integrity (SRI) hash for a file
 * @param {string} filePath - Path to the file
 * @param {string} algorithm - Hash algorithm to use (default: sha384)
 * @returns {Promise<string>} - SRI hash (e.g., 'sha384-...')
 */
async function generateSRI(filePath, algorithm = 'sha384') {
  try {
    const fileContent = fs.readFileSync(filePath);
    const hash = crypto.createHash(algorithm).update(fileContent).digest('base64');
    return `${algorithm}-${hash}`;
  } catch (error) {
    console.error(`Error generating SRI hash: ${error.message}`);
    throw error;
  }
}

module.exports = {
  calculateFileHash,
  validateFileIntegrity,
  generateIntegrityManifest,
  saveIntegrityManifest,
  loadIntegrityManifest,
  verifyIntegrity,
  validateUploadedFile,
  generateSRI
};
