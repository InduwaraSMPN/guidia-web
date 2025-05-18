import { useState } from 'react';
import { Button } from './ui/button';
import { getOrCreateConversation } from '@/utils/getOrCreateConversation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * A button component that creates a test conversation for debugging purposes
 * This should only be used in development
 */
export function TestConversationButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const handleCreateTestConversation = async () => {
    // Get the current URL path
    const path = window.location.pathname;
    // Extract the user ID from the URL
    const urlUserID = path.split('/')[2];

    if (!urlUserID) {
      setError('Could not determine user ID from URL');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      console.log(`Getting or creating test conversation for user ID: ${urlUserID}`);
      // Create a test conversation with a mock user ID
      const testUserId = '999'; // This could be any ID that's not the current user
      const conversationId = await getOrCreateConversation(urlUserID, testUserId);
      setSuccess(`Test conversation ready: ${conversationId}`);
    } catch (error) {
      console.error('Error with test conversation:', error);
      setError('Failed to prepare test conversation');
    } finally {
      setIsCreating(false);
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg border border-border">
        <h3 className="text-sm font-medium mb-2">Development Tools</h3>
        <Button
          onClick={handleCreateTestConversation}
          disabled={isCreating}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Test Conversation'
          )}
        </Button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        {success && <p className="text-xs text-green-500 mt-2">{success}</p>}
      </div>
    </div>
  );
}

