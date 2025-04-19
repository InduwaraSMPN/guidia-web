"use client"
import { motion } from "framer-motion"
import { cn, sanitizeHtml } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useThemeContext } from "@/contexts/ThemeContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface GuidiaAiMessageProps {
  content: string
  timestamp: string
  isUser: boolean
  aiName?: string
  isStreaming?: boolean
  isRichText?: boolean
  isFirstInSequence?: boolean
  isLastInSequence?: boolean
}

export function GuidiaAiMessage({
  content,
  timestamp,
  isUser,
  aiName = "Guidia AI",
  isStreaming = false,
  isRichText = true,
  isFirstInSequence = true,
  isLastInSequence = true,
}: GuidiaAiMessageProps) {
  const { isDark } = useThemeContext()
  const sanitizedContent = isRichText ? sanitizeHtml(content) : content

  // Animation variants
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
        isFirstInSequence ? "mt-4" : "mt-1",
        isLastInSequence ? "mb-4" : "mb-1",
      )}
    >
      {/* Avatar for AI messages only - show only for first message in sequence */}
      {!isUser && isFirstInSequence && (
        <Avatar className="h-8 w-8 mr-2 flex-shrink-0 shadow-sm border border-border/30">
          <AvatarImage src={isDark ? "/images/small-logo-light.svg" : "/images/small-logo-dark.svg"} alt="Guidia AI" />
          <AvatarFallback className="bg-white text-brand font-semibold">GA</AvatarFallback>
        </Avatar>
      )}

      {/* Spacer for alignment when not showing avatar */}
      {!isUser && !isFirstInSequence && <div className="w-10 flex-shrink-0" />}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-2.5 shadow-sm transition-all duration-200",
          isUser
            ? "bg-brand text-white hover:bg-brand-dark focus-within:ring-2 focus-within:ring-brand-light focus-within:ring-opacity-50"
            : "bg-secondary-light text-adaptive-dark hover:bg-secondary-dark focus-within:ring-2 focus-within:ring-brand focus-within:ring-opacity-30",
          isFirstInSequence && !isUser ? "rounded-tl-sm" : "",
          isFirstInSequence && isUser ? "rounded-tr-sm" : "",
          !isLastInSequence && !isUser ? "rounded-bl-sm" : "",
          !isLastInSequence && isUser ? "rounded-br-sm" : "",
        )}
        tabIndex={0}
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
        aria-live={isStreaming ? "polite" : "off"}
      >
        {!isUser && isFirstInSequence && <p className="text-xs font-semibold mb-1 text-brand">{aiName}</p>}
        <div className="text-sm leading-relaxed">
          {isRichText ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert chat-message-content focus:outline-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          ) : (
            <div className="whitespace-pre-wrap">{sanitizedContent}</div>
          )}
          {isStreaming && (
            <span className="inline-flex items-center ml-1" aria-label="AI is typing">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span className="text-xs text-muted-foreground">typing</span>
            </span>
          )}
        </div>
        <p className={cn("text-xs mt-1 opacity-80", isUser ? "text-white/80" : "text-muted-foreground")}>{timestamp}</p>
      </div>
    </motion.div>
  )
}

export default GuidiaAiMessage
