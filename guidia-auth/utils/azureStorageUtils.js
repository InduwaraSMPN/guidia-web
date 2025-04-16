/**
 * Azure Blob Storage Path Utilities
 *
 * This module provides standardized path generation for Azure Blob Storage
 * based on user roles and file types.
 */

/**
 * Generates a standardized Azure Blob Storage path based on user role and file type
 *
 * @param {Object} options - Path generation options
 * @param {number} options.userID - The user ID
 * @param {string} options.roleID - The role ID from the users table
 * @param {string} options.fileType - Type of file (images, documents, other)
 * @param {string} options.originalFilename - Original filename
 * @param {Object} options.pool - MySQL connection pool for database queries
 * @returns {Promise<string>} The generated path
 */
async function generateAzureBlobPath(options) {
  const { userID, roleID, fileType, originalFilename, pool } = options;

  if (!userID || !fileType || !originalFilename) {
    throw new Error('Missing required parameters for path generation');
  }

  // Get role name if roleID is provided but no roleName
  let roleName;
  if (roleID) {
    try {
      const [roles] = await pool.execute(
        'SELECT roleName FROM roles WHERE roleID = ?',
        [roleID]
      );

      if (roles.length > 0) {
        roleName = roles[0].roleName;
      } else {
        throw new Error(`No role found for roleID: ${roleID}`);
      }
    } catch (error) {
      console.error('Error fetching role name:', error);
      throw error;
    }
  } else {
    // If no roleID provided, try to get it from the users table
    try {
      const [users] = await pool.execute(
        'SELECT u.roleID, r.roleName FROM users u JOIN roles r ON u.roleID = r.roleID WHERE u.userID = ?',
        [userID]
      );

      if (users.length > 0) {
        roleName = users[0].roleName;
      } else {
        throw new Error(`No user found for userID: ${userID}`);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      throw error;
    }
  }

  // Map role name to directory prefix
  let rolePrefix;
  switch (roleName) {
    case 'Student':
      rolePrefix = 'student-profile';
      break;
    case 'Counselor':
      rolePrefix = 'counselor-profile';
      break;
    case 'Company':
      rolePrefix = 'company-profile';
      break;
    default:
      throw new Error(`Unsupported role: ${roleName}`);
  }

  // Validate file type
  if (!['images', 'documents', 'other'].includes(fileType)) {
    throw new Error(`Invalid file type: ${fileType}`);
  }

  // Generate timestamp for unique filename
  const timestamp = Date.now();

  // Construct the final path
  return `${rolePrefix}/${userID}/${fileType}/${timestamp}-${originalFilename}`;
}

/**
 * Simplified path generator when database access is not available
 *
 * @param {Object} options - Path generation options
 * @param {number} options.userID - The user ID
 * @param {string} options.userType - User type (Student, Counselor, Company)
 * @param {string} options.fileType - Type of file (images, documents, other)
 * @param {string} options.originalFilename - Original filename
 * @returns {string} The generated path
 */
function generateSimpleBlobPath(options) {
  const { userID, userType, fileType, originalFilename } = options;

  if (!userID || !userType || !fileType || !originalFilename) {
    throw new Error('Missing required parameters for path generation');
  }

  // Map user type to directory prefix
  let rolePrefix;
  switch (userType) {
    case 'Student':
      rolePrefix = 'student-profile';
      break;
    case 'Counselor':
      rolePrefix = 'counselor-profile';
      break;
    case 'Company':
      rolePrefix = 'company-profile';
      break;
    default:
      throw new Error(`Unsupported user type: ${userType}`);
  }

  // Validate file type
  if (!['images', 'documents', 'other'].includes(fileType)) {
    throw new Error(`Invalid file type: ${fileType}`);
  }

  // Generate timestamp for unique filename
  const timestamp = Date.now();

  // Construct the final path
  return `${rolePrefix}/${userID}/${fileType}/${timestamp}-${originalFilename}`;
}

/**
 * Maps a file MIME type to a file type category
 *
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} The file type category (images, documents, other)
 */
function getFileTypeFromMimeType(mimeType) {
  if (!mimeType) return 'other';

  // Standard image MIME types
  const imageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  // Standard document MIME types
  const documentMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (imageMimeTypes.includes(mimeType) || mimeType.startsWith('image/')) {
    return 'images';
  } else if (documentMimeTypes.includes(mimeType)) {
    return 'documents';
  } else {
    return 'other';
  }
}

/**
 * Parse an Azure Blob URL to extract the path components
 *
 * @param {string} url - The Azure Blob URL
 * @returns {Object} The parsed components (rolePrefix, userID, fileType, filename)
 */
function parseAzureBlobUrl(url) {
  try {
    // Extract the blob path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Log the URL and path parts for debugging
    console.log('Parsing Azure URL:', url);
    console.log('Path parts:', pathParts);

    // Remove the container name (first part after the domain)
    // The first element is empty because pathname starts with a slash
    if (pathParts[0] === '') {
      pathParts.shift();
    }

    // The next element should be the container name
    pathParts.shift();

    console.log('Path parts after shifts:', pathParts);

    // Check if this is a legacy format or new hierarchical format
    // Legacy format examples:
    // - student-profile/images/timestamp-filename.jpg
    // - resumes/timestamp-filename.pdf
    // New format examples:
    // - student-profile/123/images/timestamp-filename.jpg
    // - counselor-profile/456/documents/timestamp-resume.pdf

    // First, check if this follows our role prefix pattern
    const knownPrefixes = ['student-profile', 'counselor-profile', 'company-profile'];
    const firstPart = pathParts[0];

    if (!knownPrefixes.includes(firstPart)) {
      console.log('Unknown prefix, treating as legacy format:', firstPart);
      return {
        isLegacyFormat: true,
        originalPath: pathParts.join('/')
      };
    }

    // Now check if it's the new hierarchical format or legacy format with known prefix
    // If the second part is numeric, it's likely the new format
    const secondPart = pathParts[1];
    const isNumeric = /^\d+$/.test(secondPart);

    if (!isNumeric) {
      // This is a legacy format with a known prefix but no userID
      // e.g., student-profile/images/timestamp-filename.jpg
      console.log('Legacy format with known prefix:', pathParts.join('/'));
      return {
        isLegacyFormat: true,
        rolePrefix: firstPart,
        fileType: secondPart,
        filename: pathParts.slice(2).join('/'),
        originalPath: pathParts.join('/')
      };
    }

    // This is the new hierarchical format
    // e.g., student-profile/123/images/timestamp-filename.jpg
    if (pathParts.length < 4) {
      console.log('Incomplete hierarchical format:', pathParts.join('/'));
      return {
        isLegacyFormat: true,
        rolePrefix: firstPart,
        userID: secondPart,
        originalPath: pathParts.join('/')
      };
    }

    const rolePrefix = firstPart; // e.g., 'student-profile'
    const userID = secondPart; // e.g., '123'
    const fileType = pathParts[2]; // e.g., 'images'
    const filename = pathParts.slice(3).join('/'); // e.g., '1234567890-file.jpg'

    console.log('Parsed hierarchical format:', {
      rolePrefix,
      userID,
      fileType,
      filename
    });

    return {
      isLegacyFormat: false,
      rolePrefix,
      userID,
      fileType,
      filename,
      originalPath: pathParts.join('/')
    };
  } catch (error) {
    console.error('Error parsing Azure Blob URL:', error);
    return {
      isLegacyFormat: true,
      originalPath: url
    };
  }
}

/**
 * Get user type from role prefix
 *
 * @param {string} rolePrefix - The role prefix from the path
 * @returns {string} The user type
 */
function getUserTypeFromRolePrefix(rolePrefix) {
  switch (rolePrefix) {
    case 'student-profile':
      return 'Student';
    case 'counselor-profile':
      return 'Counselor';
    case 'company-profile':
      return 'Company';
    default:
      return 'Unknown';
  }
}

module.exports = {
  generateAzureBlobPath,
  generateSimpleBlobPath,
  getFileTypeFromMimeType,
  parseAzureBlobUrl,
  getUserTypeFromRolePrefix
};
