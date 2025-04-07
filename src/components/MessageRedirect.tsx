import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from '../components/ui/sonner';
import { getNewMessageUrl, parseMessageUrl } from '../utils/messageUrlUtils';

/**
 * This component redirects from the old message URL format to the new format
 * Old format: /:userType/messages/:receiverId?type=xxx
 * New format: /:userType/:userID/messages/:receiverId?type=xxx
 */
export function MessageRedirect() {
  const { receiverId } = useParams<{ receiverId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchParams = new URLSearchParams(location.search);

  useEffect(() => {
    if (!user || !receiverId) return;

    // Parse the current URL to get components
    // We don't need to use the parsed userType since we're using the authenticated user's type
    parseMessageUrl(location.pathname); // Just for logging purposes

    // Construct the new URL with the user's ID
    const newPath = getNewMessageUrl(
      user.userType,
      user.userID,
      receiverId,
      searchParams.get('type') || undefined
    );

    console.log(`MessageRedirect: Redirecting from legacy URL format to new format:`);
    console.log(`- From: ${location.pathname}${location.search}`);
    console.log(`- To: ${newPath}`);

    // Redirect to the new URL
    navigate(newPath, { replace: true });

    // Show a toast notification in development mode
    if (import.meta.env.DEV) {
      toast.info("Redirected to new message format", {
        description: "The application now uses a new URL format for messages.",
        duration: 3000,
      });
    }
  }, [user, receiverId, searchParams, location.search, navigate, location.pathname]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-[#800020] animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to messages...</p>
      </div>
    </div>
  );
}
