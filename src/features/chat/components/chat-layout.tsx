import { useState, useEffect } from 'react';
import { ChatList } from '../components/chat-list';
import { ChatDetail } from '../components/chat-detail';
import { database } from '@/firebase/config';
import { ref, get } from 'firebase/database';
import { fetchUserInfo } from '@/utils/fetchUserInfo';
import { stripHtmlTags } from '@/lib/utils';

interface ChatLayoutProps {
  userID?: string;
}

export function ChatLayout({ userID }: ChatLayoutProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<{
    id: string;
    name: string;
    image?: string;
    type: 'user' | 'company';
    subtitle?: string;
  } | null>(null);
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
          const userInfo = await fetchUserInfo(otherUserId);
          console.log(`ChatLayout: Fetched user info for ${otherUserId}:`, userInfo);

          setReceiver({
            id: userInfo.id,
            name: userInfo.name,
            image: userInfo.image,
            type: userInfo.type === 'company' ? 'company' : 'user',
            subtitle: userInfo.type === 'company' && userInfo.subtitle ? stripHtmlTags(userInfo.subtitle) : userInfo.subtitle
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

