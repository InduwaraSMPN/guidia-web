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
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { stripHtmlTags, containsHtmlTags, formatTextAsHtml } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  isStreaming?: boolean;
  isRichText?: boolean;
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
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  // Get AI response from OpenAI API with streaming support
  const getAiResponse = async (userQuery: string) => {
    setIsLoading(true);

    try {
      // Format the conversation history for the API
      // Strip HTML tags for API requests to ensure clean text
      const history = messages.map(msg => ({
        content: msg.isRichText ? stripHtmlTags(msg.content) : msg.content,
        isUser: msg.isUser
      }));

      // Create a placeholder message for streaming response
      const aiMessageId = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const placeholderMessage: Message = {
        id: aiMessageId,
        content: "",
        timestamp: getFormattedTime(),
        isUser: false,
        isStreaming: true,
        isRichText: true, // Ensure rich text is enabled for AI responses
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

                      // Format content as HTML if it doesn't already contain HTML tags
                      const formattedContent = containsHtmlTags(fullContent) ? fullContent : formatTextAsHtml(fullContent);

                      // Update the message with the new content
                      setMessages(prev =>
                        prev.map(msg =>
                          msg.id === aiMessageId
                            ? { ...msg, content: formattedContent, isRichText: true }
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
                        content: containsHtmlTags(jsonResponse.data.response) ? jsonResponse.data.response : formatTextAsHtml(jsonResponse.data.response),
                        isStreaming: false,
                        isRichText: true
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
                        content: containsHtmlTags(jsonResponse.data.response) ? jsonResponse.data.response : formatTextAsHtml(jsonResponse.data.response),
                        isStreaming: false,
                        isRichText: true
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
                      content: "<p>I'm sorry, I encountered an error while generating a response. Please try again.</p>",
                      isStreaming: false,
                      isRichText: true
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
        id: `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: "<p>I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.</p>",
        timestamp: getFormattedTime(),
        isUser: false,
        isRichText: true // Ensure rich text is enabled for AI responses
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
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: question,
      timestamp: getFormattedTime(),
      isUser: true,
      isRichText: false, // Plain text for initial input
    };

    // Add the message and show chat view
    setMessages([newMessage]);
    setIsChatVisible(true);

    // Get AI response
    getAiResponse(question);
  };

  // Handle sending message in chat view
  const handleSendMessage = () => {
    // Check if there's actual content after stripping HTML tags
    const plainTextContent = stripHtmlTags(inputValue).trim();
    if (!plainTextContent || isLoading) return;

    // Create a new user message
    const newMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: inputValue, // Keep the HTML content
      timestamp: getFormattedTime(),
      isUser: true,
      isRichText: true, // Rich text for chat view input
    };

    // Add the message and clear input
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");

    // Get AI response using plain text version
    getAiResponse(plainTextContent);
  };

  // We don't need the handleKeyDown function anymore as RichTextEditor handles this internally

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
              <h1 className="text-4xl md:text-7xl text-center font-sans font-bold mb-4 whitespace-nowrap">
                <span className="font-grillmaster bg-gradient-to-r from-brand-dark via-brand to-brand-light text-transparent bg-clip-text">Guidia</span>
                <span className="text-brand"> AI Assistant</span>
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto my-2 text-sm text-center">
                Welcome to Guidia AI. Type a question below to start a conversation with your career guidance companion.
              </p>
              <button
                onClick={() => {
                  setMessages([{
                    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    content: "give me sample rich text",
                    timestamp: getFormattedTime(),
                    isUser: true,
                    isRichText: false,
                  }]);
                  setIsChatVisible(true);
                  // Simulate AI response with rich text
                  setTimeout(() => {
                    const aiMessageId = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                    setMessages(prev => [...prev, {
                      id: aiMessageId,
                      content: `<h3>Rich Text Sample</h3>
<p>Here's a <strong>rich text</strong> sample with various formatting:</p>
<ul>
  <li>This is a <em>bulleted</em> list item</li>
  <li>This is <strong>another</strong> item with <span style="color: #800020;">brand color</span></li>
</ul>
<p>You can also include:</p>
<ol>
  <li>Numbered lists</li>
  <li>With multiple items</li>
</ol>
<blockquote>This is a blockquote that can be used for important information.</blockquote>
<p>The Guidia AI Assistant can help with:</p>
<ul>
  <li>Career guidance information</li>
  <li>University resources</li>
  <li>Job application tips</li>
  <li>And much more!</li>
</ul>`,
                      timestamp: getFormattedTime(),
                      isUser: false,
                      isRichText: true,
                    }]);
                  }, 1000);
                }}
                className="text-sm text-brand hover:text-brand-light underline mt-2"
              >
                Show me a sample rich text response
              </button>

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
              <h2 className="text-4xl font-bold">
                <span className="font-grillmaster bg-gradient-to-r from-brand-dark via-brand to-brand-light text-transparent bg-clip-text">Guidia</span>
                <span className="text-brand"> AI Assistant</span>
              </h2>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 pb-20">
              <div className="max-w-3xl mx-auto space-y-6 overflow-visible">
                {/* Date divider */}
                <DateDivider date={getTodayDate()} />

                {/* Messages */}
                {messages.map((message) => (
                  <GuidiaAiMessage
                    key={`message-${message.id}`}
                    content={message.content}
                    timestamp={message.timestamp}
                    isUser={message.isUser}
                    isStreaming={message.isStreaming}
                    isRichText={message.isRichText !== false} // Default to true if not specified
                  />
                ))}

                {/* Loading indicator removed as we have streaming */}

                {/* Invisible element for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat input with rich text editor */}
            <div className="absolute bottom-0 left-0 right-0 p-4 mb-4 bg-background/80 backdrop-blur-sm z-20">
              <div className="max-w-3xl mx-auto flex flex-col gap-2">
                <div className="flex-1 relative z-30 pointer-events-auto">
                  <div className="rich-text-editor-container">
                    <RichTextEditor
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="Type your message..."
                      className="rounded-lg border bg-secondary/80 focus:outline-none focus:ring-1 focus:ring-brand transition-all duration-200 shadow-lg"
                      readOnly={isLoading}
                      onEnterPress={handleSendMessage}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSendMessage}
                    disabled={!stripHtmlTags(inputValue).trim() || isLoading}
                    className="flex h-10 px-4 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50 gap-2 shadow-md hover:bg-brand-light transition-colors"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span>Send</span>
                        <Send className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GuidiaAiChat;
