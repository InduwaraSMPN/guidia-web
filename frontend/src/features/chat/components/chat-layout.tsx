import { useState, useEffect } from 'react';
import { ChatList } from '../components/chat-list';
import { ChatDetail } from '../components/chat-detail';
import { database } from '@/firebase/config';
import { ref, get } from 'firebase/database';
import { fetchUserInfo } from '@/utils/fetchUserInfo';
import { stripHtmlTags } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'react-router-dom';

interface ChatLayoutProps {
  userID?: string;
}

export function ChatLayout({ userID }: ChatLayoutProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<{
    id: string;
    name: string;
    image?: string;
    type: 'student' | 'counselor' | 'company' | 'admin';
    subtitle?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the user type from the URL query parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userTypeFromUrl = queryParams.get('type');

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  // We use the userID prop passed from the parent component

  // Get receiver info when a chat is selected
  useEffect(() => {
    if (!selectedChat || !database || !userID) {
      setReceiver(null);
      return;
    }

    console.log(`Getting receiver info for chat ${selectedChat} and user ${userID}`);

    const getReceiverInfo = async () => {
      try {
        // Get conversation participants
        const conversationRef = ref(database, `messages/conversations/${selectedChat}/participants`);
        const snapshot = await get(conversationRef);
        const participants = snapshot.val() || {};
        console.log('Conversation participants:', participants);

        // Find the other participant (not the current user)
        const otherUserId = Object.keys(participants).find(id => id !== userID);
        console.log('Other user ID:', otherUserId);
        if (!otherUserId) {
          setReceiver(null);
          return;
        }

        // Fetch user info using our utility function
        try {
          // If we have a user type from the URL, pass it to fetchUserInfo
          const userInfo = await fetchUserInfo(otherUserId, userTypeFromUrl || undefined);
          console.log(`ChatLayout: Fetched user info for ${otherUserId} with type ${userTypeFromUrl || 'auto-detected'}:`, userInfo);

          setReceiver({
            id: userInfo.id,
            name: userInfo.name,
            image: userInfo.image,
            type: userInfo.type, // Use the exact type from userInfo
            subtitle: userInfo.subtitle ? stripHtmlTags(userInfo.subtitle) : undefined
          });
        } catch (fetchError) {
          console.error(`Error fetching user info for ${otherUserId}:`, fetchError);
          // Fallback to basic info if fetch fails
          setReceiver({
            id: otherUserId,
            name: `User ${otherUserId}`,
            type: 'user'
          });
        }
      } catch (error) {
        console.error('Error getting receiver info:', error);
        setReceiver(null);
      }
    };

    getReceiverInfo();
  }, [selectedChat, userID]);

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="flex flex-1 overflow-hidden">
          {/* Chat List Skeleton */}
          <div className="w-80 border-r">
            <div className="p-4 border-b">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
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
          </div>

          {/* Chat Detail Skeleton */}
          <div className="flex-1">
            <div className="flex h-full flex-col">
              {/* Header Skeleton */}
              <div className="flex items-center gap-4 border-b p-4 bg-white">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>

              {/* Messages Skeleton */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6 p-4">
                  {/* Date divider skeleton */}
                  <div className="flex justify-center my-4">
                    <Skeleton className="h-6 w-32 rounded-full" />
                  </div>

                  {/* Message bubbles skeletons */}
                  <div className="flex items-end gap-2 justify-start">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="space-y-2">
                      <Skeleton className="h-24 w-64 rounded-lg" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>

                  <div className="flex items-end gap-2 justify-end">
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-56 rounded-lg" />
                      <div className="flex justify-end">
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Skeleton */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Skeleton className="flex-1 h-10 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-1 overflow-hidden">
        <div className={`w-80 border-r ${selectedChat ? 'hidden md:block' : 'block'}`}>
          <ChatList onSelectChat={setSelectedChat} selectedChat={selectedChat} userID={userID} />
        </div>
        <div className={`flex-1 ${!selectedChat ? 'hidden md:block' : 'block'}`}>
          {selectedChat ? (
            <ChatDetail
              chatId={selectedChat}
              onBack={() => setSelectedChat(null)}
              receiver={receiver || undefined}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

