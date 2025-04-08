import { ChatLayout } from '../../features/chat/components/chat-layout';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

export function AdminMessagesPage() {
  const { userID } = useParams<{ userID: string }>();
  const { user } = useAuth();

  // Verify that the user is accessing their own messages
  useEffect(() => {
    if (userID && user && userID !== user.userID) {
      console.warn('User attempting to access messages of another user');
    }
  }, [userID, user]);

  return (
    <div className="p-6 mt-32 mb-32 max-w-[1216px] mx-auto">
      <div className="h-[calc(100vh-200px)] border border-gray-200 rounded-lg overflow-hidden">
        <ChatLayout userID={userID} />
      </div>
    </div>
  );
}

export default AdminMessagesPage;
