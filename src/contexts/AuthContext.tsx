import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const API_URL = '/auth';

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
      const response = await fetch(`${API_URL}/verify`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      const userData = createUserFromResponse(data);
      setUser(userData);
      return userData; // Return the user data

    } catch (err) {
      console.error('Token verification error:', err);
      localStorage.removeItem('token');
      setUser(null);
      throw err; // Rethrow the error
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

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

      localStorage.setItem('token', data.token);
      
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
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
      }
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error, isVerifyingToken }}>
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

function getProfilePath(userData: User): string {
  switch (userData.userType) {
    case 'Admin':
      return '/admin';
    case 'Student':
      return `/students/profile/${userData.userID}`;
    case 'Counselor':
      return `/counselor/profile/${userData.userID}`;
    case 'Company':
      return `/company/profile/${userData.userID}`;
    default:
      return '/';
  }
}
