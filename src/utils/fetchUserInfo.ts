import axios from 'axios';
import { getFullAzureUrl } from '@/lib/azureUtils';

/**
 * User information interface
 */
export interface UserInfo {
  id: string;
  name: string;
  image?: string;
  type: 'student' | 'counselor' | 'company' | 'admin';
  subtitle?: string;
}

/**
 * Fetches user information from the API
 * @param userId The ID of the user to fetch
 * @param userType The type of user (student, counselor, company) if known
 * @returns User information
 */
export async function fetchUserInfo(userId: string, userType?: string): Promise<UserInfo> {
  try {
    console.log(`Fetching user info for user ${userId} of type ${userType || 'unknown'}`);

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found for API request');
      return createDefaultUserInfo(userId);
    }

    // Determine the endpoint based on user type or try to infer it
    let endpoint = '';

    // Log the user type for debugging
    console.log('fetchUserInfo - Processing user type:', {
      userType,
      userId,
      typeIsString: typeof userType === 'string',
      typeAfterLowerCase: userType ? userType.toLowerCase() : null
    });

    if (userType) {
      // If user type is provided, use it directly
      const type = userType.toLowerCase();
      console.log('fetchUserInfo - User type provided:', { type });

      if (type === 'student' || type === 'students') {
        endpoint = `/api/students/profile/${userId}`;
      } else if (type === 'counselor' || type === 'counselors') {
        endpoint = `/api/counselors/profile/${userId}`;
        console.log('fetchUserInfo - Using counselor endpoint:', { endpoint, userId });
      } else if (type === 'company' || type === 'companies') {
        endpoint = `/api/companies/profile/${userId}`;
      } else if (type === 'admin') {
        // For admin users, return a predefined admin user info
        return {
          id: userId,
          name: 'Admin',
          type: 'admin',
          subtitle: 'System Administrator'
        };
      }
    } else {
      // Try to infer user type from ID format (if your IDs follow a pattern)
      if (userId.startsWith('student-')) {
        endpoint = `/api/students/profile/${userId}`;
      } else if (userId.startsWith('counselor-')) {
        endpoint = `/api/counselors/profile/${userId}`;
      } else if (userId.startsWith('company-')) {
        endpoint = `/api/companies/profile/${userId}`;
      } else {
        // Check if this is an admin user based on roleID (typically 1)
        // This is a heuristic - you might need to adjust based on your system
        if (userId === '1' || userId === '56') {
          return {
            id: userId,
            name: 'Admin',
            type: 'admin',
            subtitle: 'System Administrator'
          };
        }

        // If we can't determine the type, try all endpoints
        console.log('Unable to determine user type, will try all endpoints');
        return await tryAllEndpoints(userId, token);
      }
    }

    if (!endpoint) {
      console.warn(`Could not determine API endpoint for user ${userId}`);
      return createDefaultUserInfo(userId);
    }

    console.log(`Fetching user info from endpoint: ${endpoint}`);
    const response = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = response.data as any;

    // Map the API response to our UserInfo interface
    const imagePath = data.studentProfileImagePath || data.counselorProfileImagePath || data.companyLogoPath;

    return {
      id: userId,
      name: data.studentName || data.counselorName || data.companyName || `User ${userId}`,
      image: imagePath, // We'll handle the full URL conversion in the components
      type: data.studentName ? 'student' : data.counselorName ? 'counselor' : 'company',
      subtitle: data.studentLevel || data.counselorPosition || data.companyDescription || ''
    };
  } catch (error) {
    console.error(`Error fetching user info for ${userId}:`, error);
    return createDefaultUserInfo(userId);
  }
}

/**
 * Creates a default user info object when API request fails
 */
function createDefaultUserInfo(userId: string): UserInfo {
  // Check if this is likely an admin user based on ID
  if (userId === '1' || userId === '56') {
    return {
      id: userId,
      name: 'Admin',
      type: 'admin',
      subtitle: 'System Administrator'
    };
  }

  return {
    id: userId,
    name: `User ${userId}`,
    type: 'student', // Default type
    subtitle: 'No information available'
  };
}

/**
 * Tries all possible API endpoints to find user information
 */
async function tryAllEndpoints(userId: string, token: string): Promise<UserInfo> {
  const endpoints = [
    `/api/students/profile/${userId}`,
    `/api/counselors/profile/${userId}`,
    `/api/companies/profile/${userId}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        const data = response.data as any;

        // Determine user type based on which fields are present
        let type: 'student' | 'counselor' | 'company' | 'admin';
        if (data.studentName) type = 'student';
        else if (data.counselorName) type = 'counselor';
        else if (data.companyName) type = 'company';
        else continue; // Skip if no name field is found

        const imagePath = data.studentProfileImagePath || data.counselorProfileImagePath || data.companyLogoPath;

        return {
          id: userId,
          name: data.studentName || data.counselorName || data.companyName,
          image: imagePath, // We'll handle the full URL conversion in the components
          type,
          subtitle: data.studentLevel || data.counselorPosition || data.companyDescription || ''
        };
      }
    } catch (error) {
      // Continue to the next endpoint if this one fails
      continue;
    }
  }

  // If all endpoints fail, return default user info
  return createDefaultUserInfo(userId);
}
