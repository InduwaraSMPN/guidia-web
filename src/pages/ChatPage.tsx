import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, User, Loader2 } from "lucide-react";
import { stripHtmlTags } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ChatMessage } from "../components/ChatMessage";
import { DateSeparator } from "../components/DateSeparator";
import { useAuth } from "../contexts/AuthContext";
import { useFirebase } from "../contexts/FirebaseContext";
import { getConversationId } from "../utils/conversationUtils";
import { getNewMessageUrl, isLegacyMessageUrl } from "../utils/messageUrlUtils";
import { groupMessagesByDate, formatMessageTime } from "../utils/messageUtils";
import { ref, onValue } from "firebase/database";
import { database } from "../firebase/config";
import axios from "axios";
import { toast } from "../components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AzureImage, CompanyImage, CounselorImage, StudentImage } from "@/lib/imageUtils";

interface Message {
  messageID: string;
  senderID: string;
  receiverID: string;
  message: string;
  timestamp: string;
  senderName?: string;
  senderImage?: string;
  isSender: boolean;
  read?: boolean;
  pending?: boolean; // For optimistic UI updates
}

interface ChatUser {
  id: string;
  name: string;
  image?: string;
  type: "student" | "counselor" | "company";
  subtitle?: string;
}

export function ChatPage(): JSX.Element {
  const { receiverId, userID } = useParams<{ receiverId: string; userID: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, listenToMessages, markMessagesAsRead, sendTypingIndicator, isFirebaseReady, firebaseError } = useFirebase();
  const [firebaseErrorMessage, setFirebaseErrorMessage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiver, setReceiver] = useState<ChatUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingEmitRef = useRef<number | null>(null);
  const [conversationId, setConversationId] = useState<string>("");

  // Get user type from query params if available
  const queryParams = new URLSearchParams(location.search);
  const userType = queryParams.get("type") || "";

  useEffect(() => {
    if (!user || !receiverId) {
      navigate("/");
      return;
    }

    // Handle both URL formats
    // If userID is missing or we detect the legacy URL format, redirect to the new format
    if (!userID || isLegacyMessageUrl(location.pathname)) {
      console.log('ChatPage: Using legacy URL format, redirecting to new format');
      const newPath = getNewMessageUrl(user.userType, user.userID, receiverId, userType || undefined);
      console.log(`ChatPage: Redirecting to ${newPath}`);
      navigate(newPath, { replace: true });
      return;
    }

    // Verify that the user is accessing their own messages
    if (userID !== user.userID) {
      console.warn('User attempting to access messages of another user');
      navigate(`/${user.userType.toLowerCase()}/${user.userID}/messages/${receiverId}?type=${userType}`);
      return;
    }

    console.log(`ChatPage: Using conversation between ${user.userID} and ${receiverId}`);
    console.log(`URL format: /${user.userType.toLowerCase()}/${user.userID}/messages/${receiverId}?type=${userType}`);

    // Prevent chatting with self
    if (user.userID === receiverId) {
      toast.error("You cannot chat with yourself");
      navigate("/chat");
      return;
    }

    // Generate conversation ID
    const convoId = getConversationId(user.userID, receiverId);
    setConversationId(convoId);

    // Fetch receiver info based on type
    const fetchReceiverInfo = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        let endpoint = "";

        // Convert userType to lowercase and handle empty case
        const type = userType?.toLowerCase() || "";

        switch (type) {
          case "student":
            endpoint = `/api/students/profile/${receiverId}`;
            break;
          case "counselor":
            endpoint = `/api/counselors/profile/${receiverId}`;
            break;
          case "company":
            endpoint = `/api/companies/profile/${receiverId}`;
            break;
          default:
            console.error("Invalid or missing user type:", userType);
            return;
        }

        if (!endpoint) {
          console.error("No endpoint constructed due to invalid user type");
          return;
        }

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data as any;

        // Handle different profile data structures
        setReceiver({
          id: receiverId || '',
          name:
            data.studentName ||
            data.counselorName ||
            data.companyName ||
            "Unknown User",
          image:
            data.studentProfileImagePath ||
            data.counselorProfileImagePath ||
            data.companyLogoPath,
          type: type as "student" | "counselor" | "company",
          subtitle:
            data.studentLevel ||
            data.counselorPosition ||
            (data.companyDescription ? stripHtmlTags(data.companyDescription) : "") ||
            "",
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.error("User profile not found:", receiverId);
        } else {
          console.error("Error fetching receiver info:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceiverInfo();
  }, [user, receiverId, userType, navigate]);

  // Initial messages will be loaded from Firebase

  // Listen for messages using Firebase
  useEffect(() => {
    if (!conversationId) return;

    // Set up listener for messages
    const unsubscribe = listenToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);

      // Mark unread messages as read
      const unreadMessages = newMessages
        .filter(msg => !msg.isSender && !msg.read)
        .map(msg => msg.messageID);

      if (unreadMessages.length > 0) {
        markMessagesAsRead(conversationId, unreadMessages).catch(console.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [conversationId, listenToMessages, markMessagesAsRead]);

  // Listen for typing indicators
  useEffect(() => {
    if (!conversationId || !receiverId) return;

    try {
      const typingRef = ref(database, `messages/conversations/${conversationId}/typing/${receiverId}`);

      const unsubscribe = onValue(typingRef, (snapshot) => {
        const typingTimestamp = snapshot.val();

        if (typingTimestamp) {
          // Check if typing was within the last 3 seconds
          const isRecentlyTyping = Date.now() - typingTimestamp < 3000;
          setIsTyping(isRecentlyTyping);

          if (isRecentlyTyping && typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        } else {
          setIsTyping(false);
        }
      });

      return () => {
        unsubscribe();
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    } catch (error) {
      console.error('Error setting up typing indicator listener:', error);
      return () => {};
    }
  }, [conversationId, receiverId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check for Firebase errors
  useEffect(() => {
    if (firebaseError) {
      setFirebaseErrorMessage(firebaseError);
    } else {
      setFirebaseErrorMessage(null);
    }
  }, [firebaseError]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || !receiver || isSending || !conversationId) return;

    // Check if Firebase is ready
    if (!isFirebaseReady) {
      toast.error("Chat service is not available right now. Please try again later.");
      return;
    }

    setIsSending(true);
    try {
      // Create a temporary message for optimistic UI update
      const tempMessage: Message = {
        messageID: `temp-${Date.now()}`,
        senderID: user.userID,
        receiverID: receiver.id,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        isSender: true,
        pending: true
      };

      // Add message to UI immediately
      setMessages((prev) => [...prev, tempMessage]);
      setMessage("");

      // Send via Firebase
      await sendMessage(conversationId, receiver.id, message.trim());

      // Focus back on input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);

      // Show a more specific error message if possible
      if ((error as any)?.message?.includes('permission')) {
        toast.error("Permission denied. The chat service is not properly configured.");
      } else {
        toast.error("Failed to send message. Please try again.");
      }

      // Remove the pending message from the UI
      setMessages(prev => prev.filter(msg => !msg.pending));
    } finally {
      setIsSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!conversationId) return;

    // Only emit typing event if we haven't recently
    if (!lastTypingEmitRef.current || Date.now() - lastTypingEmitRef.current > 2000) {
      sendTypingIndicator(conversationId, true);
      lastTypingEmitRef.current = Date.now();
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-secondary pt-20 pb-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border transition-shadow duration-300 hover:shadow-xl">
          {/* Enhanced Header with better visual hierarchy */}
          <div className="border-b p-4 sticky top-0 bg-white z-10 backdrop-blur-sm bg-white/95">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="shrink-0 rounded-full hover:bg-secondary-light transition-colors duration-200 focus:ring-2 focus:ring-gray-200"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              {isLoading ? (
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ) : receiver ? (
                <div className="flex items-center gap-3 flex-1 transition-opacity duration-200">
                  {receiver.image ? (
                    receiver.type === "company" ? (
                      <CompanyImage
                        src={receiver.image}
                        alt={receiver.name}
                        className="w-10 h-10 object-cover rounded-full border border-border shadow-sm"
                        fallbackSrc="/company-avatar.png"
                      />
                    ) : receiver.type === "counselor" ? (
                      <CounselorImage
                        src={receiver.image}
                        alt={receiver.name}
                        className="w-10 h-10 object-cover rounded-full border border-border shadow-sm"
                        fallbackSrc="/counselor-avatar.png"
                      />
                    ) : (
                      <StudentImage
                        src={receiver.image}
                        alt={receiver.name}
                        className="w-10 h-10 object-cover rounded-full border border-border shadow-sm"
                        fallbackSrc="/student-avatar.png"
                      />
                    )
                  ) : (
                    <div className="w-10 h-10 bg-secondary-light rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-adaptive-dark text-base">
                      {receiver.name}
                    </h2>
                    {receiver.subtitle && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {receiver.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <p className="text-muted-foreground">User not found</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages with improved spacing and scrolling */}
          <div className="h-[calc(100vh-250px)] flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-1 w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {firebaseErrorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-medium">Chat service error</p>
                  <p className="text-sm">{firebaseErrorMessage}</p>
                  <p className="text-xs mt-1">Please try refreshing the page or contact support.</p>
                </div>
              )}
              {isLoading ? (
                <div className="space-y-4 py-4 w-full">
                  {/* Skeleton messages - left side (receiver) */}
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div>
                      <Skeleton className="h-12 w-48 rounded-2xl rounded-tl-none" />
                      <Skeleton className="h-3 w-16 mt-1 ml-2" />
                    </div>
                  </div>

                  {/* Skeleton messages - right side (sender) */}
                  <div className="flex items-start gap-2 max-w-[80%] ml-auto">
                    <div className="flex flex-col items-end">
                      <Skeleton className="h-12 w-32 rounded-2xl rounded-tr-none" />
                      <Skeleton className="h-3 w-16 mt-1 mr-2" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  </div>

                  {/* Skeleton messages - left side (receiver) */}
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div>
                      <Skeleton className="h-12 w-64 rounded-2xl rounded-tl-none" />
                      <Skeleton className="h-3 w-16 mt-1 ml-2" />
                    </div>
                  </div>

                  {/* Skeleton messages - right side (sender) */}
                  <div className="flex items-start gap-2 max-w-[80%] ml-auto">
                    <div className="flex flex-col items-end">
                      <Skeleton className="h-12 w-56 rounded-2xl rounded-tr-none" />
                      <Skeleton className="h-3 w-16 mt-1 mr-2" />
                    </div>
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 py-10">
                  <div className="w-16 h-16 rounded-full bg-secondary-light flex items-center justify-center mb-2 shadow-inner">
                    <Send className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-center font-medium">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with {receiver?.name || "this user"}!
                  </p>
                </div>
              ) : (
                // Group messages by date and render with date separators
                groupMessagesByDate(messages).map((group) => (
                  <div key={group.date} className="space-y-3 mb-6">
                    {/* Date separator */}
                    <DateSeparator date={group.date} />

                    {/* Messages for this date */}
                    {group.messages.map((msg) => (
                      <ChatMessage
                        key={msg.messageID}
                        message={msg.message}
                        timestamp={formatMessageTime(msg.timestamp)}
                        isSender={msg.isSender}
                        senderName={msg.isSender ? undefined : msg.senderName || receiver?.name}
                        senderImage={!msg.isSender ? msg.senderImage || receiver?.image : undefined}
                        senderType={receiver?.type}
                      />
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input with micro-interactions */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t bg-white sticky bottom-0 shadow-sm"
            >
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  {isTyping && (
                    <div className="absolute -top-6 left-4 text-xs text-muted-foreground animate-pulse">
                      {receiver?.name} is typing...
                    </div>
                  )}
                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="w-full py-6 px-4 focus-visible:ring-[#800020]/30 transition-all duration-200 border-border rounded-full"
                    disabled={isLoading || !receiver || !isFirebaseReady}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (message.trim() && !isSending) {
                          handleSend(e);
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    !message.trim() || isLoading || !receiver || isSending || !isFirebaseReady
                  }
                  className="rounded-full h-12 w-12 transition-all duration-300 hover:bg-[#900020] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                  style={{
                    backgroundColor: "#800020",
                    transform: isSending ? "scale(0.95)" : "scale(1)",
                  }}
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Send className="h-5 w-5 text-white" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

