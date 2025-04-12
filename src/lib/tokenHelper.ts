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
      // Use the dedicated CSRF token endpoint
      console.log('Fetching CSRF token from /api/users/csrf-token endpoint');

      const response = await fetch(`${API_URL}/api/users/csrf-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
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
    // Force refresh tokens before sensitive operations
    await refreshAllTokens();

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

    // Log the headers being sent for debugging
    console.log('Sending request with headers:', mergedOptions.headers);

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

    // If we get a 403 with CSRF token error, try multiple times with a forced token refresh
    if (response.status === 403) {
      try {
        const errorData = await response.clone().json();
        const isCsrfError =
          errorData.message === 'CSRF token is invalid or expired' ||
          errorData.message === 'CSRF token missing' ||
          errorData.error === 'Invalid CSRF token';

        if (isCsrfError) {
          console.log('CSRF token error detected, forcing token refresh and retrying...');

          // Try multiple times to refresh the token
          let maxRetries = 3;
          let retryCount = 0;
          let retryResponse = null;

          while (retryCount < maxRetries) {
            retryCount++;
            console.log(`CSRF token retry attempt ${retryCount}/${maxRetries}`);

            try {
              // Force a token refresh using the dedicated endpoint
              const response = await fetch(`${API_URL}/api/users/csrf-token`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${await getValidToken()}`,
                  'Accept': 'application/json'
                },
                credentials: 'include'
              });

              if (response.ok) {
                // Store the CSRF token
                storeCsrfToken(response);

                // Get the token from the response body as well
                const data = await response.json();
                if (data.csrfToken) {
                  localStorage.setItem('csrf_token', data.csrfToken);
                  localStorage.setItem('csrf_token_refreshed_at', Date.now().toString());
                  console.log('CSRF token stored from response body:', data.csrfToken);
                }

                // Get fresh headers with the new token
                const refreshedHeaders = await getSecureHeaders();

                // Log the headers for debugging
                console.log('Retrying request with headers:', {
                  ...refreshedHeaders,
                  ...(options.headers || {})
                });

                // Retry the request with fresh tokens
                const retryOptions = {
                  ...options,
                  headers: {
                    ...refreshedHeaders,
                    ...(options.headers || {})
                  },
                  credentials: 'include' as RequestCredentials
                };

                retryResponse = await fetch(url, retryOptions);

                // If successful, break out of the retry loop
                if (retryResponse.ok || retryResponse.status !== 403) {
                  // Store any new CSRF token
                  storeCsrfToken(retryResponse);
                  return retryResponse;
                }
              }
            } catch (retryError) {
              console.error(`Retry attempt ${retryCount} failed:`, retryError);
            }

            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // If we have a retry response, return it even if it's not successful
          if (retryResponse) {
            return retryResponse;
          }

          // If all retries failed, continue with the original response
          console.error(`All ${maxRetries} CSRF token refresh attempts failed`);
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
