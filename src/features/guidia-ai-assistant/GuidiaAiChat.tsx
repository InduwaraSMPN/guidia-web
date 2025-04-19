"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { API_URL } from "@/config"
import { RichTextEditor } from "@/components/ui/RichTextEditor"
import { stripHtmlTags, containsHtmlTags, formatTextAsHtml } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { VisuallyHidden } from "@/components/ui/visually-hidden.tsx"
import { BackgroundBeams } from "./components/BackgroundBeams";
import { PlaceholdersAndVanishInput } from "./components/PlaceholdersAndVanishInput";
import { GuidiaAiMessage } from "./components/GuidiaAiMessage";
import { DateDivider } from "./components/DateDivider";


interface Message {
  id: string
  content: string
  timestamp: string
  isUser: boolean
  isStreaming?: boolean
  isRichText?: boolean
}

export function GuidiaAiChat() {
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      setAutoScroll(true)
      userHasScrolledUp.current = false
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
          },
          body: JSON.stringify({
            message: userQuery,
            history: history,
            stream: true,
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
                                content: containsHtmlTags(fullContent)
                                  ? fullContent
                                  : formatTextAsHtml(fullContent),
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
                      content: containsHtmlTags(jsonResponse.data.response)
                        ? jsonResponse.data.response
                        : formatTextAsHtml(jsonResponse.data.response),
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
            },
            body: JSON.stringify({
              message: userQuery,
              history: history,
              stream: false,
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
                      content: containsHtmlTags(jsonResponse.data.response)
                        ? jsonResponse.data.response
                        : formatTextAsHtml(jsonResponse.data.response),
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
    [getFormattedTime]
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
          onClick: () => getAiResponse(userQuery),
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

      setMessages((prev) => [...prev, fallbackMessage])
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
      handleSendMessage()
    }
  }

  return (
    <main
      className="h-screen w-full bg-background relative flex flex-col antialiased overflow-hidden"
      onKeyDown={handleKeyDown}
      style={{ touchAction: 'auto' }}
    >
      <BackgroundBeams className="z-0 fixed inset-0 pointer-events-none" />

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

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="link"
                      onClick={() => {
                        setMessages([
                          {
                            id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                            content: "give me sample rich text",
                            timestamp: getFormattedTime(),
                            isUser: true,
                            isRichText: false,
                          },
                        ])
                        setIsChatVisible(true)
                        // Simulate AI response with rich text
                        setTimeout(() => {
                          const aiMessageId = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
                          setMessages((prev) => [
                            ...prev,
                            {
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
                            },
                          ])
                        }, 1000)
                      }}
                      className="text-sm text-brand hover:text-brand-light underline mt-2 transition-colors duration-200"
                    >
                      Show me a sample rich text response
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>See an example of AI capabilities</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Use the PlaceholdersAndVanishInput component */}
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onSubmit={onSubmit}
                className="mt-6 w-full"
                inputClassName="pl-4 sm:pl-10"
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
              <div className="max-w-3xl mx-auto space-y-6 overflow-visible mb-32">
                {/* Date divider */}
                <DateDivider date={getTodayDate()} />

                {/* Messages */}
                {messages.map((message, index) => (
                  <GuidiaAiMessage
                    key={`message-${message.id}`}
                    content={message.content}
                    timestamp={message.timestamp}
                    isUser={message.isUser}
                    isStreaming={message.isStreaming}
                    isRichText={message.isRichText !== false} // Default to true if not specified
                    isFirstInSequence={index === 0 || messages[index - 1].isUser !== message.isUser}
                    isLastInSequence={index === messages.length - 1 || messages[index + 1].isUser !== message.isUser}
                  />
                ))}

                {/* Invisible element for scrolling to bottom */}
                <div ref={messagesEndRef} aria-hidden="true" />
              </div>
            </section>

            {/* Scroll to bottom button - only visible when not at bottom */}
            <AnimatePresence>
              {!autoScroll && messages.length > 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-32 right-4 md:right-8 z-30"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={scrollToBottom}
                          className="h-10 w-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                          aria-label="Scroll to bottom"
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

            {/* Chat input with rich text editor */}
            <div className="fixed bottom-0 left-0 right-0 p-4 mb-0 z-50 bg-background"> {/* Added bg-background */}
              <Card className="max-w-3xl mx-auto shadow-lg">
                <div className="p-2">
                  <div className="flex-1 relative z-50 pointer-events-auto" style={{ touchAction: 'auto' }}>
                    <div
                      className="rich-text-editor-container"
                      onClick={() => {
                        console.log('Container clicked');
                        // Try to force focus on the editor
                        const editorElement = document.querySelector('.ql-editor');
                        if (editorElement) {
                          console.log('Editor found, focusing...');
                          // Make sure the editor is editable
                          (editorElement as HTMLElement).setAttribute('contenteditable', 'true');
                          (editorElement as HTMLElement).style.pointerEvents = 'auto';
                          (editorElement as HTMLElement).style.userSelect = 'text';
                          (editorElement as HTMLElement).style.cursor = 'text';
                          (editorElement as HTMLElement).focus();

                          // Try to place cursor at the end
                          const range = document.createRange();
                          const selection = window.getSelection();
                          range.selectNodeContents(editorElement);
                          range.collapse(false); // false means collapse to end
                          selection?.removeAllRanges();
                          selection?.addRange(range);
                        } else {
                          console.log('Editor element not found');
                        }
                      }}
                    >
                      <RichTextEditor
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="border bg-secondary/80 focus:outline-none focus:ring-1 focus:ring-brand transition-all duration-200"
                        readOnly={isLoading}
                        onEnterPress={handleSendMessage}
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
                            className="flex h-10 px-4 items-center justify-center rounded-full bg-brand text-white disabled:opacity-50 gap-2 shadow-md hover:bg-brand-light transition-colors"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default GuidiaAiChat
