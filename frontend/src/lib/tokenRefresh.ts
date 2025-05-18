import { API_URL } from '../config';

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    userID: string;
    userId: string;
    email: string;
    roleId: number;
    roleID: number;
  };
}

/**
 * Refresh the access token using the refresh token
 * @param refreshToken The refresh token to use
 * @returns A promise that resolves to the new tokens and user data
 * @throws An error if the refresh token is invalid or expired
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to refresh token');
    }

    return await response.json();
  } catch (error) {
    console.error('Token refresh error:', error);
    // Clear tokens from storage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    throw error;
  }
}

/**
 * Check if a token is expired
 * @param token The JWT token to check
 * @returns True if the token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  if (!token) return true;

  try {
    // Get the expiration time from the token
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    return currentTime >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Get a valid token, refreshing if necessary
 * @returns A promise that resolves to a valid access token
 * @throws An error if no valid token can be obtained
 */
export async function getValidToken(): Promise<string> {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  // If no tokens, can't proceed
  if (!token && !refreshToken) {
    throw new Error('No authentication tokens available');
  }

  // If token exists and is not expired or close to expiry, use it
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // Add a 5-minute buffer before expiration (TOKEN_REFRESH.REFRESH_THRESHOLD_SECONDS)
      const bufferTime = 300 * 1000; // 5 minutes in milliseconds
      
      if (currentTime < expirationTime - bufferTime) {
        return token;
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  }

  // If we get here, either token is expired/invalid or close to expiry
  if (refreshToken) {
    try {
      const { accessToken, refreshToken: newRefreshToken } = await refreshAccessToken(refreshToken);

      // Store the new tokens
      localStorage.setItem('token', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return accessToken;
    } catch (error) {
      // Only clear tokens if we get a specific auth error
      if (error.message.includes('Authentication') || error.message.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      throw error;
    }
  }

  throw new Error('No valid authentication token available');
}

