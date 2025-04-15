import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { refreshAccessToken } from '@/lib/tokenRefresh';
import { storeCsrfToken, clearCsrfToken } from '@/lib/csrfToken';
import { refreshAllTokens } from '@/lib/tokenHelper';
import { API_URL as BASE_API_URL } from '../config';

interface User {
  id: string;
  userID: string;
  email: string;
  userType: 'Student' | 'Counselor' | 'Company' | 'Admin';
  roleId: number;
  hasProfile: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
  error: string | null;
  isVerifyingToken: boolean;
}

function getRoleFromId(roleId: number): User['userType'] {
  switch (roleId) {
    case 1:
      return 'Admin';
    case 2:
      return 'Student';
    case 3:
      return 'Counselor';
    case 4:
      return 'Company';
    default:
      throw new Error('Invalid role ID');
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth API endpoint
const AUTH_API_URL = `${BASE_API_URL}/api/auth`;

function createUserFromResponse(data: any): User {
  console.log('Creating user from response:', data);

  // Validate required fields
  if (!data.email) {
    console.error('Missing email in response:', data);
    throw new Error('Invalid user data: missing email');
  }

  // Get role ID from data, ensuring it's a number
  const roleId = typeof data.roleId === 'number' ? data.roleId :
                 typeof data.roleID === 'number' ? data.roleID :
                 Number(data.roleId || data.roleID);

  if (isNaN(roleId)) {
    console.error('Invalid roleId in response:', data);
    throw new Error('Invalid user data: invalid role ID');
  }

  const userType = getRoleFromId(roleId);

  // Check all possible user ID fields
  const numericId = data.userId ?? data.userID ?? data.id;
  if (!numericId) {
    console.error('Missing user ID in response:', data);
    throw new Error('Invalid user data: missing user ID');
  }

  return {
    id: numericId.toString(),
    userID: numericId.toString(), // Normalize to userID
    email: data.email,
    userType,
    roleId: roleId,
    hasProfile: data.hasProfile || false
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setIsVerifyingToken(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      setIsVerifyingToken(true);

      // First try to refresh all tokens silently
      try {
        const { accessToken: validToken } = await refreshAllTokens();
        const response = await fetch(`${BASE_API_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${validToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const userData = createUserFromResponse(data.user || data);
          setUser(userData);
          return userData;
        }
      } catch (refreshError) {
        console.error('Silent token refresh failed:', refreshError);
      }

      // If silent refresh fails, try with the original token
      const response = await fetch(`${BASE_API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const refreshResponse = await refreshAccessToken(refreshToken);
            localStorage.setItem('token', refreshResponse.accessToken);
            localStorage.setItem('refreshToken', refreshResponse.refreshToken);
            const userData = createUserFromResponse(refreshResponse.user);
            setUser(userData);
            return userData;
          }
        }
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      const userData = createUserFromResponse(data);
      setUser(userData);
      return userData;

    } catch (err) {
      console.error('Token verification error:', err);
      // Only clear tokens if we get a 401 or token-related error
      if (err.message.includes('Token') || err.message.includes('Authentication')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
      throw err;
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use BASE_API_URL directly with /auth/login since the endpoint is not under /api
      const response = await fetch(`${BASE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      // Store CSRF token from response headers
      storeCsrfToken(response);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(data.error);
        }
        throw new Error(data.error || 'Invalid credentials');
      }

      if (!data.token) {
        throw new Error('No token received from server');
      }

      // Store tokens and user ID
      localStorage.setItem('token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Store user ID for profile requests
      if (data.userId || data.userID || data.id) {
        const userId = data.userId || data.userID || data.id;
        localStorage.setItem('userId', userId.toString());
        console.log('Stored user ID in localStorage:', userId);
      }

      const processedData = {
        ...data,
        userID: data.userId ?? data.userID ?? data.id,
        id: data.userId ?? data.userID ?? data.id,
        hasProfile: data.hasProfile
      };

      const userData = createUserFromResponse(processedData);
      setUser(userData);
      return userData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Remove all tokens and user data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userID');
      localStorage.removeItem('companyID'); // Also clear companyID
      clearCsrfToken(); // Clear CSRF token
      setUser(null);
      console.log('Logged out successfully, all tokens cleared');
    } catch (err) {
      console.error('Logout error:', err);
      // Ensure tokens and user data are removed even if there's an error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userID');
      localStorage.removeItem('companyID'); // Also clear companyID
      clearCsrfToken(); // Clear CSRF token
      setUser(null);
    }
  };

  // Update user data in context
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;

    // Create a new user object with updated fields
    const updatedUser = {
      ...user,
      ...userData
    };

    console.log('Updating user context with:', updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading, error, isVerifyingToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// This function is not currently used but kept for future reference
// function getProfilePath(userData: User): string {
//   switch (userData.userType) {
//     case 'Admin':
//       return '/admin';
//     case 'Student':
//       return `/students/profile/${userData.userID}`;
//     case 'Counselor':
//       return `/counselor/profile/${userData.userID}`;
//     case 'Company':
//       return `/company/profile/${userData.userID}`;
//     default:
//       return '/';
//   }
// }
