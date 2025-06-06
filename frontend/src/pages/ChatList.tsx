import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Loader2, User, CheckCheck, Clock } from 'lucide-react';
import { toast } from '../components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatParticipant {
  userId: string;
  name: string;
  profileImage?: string;
  userType: 'student' | 'counselor' | 'company';
}

interface ChatPreview {
  userId: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  image?: string;
  type: 'student' | 'counselor' | 'company';
  unreadCount?: number;
  participantInfo?: ChatParticipant;
}

export function ChatList() {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.userType) return;

      try {
        const token = localStorage.getItem('token');
        const userTypePath = user.userType.toLowerCase();
        const response = await axios.get(`/api/${userTypePath}/messages/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const chatsWithDetails = await Promise.all(
          response.data.map(async (chat: ChatPreview) => {
            try {
              let endpoint;
              switch (chat.type) {
                case 'counselor':
                  endpoint = `/api/counselors/profile/${chat.userId}`;
                  break;
                case 'student':
                  endpoint = `/api/students/${chat.userId}`;
                  break;
                case 'company':
                  endpoint = `/api/companies/${chat.userId}`;
                  break;
                default:
                  throw new Error(`Invalid user type: ${chat.type}`);
              }

              const profileResponse = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
              });

              return {
                ...chat,
                participantInfo: profileResponse.data
              };
            } catch (error) {
              console.error('Error fetching participant details:', error);
              return chat;
            }
          })
        );

        setChats(chatsWithDetails);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load chats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages/mark-all-read', null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Update local state to clear unread counts
      setChats(chats.map(chat => ({ ...chat, unreadCount: 0 })));
      toast.success('All messages marked as read');
    } catch (error) {
      console.error('Error marking messages as read:', error);
      toast.error('Failed to mark messages as read');
    }
  };

  const totalUnreadCount = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);

  const handleChatClick = (chat: ChatPreview) => {
    if (!user?.userType) {
      console.error('User type is missing');
      return;
    }
    const userTypePath = user.userType.toLowerCase();
    navigate(`/${userTypePath}/messages/${chat.userId}?type=${chat.type}`);
  };

  return (
    <div className="min-h-screen bg-secondary pt-32 pb-32 pb-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg border border-border">
          <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-adaptive-dark">Messages</h3>
              {totalUnreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-brand hover:text-brand-dark flex items-center gap-1"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {error ? (
            <div className="p-4 text-red-600 text-center">
              {error}
            </div>
          ) : isLoading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-secondary-light flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <p>No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start a conversation from profiles
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {chats.map((chat) => (
                <div
                  key={chat.userId}
                  onClick={() => handleChatClick(chat)}
                  className="p-4 hover:bg-secondary-light cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {chat.image ? (
                      <img
                        src={chat.image}
                        alt={chat.name}
                        className={`${
                          chat.type === 'company'
                            ? 'w-12 h-10 object-contain'
                            : 'w-12 h-12 object-cover rounded-full'
                        } border border-border`}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-secondary-light rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="font-medium text-adaptive-dark truncate">
                          {chat.name || 'Unknown User'}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(chat.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unreadCount ? (
                      <div className="ml-2 bg-brand text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    ) : null}
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











