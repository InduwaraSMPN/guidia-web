import { ChatLayout } from '../features/chat/components/chat-layout';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export function CounselorMessagesPage() {
  const { userID } = useParams<{ userID: string }>();
  const { user } = useAuth();

  // Verify that the user is accessing their own messages
  useEffect(() => {
    if (userID && user && userID !== user.userID) {
      console.warn('User attempting to access messages of another user');
    }
  }, [userID, user]);

  return (
    <div className="h-[calc(100vh-64px)] bg-white pt-32 pb-32">
      <div className="max-w-[1216px] h-full mx-auto border border-border rounded-lg overflow-hidden">
        <ChatLayout userID={userID} />
      </div>
    </div>
  );
}

