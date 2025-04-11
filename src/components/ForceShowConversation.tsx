import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { database } from '@/firebase/config';
import { ref, get, onValue } from 'firebase/database';
import { getConversationId } from '@/utils/conversationUtils';
import { useNavigate } from 'react-router-dom';

/**
 * A component that forces the display of a specific conversation
 * This is for fixing the specific issue with the conversation between users 35 and 58
 */
export function ForceShowConversation() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationData, setConversationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Specific user IDs for the conversation we want to fix
  const studentId = '35'; // Nimali
  const companyId = '58'; // CloudLink
  const conversationId = getConversationId(studentId, companyId);

  // Load conversation data on mount
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const conversationRef = ref(database, `messages/conversations/${conversationId}`);
        const snapshot = await get(conversationRef);
        
        if (snapshot.exists()) {
          setConversationData(snapshot.val());
        } else {
          setError('Conversation not found');
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation');
      }
    };
    
    loadConversation();
    
    // Also set up a listener for real-time updates
    const conversationRef = ref(database, `messages/conversations/${conversationId}`);
    const unsubscribe = onValue(conversationRef, (snapshot) => {
      if (snapshot.exists()) {
        setConversationData(snapshot.val());
        setError(null);
      } else {
        setError('Conversation not found');
      }
    });
    
    return () => unsubscribe();
  }, [conversationId]);

  const handleViewConversation = () => {
    setIsLoading(true);
    navigate(`/student/${studentId}/messages/${companyId}?type=company`);
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-36 right-4 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg border border-border max-w-md">
        <h3 className="text-sm font-medium mb-2">Nimali-CloudLink Conversation</h3>
        
        {error ? (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        ) : conversationData ? (
          <div className="text-xs mb-2 max-h-32 overflow-auto">
            <p><strong>ID:</strong> {conversationId}</p>
            <p><strong>Participants:</strong> {conversationData.participants ? Object.keys(conversationData.participants).join(', ') : 'None'}</p>
            <p><strong>Messages:</strong> {conversationData.messages ? Object.keys(conversationData.messages).length : 0}</p>
            {conversationData.messages && (
              <div className="mt-1 pl-2 border-l-2 border-border">
                {Object.entries(conversationData.messages).map(([id, msg]: [string, any]) => (
                  <p key={id} className="truncate">
                    <strong>{msg.sender === studentId ? 'Nimali' : 'CloudLink'}:</strong> {msg.content}
                  </p>
                )).slice(0, 3)}
                {Object.keys(conversationData.messages).length > 3 && (
                  <p className="text-muted-foreground">...and {Object.keys(conversationData.messages).length - 3} more</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mb-2">Loading conversation data...</p>
        )}
        
        <Button
          onClick={handleViewConversation}
          disabled={isLoading || !conversationData}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'View Conversation'
          )}
        </Button>
      </div>
    </div>
  );
}

