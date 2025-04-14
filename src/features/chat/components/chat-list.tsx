import { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { Chat } from '../lib/types';
import { cn, formatShortDate } from '../lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/firebase/config';
import { ref, onValue } from 'firebase/database';
import { Loader2, User } from 'lucide-react';
import { fetchUserInfo } from '@/utils/fetchUserInfo';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChat: string | null;
  userID?: string;
}

export function ChatList({ onSelectChat, selectedChat, userID }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Function to handle the messagesRead event
  useEffect(() => {
    const handleMessagesRead = (event: Event) => {
      const { conversationId, messageIds } = (event as CustomEvent).detail;
      console.log('Messages read event received:', { conversationId, messageIds });

      // Update the unread count for the affected chat
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === conversationId) {
            console.log(`Updating unread count for chat ${chat.id} from ${chat.unread} to 0`);
            return { ...chat, unread: 0 };
          }
          return chat;
        });
      });
    };

    // Add event listener for messagesRead event
    window.addEventListener('messagesRead', handleMessagesRead);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('messagesRead', handleMessagesRead);
    };
  }, []);

  useEffect(() => {
    if (!userID) return;

    setIsLoading(true);
    console.log('Fetching conversations for user ID:', userID);

    try {
      // Listen for all conversations where the current user is involved
      const conversationsRef = ref(database, 'messages/conversations');

      const unsubscribe = onValue(conversationsRef, async (snapshot) => {
        const data = snapshot.val();
        console.log('Firebase conversations data:', data);

        if (!data) {
          console.log('No conversations found in Firebase');
          setChats([]);
          setIsLoading(false);
          return;
        }

        // Filter conversations where the current user is a participant
        const userConversations = Object.entries(data)
          .filter(([convoId, convoData]) => {
            const convo = convoData as any;
            // Enhanced logging for participants structure
            console.log(`Conversation ${convoId} participants:`, convo.participants);

            // Check if user is a participant in the conversation
            const hasUser = convo.participants && convo.participants[userID];
            console.log(`Conversation ${convoId} has user ${userID} in participants:`, hasUser);

            // Check if the conversation ID contains the user ID (as a fallback)
            const userIdsInConvoId = convoId.split('_');
            const userIdInConvoId = userIdsInConvoId.includes(userID);
            console.log(`Conversation ${convoId} has user ${userID} in ID:`, userIdInConvoId);

            // Log more details about the conversation for debugging
            console.log(`Conversation ${convoId} details:`, {
              participants: convo.participants ? Object.keys(convo.participants) : [],
              hasMessages: convo.messages ? Object.keys(convo.messages).length > 0 : false,
              messageCount: convo.messages ? Object.keys(convo.messages).length : 0,
              createdAt: convo.createdAt,
              lastUpdated: convo.lastUpdated
            });

            // Include the conversation if either the user is in participants OR the user ID is in the conversation ID
            return hasUser || userIdInConvoId;
          });

        // Map conversations to chat objects
        const chatPromises = userConversations.map(async ([convoId, convoData]) => {
          const convo = convoData as any;
          const participants = convo.participants || {};

          // Find the other participant (not the current user)
          const otherUserId = Object.keys(participants).find(id => id !== userID);
          if (!otherUserId) return null;

          // Get the last message
          const messages = convo.messages || {};

          // Check if there are any messages
          const hasMessages = Object.keys(messages).length > 0;

          // Get the last message if there are any
          const lastMessageObj = hasMessages ?
            Object.values(messages).sort((a: any, b: any) => {
              return (b.timestamp || 0) - (a.timestamp || 0);
            })[0] as any :
            { content: 'No messages yet', timestamp: convo.createdAt || Date.now() };

          // Count unread messages
          const unreadCount = hasMessages ?
            Object.values(messages).filter((msg: any) => {
              return msg.sender === otherUserId && !msg.read;
            }).length :
            0;

          // Get user info using our utility function
          try {
            const userInfo = await fetchUserInfo(otherUserId);
            console.log(`ChatList: Fetched user info for ${otherUserId}:`, userInfo);

            return {
              id: convoId,
              name: userInfo.name,
              lastMessage: lastMessageObj.content || 'No messages yet',
              timestamp: lastMessageObj.timestamp ? new Date(lastMessageObj.timestamp).toISOString() : new Date().toISOString(),
              unread: unreadCount,
              avatar: userInfo.image,
            };
          } catch (error) {
            console.error(`Error fetching user info for ${otherUserId}:`, error);

            // Fallback to basic info if fetch fails
            let otherUserName = `User ${otherUserId}`;

            // Special case for our specific users (as fallback)
            if (otherUserId === '33') {
              otherUserName = 'Ranjith';
            } else if (otherUserId === '35') {
              otherUserName = 'Nimali';
            }

            console.log(`Resolved user ${otherUserId} to fallback name: ${otherUserName}`);

            return {
              id: convoId,
              name: otherUserName,
              lastMessage: lastMessageObj.content || 'No messages yet',
              timestamp: lastMessageObj.timestamp ? new Date(lastMessageObj.timestamp).toISOString() : new Date().toISOString(),
              unread: unreadCount,
              avatar: undefined,
            };
          }
        });

        // Wait for all promises to resolve
        const resolvedChats = (await Promise.all(chatPromises))
          .filter(Boolean) as Chat[];

        // Sort by timestamp (newest first)
        resolvedChats.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        setChats(resolvedChats);
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up conversations listener:', error);
      setError('Failed to connect to chat service');
      setIsLoading(false);
      return () => {};
    }
  }, [user, userID]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4 text-brand">Messages</h2>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="divide-y">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4">
                <div className="relative">
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        ) : filteredChats.length > 0 ? (
          <div className="divide-y">
            {filteredChats.map(chat => (
              <ChatItem
                key={chat.id}
                chat={chat}
                onClick={() => onSelectChat(chat.id)}
                isSelected={chat.id === selectedChat}
              />
            ))}
          </div>
        ) : (
          <div>
            <div className="flex h-32 items-center justify-center p-4">
              <p className="text-muted-foreground text-center">
                {searchQuery ? 'No chats found. Try a different search term.' : 'No conversations yet.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatItemProps {
  chat: Chat;
  onClick: () => void;
  isSelected: boolean;
}

function ChatItem({ chat, onClick, isSelected }: ChatItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 cursor-pointer hover:bg-accent",
        isSelected && "bg-secondary-light"
      )}
      onClick={onClick}
    >
      <div className="relative">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {chat.avatar ? (
            <img src={chat.avatar} alt={chat.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-medium">{chat.name.charAt(0)}</span>
          )}
        </div>
        {chat.unread > 0 && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-brand flex items-center justify-center">
            <span className="text-xs font-bold text-white">{chat.unread}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="font-medium truncate">{chat.name}</h3>
          <span className="text-xs text-muted-foreground">{formatShortDate(chat.timestamp)}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
      </div>
    </div>
  );
}


