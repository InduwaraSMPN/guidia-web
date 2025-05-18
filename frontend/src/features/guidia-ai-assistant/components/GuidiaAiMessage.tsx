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
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import TurndownService from "turndown"
import type { Node as TurndownNode } from "turndown"

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

  // Initialize turndown service with enhanced configuration for converting HTML to Markdown
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    bulletListMarker: '-',
    strongDelimiter: '**',
    linkStyle: 'inlined'
  })

  // Configure turndown to better handle Quill's HTML output
  // Handle Quill's list formatting
  turndownService.addRule('quillLists', {
    filter: ['ul', 'ol'],
    replacement: function(content: string, node: TurndownNode) {
      // Check if this is a Quill list
      const htmlElement = node as HTMLElement;
      const className = htmlElement.getAttribute?.('class') || '';
      const isQuillList =
        (node.nodeName === 'UL' && className.includes('ql-bullet')) ||
        (node.nodeName === 'OL' && className.includes('ql-numbered'));

      // If it's a Quill list, add extra spacing
      if (isQuillList) {
        return '\n\n' + content + '\n\n';
      }

      // Otherwise, just return the content
      return '\n' + content + '\n';
    }
  })

  // Handle list items with better indentation
  turndownService.addRule('listItems', {
    filter: ['li'],
    replacement: function(content: string, node: TurndownNode) {
      const parent = node.parentNode
      const isOrdered = parent && parent.nodeName === 'OL'
      const prefix = isOrdered ? '1. ' : '- '

      // Handle nested lists by adding proper indentation
      let indent = '';
      let listParent = parent;
      while (listParent && (listParent.nodeName === 'UL' || listParent.nodeName === 'OL')) {
        if (listParent.parentNode && (listParent.parentNode.nodeName === 'LI')) {
          indent += '  ';
          listParent = listParent.parentNode.parentNode;
        } else {
          break;
        }
      }

      return indent + prefix + content.trim() + '\n';
    }
  })

  // Special rule for Quill's paragraph handling
  turndownService.addRule('quillParagraphs', {
    filter: 'p',
    replacement: function(content: string) {
      return '\n' + content + '\n';
    }
  })

  // Convert HTML to Markdown for user messages with improved handling
  let markdownContent = content;
  if (isRichText && isUser && content) {
    const sanitized = sanitizeHtml(content);
    try {
      markdownContent = turndownService.turndown(sanitized);
      // Clean up extra newlines that might be introduced
      markdownContent = markdownContent.replace(/\n{3,}/g, '\n\n');
      console.log('Converted HTML to Markdown:', { original: content, sanitized, markdown: markdownContent });
    } catch (error) {
      console.error('Error converting HTML to Markdown:', error);
      // Fallback to sanitized HTML if conversion fails
      markdownContent = sanitized;
    }
  }

  // Keep sanitized content for non-markdown rendering
  const sanitizedContent = isRichText && isUser && content ? sanitizeHtml(content) : content;

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
            // Render Markdown for both user and AI messages
            <div
              id={`message-content-${id}`}
              className={cn("prose prose-sm max-w-none dark:prose-invert chat-message-content focus:outline-none", {
                "prose-invert": isUser,
                "user-message-content": isUser,
                "prose-neutral": !isUser,
              })}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for ordered lists
                  ol: ({...props}) => (
                    <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />
                  ),
                  // Custom styling for unordered lists
                  ul: ({...props}) => (
                    <ul className="list-disc pl-6 my-2 space-y-1" {...props} />
                  ),
                  // Custom styling for list items
                  li: ({...props}) => (
                    <li className="my-1" {...props} />
                  ),
                  // Custom styling for headings
                  h1: ({...props}) => (
                    <h1 className="text-xl font-bold my-3" {...props} />
                  ),
                  h2: ({...props}) => (
                    <h2 className="text-lg font-bold my-2" {...props} />
                  ),
                  h3: ({...props}) => (
                    <h3 className="text-base font-bold my-2" {...props} />
                  ),
                  // Custom styling for paragraphs
                  p: ({...props}) => (
                    <p className="my-2" {...props} />
                  ),
                  // Custom styling for code blocks
                  code: ({inline, className, children, ...props}: any) => {
                    return inline ? (
                      <code className="bg-secondary/50 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                    ) : (
                      <pre className="bg-secondary/50 p-3 rounded-md overflow-auto my-3">
                        <code className="text-sm font-mono" {...props}>{children}</code>
                      </pre>
                    );
                  },
                  // Custom styling for links
                  a: ({...props}) => (
                    <a className="text-brand hover:underline" {...props} />
                  ),
                }}
              >
                {isUser ? markdownContent : content || ''}
              </ReactMarkdown>
            </div>
          ) : (
            // Render plain text preserving white space
            <div
              id={`message-content-${id}`}
              className="whitespace-pre-wrap"
            >
              {sanitizedContent || ''}
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
        /* Markdown specific styles */
        .chat-message-content h1 {
          font-size: 1.5em;
          margin-bottom: 0.5em;
          font-weight: bold;
        }
        .chat-message-content h2 {
          font-size: 1.3em;
          margin-bottom: 0.5em;
          font-weight: bold;
        }
        .chat-message-content h3 {
          font-size: 1.2em;
          margin-bottom: 0.5em;
          font-weight: bold;
        }
        .chat-message-content hr {
          border: none;
          border-top: 1px solid #ccc;
          margin: 1em 0;
        }
        .chat-message-content code {
          background-color: rgba(0, 0, 0, 0.05);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
        }
        .chat-message-content pre {
          background-color: rgba(0, 0, 0, 0.05);
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
        }
        .chat-message-content pre code {
          background-color: transparent;
          padding: 0;
        }
        /* Styles for user message content */
        .user-message-content ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .user-message-content ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .user-message-content li {
          margin: 0.25rem 0 !important;
          display: list-item !important;
        }
        .user-message-content li p {
          margin: 0 !important;
        }
        /* Quill specific list styles */
        .user-message-content .ql-editor ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .user-message-content .ql-editor ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 0.5rem 0 !important;
        }
        .user-message-content .ql-editor li {
          margin: 0.25rem 0 !important;
          display: list-item !important;
          padding-left: 0 !important;
        }
        .user-message-content .ql-editor li::before {
          display: none !important;
        }
      `}} />
    </motion.div>
  )
}

export default GuidiaAiMessage