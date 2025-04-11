import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../firebase/config';
import { ref, onValue } from 'firebase/database';
import { User, MessageCircle, Clock } from 'lucide-react';
// axios is no longer needed as we're using fetchUserInfo
import { formatDistanceToNow } from 'date-fns';
import { getNewMessageUrl } from '../utils/messageUrlUtils';
import { fetchUserInfo } from '../utils/fetchUserInfo';

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  userType: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
}

export function ConversationsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Listen for all conversations where the current user is involved
      const conversationsRef = ref(database, 'messages/conversations');

      const unsubscribe = onValue(conversationsRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      // Process conversations
      const conversationPromises = Object.entries(data).map(async ([convoId, convoData]: [string, any]) => {
        // Skip if no messages
        if (!convoData.messages) return null;

        // Extract the other user's ID from the conversation ID
        const userIds = convoId.split('_');
        const otherUserId = userIds[0] === user.userID ? userIds[1] : userIds[0];

        // Skip if this isn't a conversation involving the current user
        if (!userIds.includes(user.userID)) return null;

        // Get user info using our utility function
        let userInfo: any;
        try {
          const fetchedUserInfo = await fetchUserInfo(otherUserId);
          console.log(`ConversationsList: Fetched user info for ${otherUserId}:`, fetchedUserInfo);

          userInfo = {
            studentName: fetchedUserInfo.type === 'student' ? fetchedUserInfo.name : undefined,
            counselorName: fetchedUserInfo.type === 'counselor' ? fetchedUserInfo.name : undefined,
            companyName: fetchedUserInfo.type === 'company' ? fetchedUserInfo.name : undefined,
            studentProfileImagePath: fetchedUserInfo.type === 'student' ? fetchedUserInfo.image : undefined,
            counselorProfileImagePath: fetchedUserInfo.type === 'counselor' ? fetchedUserInfo.image : undefined,
            companyLogoPath: fetchedUserInfo.type === 'company' ? fetchedUserInfo.image : undefined
          };
        } catch (error) {
          console.error(`Error fetching user info for ${otherUserId}:`, error);
          userInfo = { name: 'Unknown User' };
        }

        // Process messages
        const messages = convoData.messages ? Object.values(convoData.messages) as any[] : [];

        // Check if there are any messages
        const hasMessages = messages.length > 0;

        // Sort messages by timestamp if there are any
        if (hasMessages) {
          messages.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
        }

        // Get last message or use a placeholder
        const lastMessage = hasMessages ?
          messages[0] as any :
          { content: 'No messages yet', timestamp: convoData.createdAt || Date.now() };

        // Count unread messages
        const unreadCount = hasMessages ?
          messages.filter((msg: any) =>
            msg.receiver === user.userID && !msg.read
          ).length :
          0;

        return {
          id: convoId,
          userId: otherUserId,
          userName: userInfo.studentName || userInfo.companyName || userInfo.counselorName || 'Unknown User',
          userImage: userInfo.studentProfileImagePath || userInfo.companyLogoPath || userInfo.counselorProfileImagePath,
          userType: userInfo.studentName ? 'student' : userInfo.companyName ? 'company' : 'counselor',
          lastMessage: lastMessage?.content || 'No messages yet',
          timestamp: lastMessage?.timestamp || convoData.createdAt || Date.now(),
          unreadCount
        };
      });

      // Wait for all promises to resolve
      const resolvedConversations = (await Promise.all(conversationPromises))
        .filter(Boolean) as Conversation[];

      // Sort by timestamp (newest first)
      resolvedConversations.sort((a, b) => b.timestamp - a.timestamp);

      setConversations(resolvedConversations);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching conversations:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up conversations listener:', error);
      setIsLoading(false);
      return () => {};
    }
  }, [user]);

  const handleConversationClick = (conversation: Conversation) => {
    if (!user) return;

    // Use the utility function to generate the correct URL
    const newPath = getNewMessageUrl(
      user.userType,
      user.userID,
      conversation.userId,
      conversation.userType
    );

    console.log(`ConversationsList: Navigating to conversation with ${conversation.userId}`);
    console.log(`- URL: ${newPath}`);

    navigate(newPath);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary pt-20 pb-6">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border">
            <div className="p-4 border-b">
              <h1 className="text-xl font-semibold text-adaptive-dark">Messages</h1>
            </div>
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-12 h-12 bg-secondary-dark rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary-dark rounded w-1/3"></div>
                    <div className="h-3 bg-secondary-dark rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pt-20 pb-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold text-adaptive-dark">Messages</h1>
          </div>

          {conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="font-medium">No conversations yet</p>
              <p className="text-sm mt-1">Start chatting with students, companies, or counselors</p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-4 hover:bg-secondary cursor-pointer transition-colors duration-150"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="flex items-start gap-3">
                    {conversation.userImage ? (
                      <img
                        src={conversation.userImage}
                        alt={conversation.userName}
                        className={`${
                          conversation.userType === "company"
                            ? "w-12 h-10 object-contain"
                            : "w-12 h-12 object-cover rounded-full border border-border"
                        }`}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-secondary-light rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-adaptive-dark truncate">
                          {conversation.userName}
                        </h3>
                        <span className="text-xs text-muted-foreground flex items-center whitespace-nowrap ml-2">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(conversation.timestamp, { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <div className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


