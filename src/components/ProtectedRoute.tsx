import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: string | string[];
  requiredRoleId?: number;
}

export function ProtectedRoute({ children, requiredUserType, requiredRoleId }: ProtectedRouteProps) {
  const { user } = useAuth();
  const params = useParams();
  const location = useLocation();

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  // First check roleID if specified (takes precedence)
  if (requiredRoleId !== undefined) {
    if (user.roleId !== requiredRoleId) {
      return <Navigate to="/" />;
    }
    return <>{children}</>;
  }

  // Check userID in URL against logged-in user for profile routes
  const pathSegments = location.pathname.split('/');
  const isProfileRoute = pathSegments.includes('profile');
  const userIdFromParams = params.userID || params.id; // Check both userID and id parameters

  if (isProfileRoute && userIdFromParams) {
    console.log('Profile access check:', {
      currentUser: user.userID,
      requestedProfile: userIdFromParams,
      isAdmin: user.roleId === 1,
      userType: user.userType
    });

    // Allow access if:
    // 1. User is an admin
    // 2. User is accessing their own profile
    // 3. User type matches the required type
    if (
      user.roleId === 1 || // Admin access
      user.userID === userIdFromParams || // Own profile
      (requiredUserType && ( // Type-based access
        Array.isArray(requiredUserType) 
          ? requiredUserType.includes(user.userType)
          : requiredUserType === user.userType
      ))
    ) {
      return <>{children}</>;
    }

    console.warn('Unauthorized profile access attempt:', {
      userID: user.userID,
      attemptedAccess: userIdFromParams,
      userType: user.userType,
      requiredType: requiredUserType
    });
    return <Navigate to="/" />;
  }

  // Check required user type if specified
  if (requiredUserType) {
    const allowedTypes = Array.isArray(requiredUserType) 
      ? requiredUserType 
      : [requiredUserType];
    
    if (!allowedTypes.includes(user.userType)) {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
}
