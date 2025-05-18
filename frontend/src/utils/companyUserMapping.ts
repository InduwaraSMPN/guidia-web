import axios from 'axios';
import { API_URL } from '@/config';

// Cache for company ID to user ID mapping
const companyUserCache: Record<number, number> = {};

/**
 * Get the user ID for a company ID
 * @param companyID The company ID
 * @returns The user ID associated with the company
 */
export async function getCompanyUserID(companyID: number): Promise<number> {
  // Check if we already have this mapping in the cache
  if (companyUserCache[companyID]) {
    return companyUserCache[companyID];
  }

  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Fetch all companies to find the one with the matching companyID
    const response = await axios.get(`${API_URL}/api/companies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Find the company with the matching companyID
    const company = response.data.find((c: any) => c.companyID === companyID);
    if (!company) {
      throw new Error(`Company with ID ${companyID} not found`);
    }

    // Store the mapping in the cache
    companyUserCache[companyID] = parseInt(company.userID);
    
    return parseInt(company.userID);
  } catch (error) {
    console.error('Error getting company user ID:', error);
    throw error;
  }
}

/**
 * Add a mapping to the cache
 * @param companyID The company ID
 * @param userID The user ID
 */
export function addCompanyUserMapping(companyID: number, userID: number): void {
  companyUserCache[companyID] = userID;
}
