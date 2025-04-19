// ./components/GuidiaAiMessage.tsx
"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, sanitizeHtml, stripHtmlTags } from "@/lib/utils" // Import stripHtmlTags
import { Copy } from "lucide-react" // Import Copy icon
import { toast } from "sonner" // Import toast
import { useThemeContext } from "@/contexts/ThemeContext" // Assuming this context exists
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Assuming Avatar exists
import { Button } from "@/components/ui/button" // Assuming Button exists
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Assuming Tooltip exists

interface GuidiaAiMessageProps {
  id: string // Add ID for unique keys and aria attributes
  content: string
  timestamp: string
  isUser: boolean
  aiName?: string
  isStreaming?: boolean
  isRichText?: boolean
  isFirstInSequence?: boolean // Assuming this is still used for corner radius/margins
  isLastInSequence?: boolean // Assuming this is still used for corner radius/margins
}

export function GuidiaAiMessage({
  id, // Destructure the ID
  content,
  timestamp,
  isUser,
  aiName = "Guidia AI",
  isStreaming = false,
  isRichText = true, // Keep default as true based on your existing component
  isFirstInSequence = true,
  isLastInSequence = true,
}: GuidiaAiMessageProps) {
  const { isDark } = useThemeContext()
  const [isHovered, setIsHovered] = useState(false) // State for hover

  // Sanitize only if it's rich text
  const sanitizedContent = isRichText && content ? sanitizeHtml(content) : content;

  // Handle copy action
  const handleCopy = useCallback(async () => {
    // Always copy the plain text version of the content
    const textToCopy = isRichText ? stripHtmlTags(content) : content;

    if (!textToCopy && !isStreaming) {
        toast.info("Nothing to copy.");
        return;
    }
    // Don't attempt to copy incomplete streaming message
    if (isStreaming) {
        toast.warning("Cannot copy message while it's generating.");
        return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Message copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy message.");
    }
  }, [content, isRichText, isStreaming]); // Include dependencies

  // Animation variants (kept from your original code)
  const messageVariants = {
    initial: {
      opacity: 0,
      y: 10,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={messageVariants}
      className={cn(
        "flex w-full mb-1 relative group items-end",
        isUser ? "justify-end" : "justify-start guidia-ai-message",
        isFirstInSequence ? "mt-4" : "mt-1", // Keep your margin logic
        isLastInSequence ? "mb-4" : "mb-1",   // Keep your margin logic
      )}
      onMouseEnter={() => setIsHovered(true)} // Add hover listener
      onMouseLeave={() => setIsHovered(false)} // Add hover listener
       role="article"
       aria-labelledby={`message-content-${id}`} // Use ID
       aria-describedby={`message-timestamp-${id}`} // Use ID
    >
      {/* Avatar for AI messages only - show only for first message in sequence */}
      {!isUser && isFirstInSequence && (
        <Avatar className="h-8 w-8 mr-2 flex-shrink-0 shadow-sm border border-border/30 self-end mb-1"> {/* Added self-end mb-1 for baseline alignment */}
          <AvatarImage src={isDark ? "/images/small-logo-light.svg" : "/images/small-logo-dark.svg"} alt="Guidia AI" />
          <AvatarFallback className="bg-white text-brand font-semibold">GA</AvatarFallback>
        </Avatar>
      )}

      {/* Spacer for alignment when not showing avatar */}
      {/* Adjust spacer based on avatar size and margin */}
      {!isUser && !isFirstInSequence && <div className="w-[calc(2rem+0.5rem)] flex-shrink-0" />} {/* w-8 (avatar) + mr-2 (0.5rem) */}


      {/* Message bubble container (relative positioning for copy button) */}
      <div
        className={cn(
          "relative max-w-[86%] rounded-lg px-4 py-2.5 shadow-sm transition-all duration-200",
          isUser
            ? "bg-brand text-white focus-within:ring-2 focus-within:ring-brand-light focus-within:ring-opacity-50"
            : "bg-secondary-light text-adaptive-dark focus-within:ring-2 focus-within:ring-brand focus-within:ring-opacity-30",
          // Apply conditional border radius classes
          isFirstInSequence && !isUser ? "rounded-tl-sm" : "",
          isFirstInSequence && isUser ? "rounded-tl-sm" : "",
          isLastInSequence && !isUser ? "rounded-bl-sm" : "", // Changed logic based on your original component
          isLastInSequence && isUser ? "rounded-br-sm" : "", // Changed logic based on your original component

          // Add padding-right to make space for the copy button when not streaming
          !isStreaming && "pr-10" // Adjust padding as needed for your layout/button size
        )}
        tabIndex={0}
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
        aria-live={isStreaming ? "polite" : "off"}
      >
        {/* AI Name (only for first AI message) */}
        {!isUser && isFirstInSequence && <p className="text-xs font-semibold mb-1 text-brand">{aiName}</p>}

        {/* Message content */}
        <div className="text-sm leading-relaxed">
          {isRichText ? (
            // Render HTML content
            <div
              id={`message-content-${id}`} // Use ID
              className={cn("prose prose-sm max-w-none dark:prose-invert chat-message-content focus:outline-none", {
                   "prose-neutral": !isUser, // Use neutral prose styles for AI if needed
                   "prose-invert": isUser, // Use inverted prose styles for user if needed
               })}
              dangerouslySetInnerHTML={{ __html: sanitizedContent || '' }} // Handle empty content
            />
          ) : (
            // Render plain text preserving white space
            <div
               id={`message-content-${id}`} // Use ID
               className="whitespace-pre-wrap"
            >
              {sanitizedContent || ''} {/* Handle empty content */}
            </div>
          )}

           {/* Streaming Indicator (kept from your original code) */}
          {isStreaming && (
            <span className="inline-flex items-center ml-1 text-xs text-muted-foreground" aria-label="AI is typing">
              <span className="flex ml-1 space-x-1">
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" />
              </span>
            </span>
          )}
           {/* Removed the streaming cursor span */}
        </div>

        {/* Timestamp */}
        <p
            id={`message-timestamp-${id}`} // Use ID
            className={cn("text-xs mt-1 opacity-80", isUser ? "text-white/80" : "text-muted-foreground")}>
            {timestamp}
        </p>

        {/* Copy Button - Positioned Absolutely */}
        {/* Only show if hovered, not streaming, and has content */}
        <AnimatePresence>
          {isHovered && !isStreaming && content && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              // Position top-right relative to the *parent* container of the bubble
              className="absolute top-1 right-1 z-10" // Adjust positioning as needed
            >
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost" // Use ghost variant for minimal styling
                      size="icon" // Use icon size
                      className={cn(
                        "h-7 w-7 rounded-full", // Adjust size
                        // Conditional colors for button based on message sender
                        isUser ? "text-white/70 hover:text-white hover:bg-white/20"
                               : "text-muted-foreground/70 hover:text-foreground hover:bg-background/50"
                      )}
                      onClick={handleCopy}
                      aria-label="Copy message content"
                    >
                      <Copy className="h-4 w-4" /> {/* Adjust icon size */}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Copy</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

       {/* Avatar for User messages only - show only for first message in sequence */}
       {isUser && isFirstInSequence && (
        <Avatar className="h-8 w-8 ml-2 flex-shrink-0 shadow-sm border border-border/30 self-end mb-1"> {/* Added self-end mb-1 */}
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">US</AvatarFallback> {/* Or use actual user initial */}
        </Avatar>
      )}
      {/* Spacer for alignment when not showing user avatar */}
      {isUser && !isFirstInSequence && <div className="w-[calc(2rem+0.5rem)] flex-shrink-0" />} {/* w-8 (avatar) + ml-2 (0.5rem) */}

      {/* Global styles for chat message content */}
      <style dangerouslySetInnerHTML={{ __html: `
         /* Adjustments for Prose margins within the chat bubble */
        .chat-message-content :where(p, h1, h2, h3, h4, h5, h6, ul, ol, pre, blockquote):not(:first-child) {
           margin-top: 0.5em; /* Reduced top margin */
        }
        .chat-message-content :where(p, ul, ol, pre, blockquote):not(:last-child) {
           margin-bottom: 0.5em; /* Reduced bottom margin */
        }
         .chat-message-content :where(li):not(:where([class~="not-prose"] *)) {
             margin-top: 0.25em; /* Adjust top margin for list items */
             margin-bottom: 0.25em; /* Adjust bottom margin for list items */
          }
      `}} />
    </motion.div>
  )
}

export default GuidiaAiMessage