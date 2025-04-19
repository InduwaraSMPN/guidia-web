"use client";
import React, { useState, useRef, useEffect } from "react";
import { BackgroundBeams } from "./components/BackgroundBeams";
import { PlaceholdersAndVanishInput } from "./components/PlaceholdersAndVanishInput";
import { GuidiaAiMessage } from "./components/GuidiaAiMessage";
import { DateDivider } from "./components/DateDivider";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  isStreaming?: boolean;
}

export function GuidiaAiChat() {
  // State for chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // State to track if chat is visible (after first message)
  const [isChatVisible, setIsChatVisible] = useState(false);
  // State for loading AI response
  const [isLoading, setIsLoading] = useState(false);
  // State for input in chat view
  const [inputValue, setInputValue] = useState("");
  // Ref for scrolling to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Define placeholders for the AI chat input
  const placeholders = [
    "Ask me anything...",
    "How can I help you today?",
    "What would you like to know?",
    "Type your question here...",
    "I'm here to assist you...",
  ];

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Format current time for message timestamp
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get today's date for the date divider
  const getTodayDate = () => {
    const now = new Date();
    return now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Handle input changes in chat view
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  // Get AI response from OpenAI API with streaming support
  const getAiResponse = async (userQuery: string) => {
    setIsLoading(true);

    try {
      // Format the conversation history for the API
      const history = messages.map(msg => ({
        content: msg.content,
        isUser: msg.isUser
      }));

      // Create a placeholder message for streaming response
      const aiMessageId = Date.now().toString();
      const placeholderMessage: Message = {
        id: aiMessageId,
        content: "",
        timestamp: getFormattedTime(),
        isUser: false,
        isStreaming: true,
      };

      // Add the placeholder message
      setMessages(prev => [...prev, placeholderMessage]);

      // Use non-streaming approach
      useNonStreamingApproach();

      // Function to use non-streaming approach
      async function useNonStreamingApproach() {
        try {
          // Use fetch with stream parameter
          const response = await fetch(`${API_URL}/api/openai/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: userQuery,
              history: history,
              stream: true
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Set up a reader for the response body stream
          const reader = response.body?.getReader();
          let fullContent = "";

          if (reader) {
            // Read the stream
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                break;
              }

              // Convert the chunk to text
              const chunk = new TextDecoder().decode(value);

              // Process each line (each SSE message is separated by double newlines)
              const lines = chunk.split('\n\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.substring(6);

                  if (data === '[DONE]') {
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(data);

                    if (parsed.content) {
                      fullContent += parsed.content;

                      // Update the message with the new content
                      setMessages(prev =>
                        prev.map(msg =>
                          msg.id === aiMessageId
                            ? { ...msg, content: fullContent }
                            : msg
                        )
                      );
                    }
                  } catch (parseError) {
                    console.error('Error parsing chunk:', parseError);
                  }
                }
              }
            }

            // Update the message to remove streaming flag
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              )
            );
          } else {
            // Fallback to regular request if streaming fails
            const jsonResponse = await response.json();

            if (jsonResponse.success && jsonResponse.data?.response) {
              // Update the message with the complete response
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        content: jsonResponse.data.response,
                        isStreaming: false
                      }
                    : msg
                )
              );
            } else {
              throw new Error('Invalid response format');
            }
          }
        } catch (fetchError) {
          console.error('Error with fetch approach:', fetchError);

          // Try one more time with regular non-streaming request
          try {
            const regularResponse = await fetch(`${API_URL}/api/openai/chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: userQuery,
                history: history,
                stream: false
              })
            });

            const jsonResponse = await regularResponse.json();

            if (jsonResponse.success && jsonResponse.data?.response) {
              // Update the message with the complete response
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessageId
                    ? {
                        ...msg,
                        content: jsonResponse.data.response,
                        isStreaming: false
                      }
                    : msg
                )
              );
            } else {
              throw new Error('Invalid response format');
            }
          } catch (finalError) {
            console.error('All approaches failed:', finalError);

            // Update the message to show error
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content: "I'm sorry, I encountered an error while generating a response. Please try again.",
                      isStreaming: false
                    }
                  : msg
              )
            );

            toast.error('Failed to get AI response');
          }
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error setting up AI response:', error);
      toast.error('Failed to get AI response. Please try again.');

      // Fallback response in case of error
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
        timestamp: getFormattedTime(),
        isUser: false,
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setIsLoading(false);
    }
  };

  // Handle form submission from initial input
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Extract the question from the form
    const formElement = e.currentTarget;
    const inputElement = formElement.querySelector('input') as HTMLInputElement;
    const question = inputElement?.value.trim();

    if (!question) return;

    // Create a new user message
    const newMessage: Message = {
      id: Date.now().toString(),
      content: question,
      timestamp: getFormattedTime(),
      isUser: true,
    };

    // Add the message and show chat view
    setMessages([newMessage]);
    setIsChatVisible(true);

    // Get AI response
    getAiResponse(question);
  };

  // Handle sending message in chat view
  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    // Create a new user message
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      timestamp: getFormattedTime(),
      isUser: true,
    };

    // Add the message and clear input
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");

    // Get AI response
    getAiResponse(inputValue.trim());
  };

  // Handle key press in chat input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen w-full bg-background relative flex flex-col antialiased overflow-hidden">
      <BackgroundBeams className="z-0 fixed inset-0" />

      <AnimatePresence mode="wait">
        {!isChatVisible ? (
          // Initial view with just the input
          <motion.div
            key="initial-view"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center p-4 relative z-10"
          >
            <div className="max-w-2xl mx-auto flex flex-col items-center">
              <h1 className="text-4xl md:text-7xl text-brand text-center font-sans font-bold mb-4 whitespace-nowrap">
                <span className="font-grillmaster">Guidia</span> AI Assistant
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto my-2 text-sm text-center">
                Welcome to Guidia AI. Type a question below to start a conversation with your career guidance companion.
              </p>

              {/* Use the PlaceholdersAndVanishInput component */}
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onSubmit={onSubmit}
                className="mt-6 w-full"
                inputClassName="pl-4 sm:pl-10"
              />
            </div>
          </motion.div>
        ) : (
          // Chat view after submission
          <motion.div
            key="chat-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col h-full relative z-10"
          >
            {/* Chat header */}
            <div className="flex justify-center items-center pt-32">
              <h2 className="text-4xl font-bold text-brand">
                <span className="font-grillmaster">Guidia</span> AI Assistant
              </h2>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 pb-20">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Date divider */}
                <DateDivider date={getTodayDate()} />

                {/* Messages */}
                {messages.map((message) => (
                  <GuidiaAiMessage
                    key={message.id}
                    content={message.content}
                    timestamp={message.timestamp}
                    isUser={message.isUser}
                    isStreaming={message.isStreaming}
                  />
                ))}

                {/* Loading indicator removed as we have streaming */}

                {/* Invisible element for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 mb-4">
              <div className="max-w-3xl mx-auto flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 resize-none rounded-lg border bg-secondary px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand transition-all duration-200"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GuidiaAiChat;
