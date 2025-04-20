"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/config"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { stripHtmlTags } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VisuallyHidden } from "@/components/ui/visually-hidden.tsx"
import { useAuth } from "@/contexts/AuthContext"
import { BackgroundBeams } from "./components/BackgroundBeams";
import { PlaceholdersAndVanishInput } from "./components/PlaceholdersAndVanishInput";
import { GuidiaAiMessage } from "./components/GuidiaAiMessage";
import { DateDivider } from "./components/DateDivider";
import { ChatHistoryDrawer } from "./components/ChatHistoryDrawer";
import { HistoryFloatingButton } from "./components/HistoryFloatingButton";
import { PromptGallery } from "./components/PromptGallery";

interface Message {
  id: string
  content: string
  timestamp: string
  isUser: boolean
  isStreaming?: boolean
  isRichText?: boolean
}

export function GuidiaAiChat() {
  const { user } = useAuth()
  const token = localStorage.getItem('token')
  // State for chat messages
  const [messages, setMessages] = useState<Message[]>([])
  // State to track if chat is visible (after first message)
  const [isChatVisible, setIsChatVisible] = useState(false)
  // State for loading AI response
  const [isLoading, setIsLoading] = useState(false)
  // State for input in chat view
  const [inputValue, setInputValue] = useState("")
  // State for auto-scrolling control
  const [autoScroll, setAutoScroll] = useState(true)
  // State for history panel visibility
  const [isHistoryPanelVisible, setIsHistoryPanelVisible] = useState(false)
  // State for current conversation ID
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  // Ref for scrolling to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Ref for the messages container to detect scroll position
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  // Ref to track if user has manually scrolled up
  const userHasScrolledUp = useRef(false)

  // Define placeholders for the AI chat input
  const placeholders = [
    "Ask me anything...",
    "How can I help you today?",
    "What would you like to know?",
    "Type your question here...",
    "I'm here to assist you...",
  ]

  // Handle scroll events to detect when user scrolls up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50

    if (!isAtBottom && !userHasScrolledUp.current) {
      userHasScrolledUp.current = true
      setAutoScroll(false)
    } else if (isAtBottom && userHasScrolledUp.current) {
      userHasScrolledUp.current = false
      setAutoScroll(true)
    }
  }, [])

  // Scroll to bottom of chat when messages change if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, autoScroll])

  // Add scroll event listener
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current
    if (messagesContainer) {
      messagesContainer.addEventListener("scroll", handleScroll)
      return () => messagesContainer.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  // Ensure editor is properly initialized when chat becomes visible
  useEffect(() => {
    if (isChatVisible) {
      // Wait for the editor to be rendered
      setTimeout(() => {
        const editorElement = document.querySelector('.ql-editor');
        if (editorElement) {
          console.log('Initializing editor after chat becomes visible');
          (editorElement as HTMLElement).setAttribute('contenteditable', 'true');
          (editorElement as HTMLElement).style.pointerEvents = 'auto';
          (editorElement as HTMLElement).style.userSelect = 'text';
          (editorElement as HTMLElement).style.cursor = 'text';
          (editorElement as HTMLElement).focus();
        }
      }, 500); // Longer delay to ensure the editor is fully rendered
    }
  }, [isChatVisible])

  // Format current time for message timestamp
  const getFormattedTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get today's date for the date divider
  const getTodayDate = () => {
    const now = new Date()
    return now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
  }

  // Handle input changes in chat view
  const handleInputChange = (value: string) => {
    console.log("Input changed:", value);
    setInputValue(value);

    // Try to ensure the editor is focused and editable
    setTimeout(() => {
      const editorElement = document.querySelector('.ql-editor');
      if (editorElement) {
        (editorElement as HTMLElement).setAttribute('contenteditable', 'true');
        (editorElement as HTMLElement).style.pointerEvents = 'auto';
        (editorElement as HTMLElement).style.userSelect = 'text';
        (editorElement as HTMLElement).style.cursor = 'text';
      }
    }, 0);
  }

  // Scroll to bottom button handler
  const scrollToBottom = () => {
    console.log('Scroll to bottom clicked');
    if (messagesEndRef.current) {
      console.log('messagesEndRef found, scrolling...');
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      setAutoScroll(true)
      userHasScrolledUp.current = false
    } else {
      console.log('messagesEndRef not found');
    }
  }

  // Define the non-streaming approach function at the component level
  const useNonStreamingApproach = useCallback(
    async (userQuery: string, history: { content: string; isUser: boolean }[], aiMessageId: string) => {
      try {
        // Use fetch with stream parameter
        const response = await fetch(`${API_URL}/api/openai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message: userQuery,
            history: history,
            stream: true,
            conversationID: currentConversationId,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Set up a reader for the response body stream
        const reader = response.body?.getReader()
        let fullContent = ""

        if (reader) {
          try {
            // Process the stream
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              // Convert the chunk to text
              const chunk = new TextDecoder().decode(value)
              const lines = chunk.split("\n")

              // Process each line
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6)
                  if (data === "[DONE]") continue

                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.content) {
                      fullContent += parsed.content
                      // Update the message with the current content
                      setMessages((prev) =>
                        prev.map((msg) =>
                          msg.id === aiMessageId
                            ? {
                                ...msg,
                                content: fullContent,
                                isRichText: true,
                              }
                            : msg,
                        ),
                      )
                    }
                  } catch (parseError) {
                    console.error("Error parsing chunk:", parseError, data)
                  }
                }
              }
            }

            // Update the message to remove streaming flag
            setMessages((prev) => prev.map((msg) => (msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg)))
          } catch (streamError) {
            console.error("Error processing stream:", streamError)
            throw streamError
          }
        } else {
          // Fallback to regular request if streaming fails
          const jsonResponse = await response.json()

          if (jsonResponse.success && jsonResponse.data?.response) {
            // Update the message with the complete response
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content: jsonResponse.data.response,
                      isStreaming: false,
                      isRichText: true,
                    }
                  : msg,
              ),
            )
          } else {
            throw new Error("Invalid response format")
          }
        }
      } catch (fetchError) {
        console.error("Error with fetch approach:", fetchError)

        // Try one more time with regular non-streaming request
        try {
          const regularResponse = await fetch(`${API_URL}/api/openai/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              message: userQuery,
              history: history,
              stream: false,
              conversationID: currentConversationId,
            }),
          })

          const jsonResponse = await regularResponse.json()

          if (jsonResponse.success && jsonResponse.data?.response) {
            // Update the message with the complete response
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content: jsonResponse.data.response,
                      isStreaming: false,
                      isRichText: true,
                    }
                  : msg,
              ),
            )
          } else {
            throw new Error("Invalid response format")
          }
        } catch (finalError) {
          console.error("All approaches failed:", finalError)

          // Update the message to show error
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content:
                      "<p>I'm sorry, I encountered an error while generating a response. Please try again.</p>",
                    isStreaming: false,
                    isRichText: true,
                  }
                : msg,
            ),
          )

          toast.error("Failed to get AI response", {
            description: "Please try again in a moment",
            action: {
              label: "Retry",
              onClick: () => getAiResponse(userQuery),
            },
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [getFormattedTime, user, currentConversationId] // Include dependencies
  )

  // Get AI response from OpenAI API with streaming support
  const getAiResponse = async (userQuery: string) => {
    setIsLoading(true)

    try {
      // Format the conversation history for the API
      // Strip HTML tags for API requests to ensure clean text
      const history = messages.map((msg) => ({
        content: msg.isRichText ? stripHtmlTags(msg.content) : msg.content,
        isUser: msg.isUser,
      }))

      // Create a placeholder message for streaming response
      const aiMessageId = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const placeholderMessage: Message = {
        id: aiMessageId,
        content: "",
        timestamp: getFormattedTime(),
        isUser: false,
        isStreaming: true,
        isRichText: true, // Ensure rich text is enabled for AI responses
      }

      // Add the placeholder message
      setMessages((prev) => [...prev, placeholderMessage])

      // Ensure auto-scroll is enabled when getting a new response
      setAutoScroll(true)
      userHasScrolledUp.current = false

      // Call the non-streaming approach function with the necessary parameters
      await useNonStreamingApproach(userQuery, history, aiMessageId)
    } catch (error) {
      console.error("Error setting up AI response:", error)
      toast.error("Failed to get AI response", {
        description: "Please try again in a moment",
        action: {
          label: "Retry",
          onClick: () => getAiResponse(userQuery), // Recursive call might be risky, consider alternatives
        },
      })

      // Fallback response in case of error
      const fallbackMessage: Message = {
        id: `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content:
          "<p>I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.</p>",
        timestamp: getFormattedTime(),
        isUser: false,
        isRichText: true, // Ensure rich text is enabled for AI responses
      }

      setMessages((prev) => {
        // Remove placeholder before adding fallback
        const filtered = prev.filter(msg => !msg.isStreaming);
        return [...filtered, fallbackMessage]
       });
      setIsLoading(false)
    }
  }

  // Handle form submission from initial input
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Extract the question from the form
    const formElement = e.currentTarget
    const inputElement = formElement.querySelector("input") as HTMLInputElement
    const question = inputElement?.value.trim()

    if (!question) return

    // Create a new user message
    const newMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: question,
      timestamp: getFormattedTime(),
      isUser: true,
      isRichText: false, // Plain text for initial input
    }

    // Add the message and show chat view
    setMessages([newMessage])
    setIsChatVisible(true)

    // Get AI response
    getAiResponse(question)
  }

  // Handle sending message in chat view
  const handleSendMessage = () => {
    // Check if there's actual content after stripping HTML tags
    const plainTextContent = stripHtmlTags(inputValue).trim()
    if (!plainTextContent || isLoading) return

    // Create a new user message
    const newMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: inputValue, // Keep the HTML content
      timestamp: getFormattedTime(),
      isUser: true,
      isRichText: true, // Rich text for chat view input
    }

    // Add the message and clear input
    setMessages((prev) => [...prev, newMessage])
    setInputValue("")

    // Get AI response using plain text version
    getAiResponse(plainTextContent)
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter or Cmd+Enter to send message
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      // Prevent default behavior if the editor handles Enter itself
      if (!e.defaultPrevented) {
        e.preventDefault(); // Ensure we handle it
        handleSendMessage();
      }
    }
  }

  // Handle selecting a conversation from history
  const handleSelectConversation = async (conversationId: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/chat-history/conversations/${conversationId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch conversation")
      }

      const data = await response.json()

      // Format messages for the chat interface
      const formattedMessages = data.data.messages.map((msg: any) => ({
        id: `${msg.isUserMessage ? 'user' : 'ai'}-${msg.messageID}`,
        content: msg.content,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isUser: msg.isUserMessage === 1,
        isRichText: msg.isRichText === 1,
      }))

      setMessages(formattedMessages)
      setCurrentConversationId(conversationId)
      setIsChatVisible(true)

      // Close history panel on mobile after selection
      if (window.innerWidth < 768) {
        setIsHistoryPanelVisible(false)
      }
    } catch (error) {
      console.error("Error fetching conversation:", error)
      toast.error("Failed to load conversation")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle starting a new conversation
  const handleNewConversation = () => {
    setCurrentConversationId(null)
    setMessages([])
    setIsChatVisible(false)

    // Close history panel on mobile after starting new conversation
    if (window.innerWidth < 768) {
      setIsHistoryPanelVisible(false)
    }
  }

  return (
    <main
      className="h-screen w-full bg-background relative flex flex-col antialiased overflow-hidden"
      style={{ touchAction: 'auto' }}
    >
      <BackgroundBeams className="z-0 fixed inset-0 pointer-events-none" />

      <div className="flex h-full relative z-10">
        {/* History drawer component - conditionally show content based on login status */}
        <ChatHistoryDrawer
          onSelectConversation={handleSelectConversation}
          selectedConversationId={currentConversationId || undefined}
          onNewConversation={handleNewConversation}
          isOpen={isHistoryPanelVisible}
          setIsOpen={setIsHistoryPanelVisible}
          isLoggedIn={!!user}
        />

        {/* Floating history button - always visible when history panel is closed */}
        <HistoryFloatingButton
          onClick={() => setIsHistoryPanelVisible(true)}
          isVisible={!isHistoryPanelVisible}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {!isChatVisible ? (
              // Initial view with just the input
              <motion.div
                key="initial-view"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1 flex flex-col items-center justify-center p-4 relative z-10"
              >
                <header className="max-w-2xl mx-auto flex flex-col items-center">
                  <h1 className="text-4xl md:text-7xl text-center font-sans font-bold mb-4 whitespace-nowrap">
                    <span className="font-['Grillmaster_Extended'] bg-gradient-to-r from-brand-dark via-brand to-brand-light text-transparent bg-clip-text">
                      Guidia
                    </span>
                    <span className="text-brand font-montserrat"> AI Assistant</span>
                  </h1>
                  <p className="text-muted-foreground max-w-lg mx-auto my-2 text-sm md:text-base text-center">
                    Welcome to Guidia AI. Type a question below to start a conversation with your career guidance companion.
                  </p>

                  {/* Use the PlaceholdersAndVanishInput component */}
                  <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onSubmit={onSubmit}
                    className="mt-6 w-full"
                    inputClassName="pl-4 sm:pl-10"
                  />

                  {/* Prompt Gallery */}
                  <PromptGallery
                    onPromptSelect={(prompt) => {
                      // Create a synthetic form event
                      const form = document.createElement('form');
                      const input = document.createElement('input');
                      input.value = prompt;
                      form.appendChild(input);

                      const syntheticEvent = {
                        preventDefault: () => {},
                        currentTarget: form,
                        target: form,
                      } as unknown as React.FormEvent<HTMLFormElement>;

                      onSubmit(syntheticEvent);
                    }}
                    className="mt-8"
                  />
                </header>
              </motion.div>
            ) : (
              // Chat view after submission
              <motion.div
                key="chat-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex-1 flex flex-col h-full relative z-10"
              >
                {/* Chat header */}
                <header className="flex justify-center items-center pt-32 md:pt-16 lg:pt-24 pb-4 sticky top-0 z-20">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    <span className="font-['Grillmaster_Extended'] text-brand bg-clip-text">
                      Guidia
                    </span>
                    <span className="font-montserrat text-brand"> AI Assistant</span>
                  </h1>
                </header>

                {/* Chat messages */}
                <section
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 pb-[180px] md:pb-[140px] scroll-smooth" // Increased bottom padding
                  aria-live="polite"
                  aria-atomic="false"
                  aria-relevant="additions"
                >
                  <div className="max-w-4xl mx-auto space-y-6 overflow-visible mb-32">
                    {/* Date divider */}
                    <DateDivider date={getTodayDate()} />

                    {/* Messages */}
                    {messages.map((message, index) => (
                      <GuidiaAiMessage
                        key={`message-${message.id}`}
                        id={message.id}
                        content={message.content}
                        timestamp={message.timestamp}
                        isUser={message.isUser}
                        isStreaming={message.isStreaming}
                        isRichText={message.isRichText !== false} // Default to true if not specified
                        isFirstInSequence={index === 0 || messages[index - 1].isUser !== message.isUser}
                        isLastInSequence={index === messages.length - 1 || messages[index + 1]?.isUser !== message.isUser}
                      />
                    ))}

                    {/* Invisible element for scrolling to bottom */}
                    <div
                      ref={messagesEndRef}
                      aria-hidden="true"
                      style={{ height: '1px', width: '100%' }}
                    />
                  </div>
                </section>

                {/* Chat input container */}
                <div className="fixed bottom-0 left-0 right-0 pb-4 z-30 bg-background pointer-events-none">
                  {/* Added a relative container to position button relative to card */}
                  <div className="relative max-w-3xl mx-auto pointer-events-auto">
                    {/* Chat input card */}
                    <Card className="shadow-lg">
                      <div className="p-2" onKeyDown={handleKeyDown}> {/* Moved keydown listener here */}
                        <div className="flex-1 relative z-10 pointer-events-auto" style={{ touchAction: 'auto' }}>
                          <div
                            className="rich-text-editor-container"
                            onClick={(e) => {
                                // Prevent click from propagating if it's not on the editor itself maybe?
                                // Or just focus the editor always
                                const editorElement = e.currentTarget.querySelector('.ql-editor');
                                if (editorElement && document.activeElement !== editorElement) {
                                    (editorElement as HTMLElement).focus();
                                }
                            }}
                          >
                            <RichTextEditor
                              value={inputValue}
                              onChange={handleInputChange}
                              placeholder="Type your message..."
                              className="border bg-secondary/80 focus:outline-none focus:ring-1 focus:ring-brand transition-all duration-200 guidia-chat-editor"
                              readOnly={isLoading}
                              onEnterPress={handleSendMessage} // Keep this if editor supports it, but Ctrl+Enter is handled above
                              aria-label="Message input"
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-muted-foreground px-2">
                            <span>
                              Press <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-xs">Ctrl</kbd>{" "}
                              + <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-xs">Enter</kbd> to
                              send
                            </span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={handleSendMessage}
                                  disabled={!stripHtmlTags(inputValue).trim() || isLoading}
                                  className="flex h-10 px-4 items-center justify-center rounded-full bg-brand hover:bg-brand-dark text-white disabled:opacity-50 gap-2 shadow-md hover:bg-brand-light transition-colors"
                                  aria-label="Send message"
                                >
                                  <>
                                    <span>Send</span>
                                    <ArrowUp className="h-4 w-4" />
                                  </>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Send message
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </Card>

                    {/* Scroll to bottom button - only visible when not at bottom */}
                    <AnimatePresence>
                      {!autoScroll && messages.length > 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          // Adjusted positioning for vertical centering
                          className="absolute top-[2%] transform -translate-y-1/2 -right-12 md:-right-14 lg:-right-16 z-40 pointer-events-auto"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="default"
                                  onClick={scrollToBottom}
                                  className="h-10 w-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer bg-brand hover:bg-brand-light text-white"
                                  aria-label="Scroll to bottom"
                                  style={{ pointerEvents: 'auto' }} // Ensure it's clickable
                                >
                                  <ChevronDown className="h-5 w-5" />
                                  <VisuallyHidden>Scroll to latest messages</VisuallyHidden>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Scroll to latest messages</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div> {/* End of relative wrapper */}
                </div> {/* End of fixed container */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

export default GuidiaAiChat
