import { getValidToken } from './tokenRefresh';
import { API_URL } from '../config';
import { getCsrfToken, isCsrfTokenExpired, storeCsrfToken } from './csrfToken';

/**
 * Refreshes both the access token and CSRF token
 * @returns An object containing the current valid tokens
 */
export async function refreshAllTokens() {
  // First try to refresh the access token
  let currentToken: string;
  try {
    currentToken = await getValidToken();
    console.log('Got valid access token');
  } catch (error) {
    console.error('Failed to get valid access token:', error);
    throw new Error('Authentication expired. Please log in again.');
  }

  // Check if CSRF token needs refreshing
  const currentCsrfToken = getCsrfToken();
  const needsCsrfRefresh = !currentCsrfToken || isCsrfTokenExpired();

  if (needsCsrfRefresh) {
    console.log('CSRF token is missing or expired, refreshing...');
    // Try to refresh the CSRF token
    try {
      // Try to get the CSRF token from the users profile endpoint
      // This endpoint has the csrfTokenGenerator middleware applied
      console.log('Fetching CSRF token from /api/users/profile endpoint');

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (!response.ok) {
        console.warn(`Failed to refresh CSRF token - profile request failed with status ${response.status}`);
        if (response.status === 404) {
          console.warn('API endpoint not found. Make sure the API server is running and the endpoint is correct.');
        }
        throw new Error('Failed to refresh security token');
      }

      // Store the CSRF token from the response
      storeCsrfToken(response);

      // Get the potentially updated token
      const updatedCsrfToken = getCsrfToken();

      if (!updatedCsrfToken) {
        console.warn('No CSRF token in profile response headers');
      }

      return {
        accessToken: currentToken,
        csrfToken: updatedCsrfToken
      };
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
      throw error;
    }
  } else {
    console.log('Using existing CSRF token (not expired)');
    return {
      accessToken: currentToken,
      csrfToken: currentCsrfToken
    };
  }
}

/**
 * Creates headers with the latest tokens for API requests
 * @param includeContentType Whether to include Content-Type header
 * @returns Headers object with Authorization and CSRF token
 */
export async function getSecureHeaders(includeContentType = true) {
  try {
    const { accessToken, csrfToken } = await refreshAllTokens();

    const headers: Record<string, string> = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    headers['Authorization'] = `Bearer ${accessToken}`;

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  } catch (error) {
    console.error('Failed to get secure headers:', error);

    // Fallback to current tokens in localStorage
    const headers: Record<string, string> = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }
}

/**
 * Makes a secure API request with token refresh handling
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The fetch response
 */
export async function secureApiRequest(url: string, options: RequestInit = {}) {
  try {
    // Get secure headers with refreshed tokens
    const headers = await getSecureHeaders();

    // Merge with any existing headers
    const mergedOptions = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {})
      },
      credentials: 'include' as RequestCredentials
    };

    // Make the request
    const response = await fetch(url, mergedOptions);

    // Store any new CSRF token from the response
    storeCsrfToken(response);

    // Handle 404 errors (endpoint not found)
    if (response.status === 404) {
      console.error(`API endpoint not found: ${url}`);
      console.error('This could indicate that the API server is not running or the endpoint path is incorrect.');
      return response; // Return the response so the caller can handle it
    }

    // If we get a 403 with CSRF token error, try once more with a forced token refresh
    if (response.status === 403) {
      try {
        const errorData = await response.clone().json();
        const isCsrfError =
          errorData.message === 'CSRF token is invalid or expired' ||
          errorData.message === 'CSRF token missing' ||
          errorData.error === 'Invalid CSRF token';

        if (isCsrfError) {
          console.log('CSRF token error detected, forcing token refresh and retrying...');

          // Force a token refresh
          await refreshAllTokens();

          // Get fresh headers
          const refreshedHeaders = await getSecureHeaders();

          // Retry the request with fresh tokens
          const retryOptions = {
            ...options,
            headers: {
              ...refreshedHeaders,
              ...(options.headers || {})
            },
            credentials: 'include' as RequestCredentials
          };

          const retryResponse = await fetch(url, retryOptions);

          // Store any new CSRF token
          storeCsrfToken(retryResponse);

          return retryResponse;
        }
      } catch (parseError) {
        console.error('Error parsing response during CSRF error handling:', parseError);
        // Continue with the original response if we can't parse the error
      }
    }

    return response;
  } catch (error) {
    console.error('Secure API request failed:', error);
    throw error;
  }
}
