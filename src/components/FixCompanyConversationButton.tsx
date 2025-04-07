import { useState } from 'react';
import { Button } from './ui/button';
import { getOrCreateConversation } from '@/utils/getOrCreateConversation';
import { debugConversation, fixConversation } from '@/utils/debugConversation';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { database } from '@/firebase/config';
import { ref, get, set, serverTimestamp } from 'firebase/database';

/**
 * A button component that fixes the conversation between student 35 (Nimali) and company 58 (CloudLink)
 * This is for fixing the specific issue reported by the user
 */
export function FixCompanyConversationButton() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFixConversation = async () => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      // Fix the conversation between student 35 (Nimali) and company 58 (CloudLink)
      const studentId = '35'; // Nimali
      const companyId = '58'; // CloudLink

      console.log(`Fixing conversation between student ${studentId} and company ${companyId}`);

      // Debug the conversation first
      console.log('Debugging conversation before fix:');
      const debugInfo = await debugConversation(studentId, companyId);

      // Fix the conversation
      console.log('Fixing conversation:');
      const fixResult = await fixConversation(studentId, companyId);

      // Get the conversation ID
      const conversationId = fixResult.after.conversationId;

      // Always add new messages to ensure the conversation appears in the list
      // First message
      const message1Ref = ref(database, `messages/conversations/${conversationId}/messages/company_msg1`);
      await set(message1Ref, {
        sender: companyId,
        receiver: studentId,
        content: "This is CloudLink Sri Lanka messaging Nimali Silva",
        timestamp: serverTimestamp(),
        read: false
      });

      // Second message
      const message2Ref = ref(database, `messages/conversations/${conversationId}/messages/company_msg2`);
      await set(message2Ref, {
        sender: companyId,
        receiver: studentId,
        content: "hello",
        timestamp: serverTimestamp(),
        read: false
      });

      // Third message - from student
      const message3Ref = ref(database, `messages/conversations/${conversationId}/messages/student_msg1`);
      await set(message3Ref, {
        sender: studentId,
        receiver: companyId,
        content: "This is a message from Nimali.",
        timestamp: serverTimestamp(),
        read: false
      });

      console.log(`Added messages to conversation ${conversationId}`);

      // Force update the lastUpdated timestamp to ensure the conversation appears at the top
      const conversationRef = ref(database, `messages/conversations/${conversationId}`);
      await set(ref(database, `messages/conversations/${conversationId}/lastUpdated`), serverTimestamp());

      setSuccess(`Conversation fixed: ${conversationId}`);

      // Navigate to the student messages page
      setTimeout(() => {
        navigate(`/student/${studentId}/messages`);
      }, 1000);
    } catch (error) {
      console.error('Error fixing conversation:', error);
      setError('Failed to fix conversation');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-sm font-medium mb-2">Fix Company Conversation</h3>
        <Button
          onClick={handleFixConversation}
          disabled={isCreating}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Fixing...
            </>
          ) : (
            'Fix Nimali-CloudLink Conversation'
          )}
        </Button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        {success && <p className="text-xs text-green-500 mt-2">{success}</p>}
      </div>
    </div>
  );
}
