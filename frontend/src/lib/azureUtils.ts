import axiosInstance from './axios';
import { UPLOAD_SETTINGS } from '../config';

/**
 * Interface for Azure Blob Storage file information
 */
export interface AzureFileInfo {
  isLegacyFormat: boolean;
  url: string;
  blobName?: string;
  userID?: string;
  userType?: string;
  fileType?: string;
  filename?: string;
  contentType?: string;
  contentLength?: number;
  metadata?: Record<string, string>;
  lastModified?: string;
  originalPath?: string;
}

/**
 * Interface for Azure Blob Storage user files response
 */
export interface AzureUserFilesResponse {
  userID: string;
  roleName: string;
  fileCount: number;
  files: AzureFileInfo[];
}

/**
 * Get metadata for a file stored in Azure Blob Storage
 *
 * @param url The URL of the file
 * @returns File metadata
 */
export const getAzureFileInfo = async (url: string): Promise<AzureFileInfo> => {
  try {
    console.log('Fetching Azure file info for URL:', url);
    const response = await axiosInstance.get<AzureFileInfo>('/api/azure/file-info', {
      params: { url }
    });

    console.log('Received Azure file info:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Azure file info:', error);

    // Try to parse the URL client-side as a fallback
    try {
      const parsedInfo = parseAzureBlobUrl(url);
      console.log('Client-side parsed URL info:', parsedInfo);

      return {
        url,
        ...parsedInfo
      };
    } catch (parseError) {
      console.error('Error parsing URL client-side:', parseError);

      // Return a minimal object with the URL and legacy format flag
      return {
        isLegacyFormat: true,
        url,
        originalPath: url
      };
    }
  }
};

/**
 * Get all files for a specific user
 *
 * @param userID The user ID
 * @param fileType Optional filter by file type (images, documents, other)
 * @returns List of files
 */
export const getUserFiles = async (userID: string, fileType?: string): Promise<AzureUserFilesResponse> => {
  try {
    const response = await axiosInstance.get<AzureUserFilesResponse>(`/api/azure/user-files/${userID}`, {
      params: fileType ? { fileType } : undefined
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching user files:', error);
    throw error;
  }
};

/**
 * Parse an Azure Blob URL to extract the path components
 * This is a client-side version of the server-side function
 *
 * @param url The Azure Blob URL or path
 * @returns The parsed components
 */
export const parseAzureBlobUrl = (url: string): {
  isLegacyFormat: boolean;
  rolePrefix?: string;
  userID?: string;
  fileType?: string;
  filename?: string;
  originalPath: string;
} => {
  try {
    console.log('Client parsing Azure URL:', url);

    // Handle both full URLs and relative paths
    let pathParts: string[];

    // Check if this is a full URL or just a path
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // This is a full URL, parse it
      const urlObj = new URL(url);
      pathParts = urlObj.pathname.split('/');

      // Remove the container name (first part after the domain)
      // The first element is empty because pathname starts with a slash
      if (pathParts[0] === '') {
        pathParts.shift();
      }

      // The next element should be the container name
      pathParts.shift();
    } else {
      // This is just a path, split it directly
      pathParts = url.split('/');

      // If the path starts with a slash, remove the empty first element
      if (pathParts[0] === '') {
        pathParts.shift();
      }
    }

    console.log('Path parts for processing:', pathParts);

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

    if (!firstPart || !knownPrefixes.includes(firstPart)) {
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
};

/**
 * Get the full Azure Blob Storage URL for a path
 *
 * @param path The blob path or relative URL
 * @returns The full Azure Blob Storage URL
 */
export const getFullAzureUrl = (path: string): string => {
  // If path is empty or undefined, return empty string
  if (!path) {
    console.warn('getFullAzureUrl called with empty path');
    return '';
  }

  // If it's a blob URL, return it as is
  if (path.startsWith('blob:')) {
    console.log('getFullAzureUrl - Returning blob URL as is:', path);
    return path;
  }

  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  // Construct the full URL
  return `https://guidiacloudstorage.blob.core.windows.net/guidiacloudstorage-blob1/${cleanPath}`;
};

/**
 * Get user type from role prefix
 * This is a client-side version of the server-side function
 *
 * @param rolePrefix The role prefix from the path
 * @returns The user type
 */
export const getUserTypeFromRolePrefix = (rolePrefix: string): string => {
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
};

/**
 * Maps a file MIME type to a file type category
 * This is a client-side version of the server-side function
 *
 * @param mimeType The MIME type of the file
 * @returns The file type category (images, documents, other)
 */
export const getFileTypeFromMimeType = (mimeType: string): string => {
  if (!mimeType) return 'other';

  // Get all MIME types from the config
  const mimeTypes = UPLOAD_SETTINGS.MIME_TYPES;
  const imageMimeTypes = Object.values(mimeTypes).filter(mime => mime.startsWith('image/'));
  const documentMimeTypes = Object.values(mimeTypes).filter(mime => !mime.startsWith('image/'));

  if (imageMimeTypes.includes(mimeType) || mimeType.startsWith('image/')) {
    return 'images';
  } else if (documentMimeTypes.includes(mimeType)) {
    return 'documents';
  } else {
    return 'other';
  }
};
