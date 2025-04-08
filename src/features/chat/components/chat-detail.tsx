import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, User, Loader2 } from 'lucide-react';
import { Message } from '../lib/types';
import { cn, formatTimeOnly, groupMessagesByDate } from '../lib/utils';
import { stripHtmlTags } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { database } from '@/firebase/config';
import { ref, onValue } from 'firebase/database';
import { useParams } from 'react-router-dom';
import { getOrCreateConversation } from '@/utils/getOrCreateConversation';
import { fetchUserInfo } from '@/utils/fetchUserInfo';

interface ChatDetailProps {
  chatId: string;
  onBack: () => void;
  receiver?: {
    id: string;
    name: string;
    image?: string;
    type: 'user' | 'company';
    subtitle?: string;
  };
}

export function ChatDetail({ chatId, onBack, receiver }: ChatDetailProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(receiver);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { sendMessage, listenToMessages, markMessagesAsRead, isFirebaseReady } = useFirebase();
  const { userID } = useParams<{ userID: string }>();

  // Log important information for debugging
  useEffect(() => {
    console.log('ChatDetail component:', {
      chatId,
      userID,
      authUser: user?.userID,
      isFirebaseReady
    });
  }, [chatId, userID, user, isFirebaseReady]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get receiver info if not provided
  useEffect(() => {
    if (receiver) {
      setReceiverInfo(receiver);
      return;
    }

    if (!chatId || !database) return;

    try {
      // Get conversation participants
      const conversationRef = ref(database, `messages/conversations/${chatId}/participants`);
      const unsubscribe = onValue(conversationRef, async (snapshot) => {
        const participants = snapshot.val() || {};

        // Find the other participant (not the current user from URL)
        const otherUserId = Object.keys(participants).find(id => id !== userID);
        console.log('Participants:', participants, 'Current user:', userID, 'Other user:', otherUserId);
        if (!otherUserId) return;

        try {
          // Fetch user info using our utility function
          const userInfo = await fetchUserInfo(otherUserId);
          console.log(`Fetched user info for ${otherUserId}:`, userInfo);

          // Update receiver info with fetched data
          setReceiverInfo({
            id: userInfo.id,
            name: userInfo.name,
            image: userInfo.image,
            type: userInfo.type === 'company' ? 'company' : 'user',
            subtitle: userInfo.type === 'company' && userInfo.subtitle ? stripHtmlTags(userInfo.subtitle) : userInfo.subtitle
          });
        } catch (error) {
          console.error(`Error fetching user info for ${otherUserId}:`, error);
          // Fallback to basic info if fetch fails
          setReceiverInfo({
            id: otherUserId,
            name: `User ${otherUserId}`,
            type: 'user'
          });
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error getting receiver info:', error);
    }
  }, [chatId, receiver, userID]);

  // Listen for messages
  useEffect(() => {
    if (!chatId || !isFirebaseReady) {
      return () => {};
    }

    setIsLoading(true);

    try {
      const unsubscribe = listenToMessages(chatId, (firebaseMessages) => {
        console.log('Received messages:', firebaseMessages);
        const formattedMessages = firebaseMessages.map(msg => ({
          id: msg.messageID || msg.id,
          content: msg.message || msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : new Date().toISOString(),
          sender: msg.senderID || msg.sender,
          isCurrentUser: (msg.senderID || msg.sender) === userID,
          read: msg.read || false,
          messageID: msg.messageID || msg.id
        }));

        console.log('Formatted messages:', formattedMessages);
        setMessages(formattedMessages);
        setIsLoading(false);

        // Mark unread messages as read
        const unreadMessages = firebaseMessages
          .filter(msg => !msg.isSender && !msg.read && msg.receiverID === userID)
          .map(msg => msg.messageID);

        if (unreadMessages.length > 0) {
          console.log('Marking messages as read:', unreadMessages);
          markMessagesAsRead(chatId, unreadMessages)
            .then(() => {
              console.log('Messages marked as read successfully');
              // Dispatch a custom event to notify other components that messages have been read
              window.dispatchEvent(new CustomEvent('messagesRead', {
                detail: { conversationId: chatId, messageIds: unreadMessages }
              }));
            })
            .catch(error => {
              console.error('Error marking messages as read:', error);
            });
        }
      }, userID); // Pass the userID parameter here

      return () => unsubscribe();
    } catch (error) {
      console.error('Error listening to messages:', error);
      setError('Failed to load messages');
      setIsLoading(false);
      return () => {};
    }
  }, [chatId, isFirebaseReady, listenToMessages, userID]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !userID || !receiverInfo || !chatId) return;

    setIsSending(true);

    try {
      // Ensure the conversation exists before sending a message
      await getOrCreateConversation(userID, receiverInfo.id);

      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        timestamp: new Date().toISOString(),
        sender: userID,
        isCurrentUser: true,
      };

      console.log('Adding optimistic message:', optimisticMessage);
      setMessages([...messages, optimisticMessage]);
      setNewMessage('');

      // Send message to Firebase with the URL user ID
      await sendMessage(chatId, receiverInfo.id, newMessage, userID);
    } catch (error) {
      console.error('Error sending message:', error);
      // Could add error handling here, like showing a retry button
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b p-4 bg-white">
        <button
          onClick={onBack}
          className="md:hidden rounded-full p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 flex-1">
          {receiver?.image ? (
            <img
              src={receiver.image}
              alt={receiver.name}
              className={`${
                receiver.type === 'company'
                  ? 'w-10 h-10 object-cover rounded-full border border-gray-200 shadow-sm'
                  : 'w-10 h-10 object-cover rounded-full border border-gray-200 shadow-sm'
              }`}
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-gray-900 truncate">
              {receiver?.name || 'Unknown User'}
            </h2>
            {receiver?.subtitle && (
              <p className="text-sm text-gray-500 truncate">
                {receiver.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        ) : messages.length > 0 ? (
          <>
            {groupMessagesByDate(messages).map((group) => (
              <div key={group.date} className="space-y-3 mb-6">
                {/* Date divider */}
                <div className="flex justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-4 py-1.5 rounded-full font-medium">
                    {group.date}
                  </div>
                </div>

                {/* Messages for this date */}
                {group.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    receiverImage={receiverInfo?.image}
                    receiverName={receiverInfo?.name}
                  />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#800020] transition-all duration-200"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending || !isFirebaseReady || !receiverInfo}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#800020] text-white disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  receiverImage?: string;
  receiverName?: string;
}

function MessageBubble({ message, receiverImage, receiverName }: MessageBubbleProps) {
  // Debug message content
  console.log('Rendering message bubble:', message);

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        message.isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Show avatar only for non-current user messages */}
      {!message.isCurrentUser && (
        <div className="h-8 w-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-gray-200">
          {receiverImage ? (
            <img src={receiverImage} alt="Sender" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-medium">{(receiverName || 'U').charAt(0)}</span>
          )}
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          message.isCurrentUser
            ? "bg-[#800020] text-white"
            : "bg-gray-100"
        )}
      >
        {message.content ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <p className="text-gray-400 italic">Empty message</p>
        )}
        <p className={cn(
          "text-xs mt-1",
          message.isCurrentUser
            ? "text-white/80"
            : "text-gray-500"
        )}>
          {formatTimeOnly(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

