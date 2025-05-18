/**
 * Azure Blob Storage routes
 *
 * This module provides endpoints for retrieving information about files stored in Azure Blob Storage.
 */

const express = require('express');
const router = express.Router();
const { BlobServiceClient } = require('@azure/storage-blob');
const { verifyToken } = require('../middleware/auth');
const azureStorageUtils = require('../utils/azureStorageUtils');

// Azure Blob Storage configuration
require('dotenv').config();
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

// Initialize Azure Blob Storage client
let blobServiceClient, containerClient;
try {
  const options = {
    retryOptions: {
      maxTries: 3,
      retryDelayInMs: 1000,
      maxRetryDelayInMs: 5000
    }
  };
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString, options);
  containerClient = blobServiceClient.getContainerClient(containerName);
} catch (error) {
  console.error('Failed to initialize Azure Blob Storage client:', error);
}

/**
 * GET /api/azure/file-info
 *
 * Retrieves metadata about a file stored in Azure Blob Storage
 * Query parameters:
 * - url: The URL of the file
 */
router.get('/file-info', verifyToken, async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log('Received file info request for URL:', url);

    // Parse the URL to extract path components
    const parsedUrl = azureStorageUtils.parseAzureBlobUrl(url);

    if (parsedUrl.isLegacyFormat) {
      console.log('Detected legacy format URL, returning basic info');
      // For legacy format, just return the original path and any additional info we have
      return res.json({
        isLegacyFormat: true,
        originalPath: parsedUrl.originalPath,
        url,
        rolePrefix: parsedUrl.rolePrefix,
        userID: parsedUrl.userID,
        fileType: parsedUrl.fileType,
        filename: parsedUrl.filename
      });
    }

    console.log('Getting blob properties for path:', parsedUrl.originalPath);

    // Get the blob client for this path
    const blobName = parsedUrl.originalPath;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Try to get blob properties including metadata
    let properties;
    try {
      properties = await blockBlobClient.getProperties();
    } catch (blobError) {
      console.error('Error getting blob properties:', blobError);
      // If we can't get properties, return what we have without failing
      return res.json({
        isLegacyFormat: false,
        url,
        blobName,
        userID: parsedUrl.userID,
        userType: azureStorageUtils.getUserTypeFromRolePrefix(parsedUrl.rolePrefix),
        fileType: parsedUrl.fileType,
        filename: parsedUrl.filename,
        error: 'Could not retrieve blob properties'
      });
    }

    // Get user type from role prefix
    const userType = azureStorageUtils.getUserTypeFromRolePrefix(parsedUrl.rolePrefix);

    console.log('Successfully retrieved blob properties');

    // Return file information
    res.json({
      isLegacyFormat: false,
      url,
      blobName,
      userID: parsedUrl.userID,
      userType,
      fileType: parsedUrl.fileType,
      filename: parsedUrl.filename,
      contentType: properties.contentType,
      contentLength: properties.contentLength,
      metadata: properties.metadata,
      lastModified: properties.lastModified
    });
  } catch (error) {
    console.error('Error retrieving file info:', error);
    // Return a 200 response with error details instead of a 500
    // This helps the client handle the error more gracefully
    res.json({
      isLegacyFormat: true,
      url: req.query.url,
      error: 'Failed to retrieve file information',
      message: error.message
    });
  }
});

/**
 * GET /api/azure/user-files/:userID
 *
 * Lists all files for a specific user
 * Path parameters:
 * - userID: The user ID
 * Query parameters:
 * - fileType: Optional filter by file type (images, documents, other)
 */
router.get('/user-files/:userID', verifyToken, async (req, res) => {
  try {
    const { userID } = req.params;
    const { fileType } = req.query;

    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user role from database
    const pool = req.app.locals.pool;
    const [users] = await pool.execute(
      'SELECT u.roleID, r.roleName FROM users u JOIN roles r ON u.roleID = r.roleID WHERE u.userID = ?',
      [userID]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const roleName = users[0].roleName;

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
        return res.status(400).json({ error: `Unsupported role: ${roleName}` });
    }

    // Construct the prefix for listing blobs
    let prefix = `${rolePrefix}/${userID}/`;

    // Add file type to prefix if specified
    if (fileType && ['images', 'documents', 'other'].includes(fileType)) {
      prefix += `${fileType}/`;
    }

    // List blobs with the specified prefix
    const blobs = [];
    const iterator = containerClient.listBlobsFlat({ prefix });

    for await (const blob of iterator) {
      // Parse the blob name to extract components
      const pathParts = blob.name.split('/');

      // Skip if the path doesn't match our expected format
      if (pathParts.length < 4) continue;

      const blobFileType = pathParts[2];
      const filename = pathParts.slice(3).join('/');

      // Get the blob URL
      const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
      const url = blockBlobClient.url;

      blobs.push({
        name: blob.name,
        url,
        userID,
        rolePrefix,
        fileType: blobFileType,
        filename,
        lastModified: blob.properties.lastModified,
        contentLength: blob.properties.contentLength,
        contentType: blob.properties.contentType
      });
    }

    res.json({
      userID,
      roleName,
      fileCount: blobs.length,
      files: blobs
    });
  } catch (error) {
    console.error('Error listing user files:', error);
    res.status(500).json({
      error: 'Failed to list user files',
      message: error.message
    });
  }
});

module.exports = router;
