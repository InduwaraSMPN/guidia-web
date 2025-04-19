import { cn, sanitizeHtml } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

interface GuidiaAiMessageProps {
  content: string;
  timestamp: string;
  isUser: boolean;
  aiName?: string;
  isStreaming?: boolean;
  isRichText?: boolean;
}

export function GuidiaAiMessage({
  content,
  timestamp,
  isUser,
  aiName = "Guidia AI",
  isStreaming = false,
  isRichText = true, // Default to true to handle rich text content
}: GuidiaAiMessageProps) {
  const { isDark } = useThemeContext();
  const [sanitizedContent, setSanitizedContent] = useState("");

  // Sanitize content when it changes
  useEffect(() => {
    if (content) {
      // Always sanitize content to ensure safety
      // For AI responses that contain emojis and formatting, we need to ensure they're preserved
      const sanitized = isRichText ? sanitizeHtml(content) : content;
      setSanitizedContent(sanitized);
    } else {
      setSanitizedContent('');
    }
  }, [content, isRichText]);
  return (
    <div
      className={cn(
        "flex w-full mb-3 relative group items-end",
        isUser ? "justify-end" : "justify-start guidia-ai-message"
      )}
    >
      {/* Avatar for AI messages only */}
      {!isUser && (
        <div className="h-8 w-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-brand mr-1.5">
          {isDark ? (
            <img src="/images/small-logo-light.svg" alt="Guidia AI" className="h-6 w-6" />
          ) : (
            <img src="/images/small-logo-light.svg" alt="Guidia AI" className="h-6 w-6" />
          )}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2.5 shadow-sm transition-all duration-200",
          isUser
            ? "bg-brand text-white hover:bg-[#8a0024]"
            : "bg-secondary-light text-adaptive-dark hover:bg-secondary-dark"
        )}
        style={{
          borderBottomRightRadius: isUser ? 0 : undefined,
          borderBottomLeftRadius: isUser ? undefined : 0,
          transform: "scale(1)",
          transition: "transform 0.2s ease, background-color 0.2s ease",
        }}
      >
        {!isUser && (
          <p className="text-xs font-semibold mb-1 text-brand">
            {aiName}
          </p>
        )}
        <div className="text-sm leading-relaxed">
          {isRichText ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert overflow-hidden chat-message-content"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          ) : (
            <div className="whitespace-pre-wrap">{sanitizedContent}</div>
          )}
          {isStreaming && (
            <span className="inline-flex items-center ml-1">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span className="text-xs text-muted-foreground">typing</span>
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-xs mt-1 opacity-80",
            isUser ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}

export default GuidiaAiMessage;
