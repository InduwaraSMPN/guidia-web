/**
 * CSRF Token Management
 *
 * This module provides utilities for managing CSRF tokens in the frontend.
 */

// Storage key for CSRF token
const CSRF_TOKEN_KEY = 'csrf_token';

// Time when the token was last refreshed
const CSRF_TOKEN_REFRESH_KEY = 'csrf_token_refreshed_at';

/**
 * Store the CSRF token from response headers
 * @param response - The response object from a fetch or axios request
 */
export function storeCsrfToken(response: Response): void {
  // Log all headers for debugging
  console.log('Response headers:');
  response.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  // Try to get the CSRF token from the response headers
  // Note: Header names are case-insensitive according to the spec
  const csrfToken = response.headers.get('X-CSRF-Token') ||
                   response.headers.get('x-csrf-token');

  if (csrfToken) {
    localStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
    // Store the time when the token was refreshed
    localStorage.setItem(CSRF_TOKEN_REFRESH_KEY, Date.now().toString());
    console.log('CSRF token stored and timestamp updated:', csrfToken);
  } else {
    // Try to extract token from response body if it's a JSON response
    response.clone().json().then(data => {
      if (data && data.csrfToken) {
        localStorage.setItem(CSRF_TOKEN_KEY, data.csrfToken);
        localStorage.setItem(CSRF_TOKEN_REFRESH_KEY, Date.now().toString());
        console.log('CSRF token extracted from response body:', data.csrfToken);
      } else {
        console.warn('No X-CSRF-Token header or csrfToken in body found in response');
      }
    }).catch(() => {
      console.warn('No X-CSRF-Token header found in response and body is not JSON');
    });
  }
}

/**
 * Get the stored CSRF token
 * @returns The CSRF token or null if not found
 */
export function getCsrfToken(): string | null {
  return localStorage.getItem(CSRF_TOKEN_KEY);
}

/**
 * Clear the stored CSRF token
 */
export function clearCsrfToken(): void {
  localStorage.removeItem(CSRF_TOKEN_KEY);
  localStorage.removeItem(CSRF_TOKEN_REFRESH_KEY);
}

/**
 * Check if the CSRF token is likely to be expired
 * @param maxAgeMinutes - Maximum age in minutes before considering the token expired
 * @returns True if the token is likely expired, false otherwise
 */
export function isCsrfTokenExpired(maxAgeMinutes: number = 50): boolean {
  const token = getCsrfToken();
  if (!token) {
    return true;
  }

  const refreshedAt = localStorage.getItem(CSRF_TOKEN_REFRESH_KEY);
  if (!refreshedAt) {
    return true;
  }

  const refreshTime = parseInt(refreshedAt, 10);
  const now = Date.now();
  const ageInMinutes = (now - refreshTime) / (1000 * 60);

  // If token is older than maxAgeMinutes, consider it expired
  // Default is 50 minutes (CSRF tokens typically expire after 1 hour)
  return ageInMinutes > maxAgeMinutes;
}

/**
 * Add CSRF token to request headers
 * @param headers - The headers object to add the token to
 * @returns The headers object with the CSRF token added
 */
export function addCsrfToken(headers: Record<string, string> = {}): Record<string, string> {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    return {
      ...headers,
      'X-CSRF-Token': csrfToken
    };
  }
  return headers;
}

/**
 * Create headers with authentication and CSRF token
 * @param token - The authentication token
 * @returns Headers object with Authorization and CSRF token
 */
export function createAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Add authentication token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Try to get token from localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
  }

  // Add CSRF token
  return addCsrfToken(headers);
}
