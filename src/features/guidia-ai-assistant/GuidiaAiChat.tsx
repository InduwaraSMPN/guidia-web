"use client";
import React, { useState, useRef, useEffect } from "react";
import { BackgroundBeams } from "./components/BackgroundBeams";
import { PlaceholdersAndVanishInput } from "./components/PlaceholdersAndVanishInput";
import { GuidiaAiMessage } from "./components/GuidiaAiMessage";
import { DateDivider } from "./components/DateDivider";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
// import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
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

  // Simulate AI response
  const simulateAiResponse = (_userQuery: string) => {
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Generate a simple response based on the query
      let response = "Could you please clarify or provide the specific query you'd like me to answer? I'm here to help with any information or questions you have!";

      // Add the AI response to messages
      const newMessage: Message = {
        id: Date.now().toString(),
        content: response,
        timestamp: getFormattedTime(),
        isUser: false,
      };

      setMessages(prev => [...prev, newMessage]);
      setIsLoading(false);
    }, 1500); // 1.5 second delay to simulate thinking
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

    // Simulate AI response
    simulateAiResponse(question);
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

    // Simulate AI response
    simulateAiResponse(inputValue.trim());
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
                Welcome to Guidia AI, your career guidance companion. Ask me about
                career paths, job opportunities, or educational resources. I'm here to
                help you navigate your professional journey with confidence.
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
            <div className="flex justify-center items-center p-4">
              <h2 className="text-xl font-bold text-brand">
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
                  />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Guidia is thinking...</span>
                  </div>
                )}

                {/* Invisible element for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat input */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
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
