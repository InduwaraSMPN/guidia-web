import { ChatLayout } from '../../features/chat/components/chat-layout';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminMessagesPage() {
  const { userID } = useParams<{ userID: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Verify that the user is accessing their own messages
  useEffect(() => {
    if (userID && user && userID !== user.userID) {
      console.warn('User attempting to access messages of another user');
    }
  }, [userID, user]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-6 mt-32 mb-32 max-w-[1216px] mx-auto">
        <div className="h-[calc(100vh-200px)] border border-border rounded-lg overflow-hidden bg-card">
          <div className="flex h-full">
            {/* Sidebar Skeleton */}
            <div className="w-1/3 border-r border-border p-4">
              <Skeleton className="h-10 w-full mb-4" />
              <div className="space-y-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area Skeleton */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {/* Left message */}
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div>
                      <Skeleton className="h-12 w-48 rounded-2xl rounded-tl-none" />
                      <Skeleton className="h-3 w-16 mt-1 ml-2" />
                    </div>
                  </div>

                  {/* Right message */}
                  <div className="flex items-start gap-2 max-w-[80%] ml-auto">
                    <div className="flex flex-col items-end">
                      <Skeleton className="h-12 w-32 rounded-2xl rounded-tr-none" />
                      <Skeleton className="h-3 w-16 mt-1 mr-2" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  </div>

                  {/* Left message */}
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div>
                      <Skeleton className="h-12 w-64 rounded-2xl rounded-tl-none" />
                      <Skeleton className="h-3 w-16 mt-1 ml-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <Skeleton className="h-12 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 mt-32 mb-32 max-w-[1216px] mx-auto">
      <div className="h-[calc(100vh-200px)] border border-border rounded-lg overflow-hidden">
        <ChatLayout userID={userID} />
      </div>
    </div>
  );
}

export default AdminMessagesPage;

