import { useState } from 'react';
import { Button } from './ui/button';
import { getOrCreateConversation } from '@/utils/getOrCreateConversation';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * A button component that creates a specific conversation between users 35 and 33
 * This is for fixing the specific issue reported by the user
 */
export function FixConversationButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateConversation = async () => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      // Create a conversation between users 35 (Nimali) and 33 (Ranjith)
      const userId1 = '35'; // Nimali
      const userId2 = '33'; // Ranjith

      console.log(`Getting or creating conversation between users ${userId1} and ${userId2}`);
      const conversationId = await getOrCreateConversation(userId1, userId2);
      setSuccess(`Conversation ready: ${conversationId}`);

      // Navigate to the student messages page with the conversation already selected
      setTimeout(() => {
        navigate(`/student/${userId1}/messages`);
      }, 1000);
    } catch (error) {
      console.error('Error with conversation:', error);
      setError('Failed to prepare conversation');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg border border-border">
        <h3 className="text-sm font-medium mb-2">Fix Conversation</h3>
        <Button
          onClick={handleCreateConversation}
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
            'Create Nimali-Ranjith Conversation'
          )}
        </Button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        {success && <p className="text-xs text-green-500 mt-2">{success}</p>}
      </div>
    </div>
  );
}

