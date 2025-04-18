import { cn } from "@/lib/utils";

interface GuidiaAiMessageProps {
  content: string;
  timestamp: string;
  isUser: boolean;
  aiName?: string;
}

export function GuidiaAiMessage({
  content,
  timestamp,
  isUser,
  aiName = "Guidia AI",
}: GuidiaAiMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full mb-3 relative group items-end",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for AI messages only */}
      {!isUser && (
        <div className="h-8 w-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-brand mr-1.5">
          <span className="text-white font-grillmaster text-sm">G</span>
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
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        <p
          className={cn(
            "text-xs mt-1 opacity-80",
            isUser ? "text-white/80" : "text-muted-foreground"
          )}
        >
          {timestamp}
        </p>
      </div>

      {/* Triangle for chat bubble */}
      <div
        className="absolute bottom-0 w-0 h-0 transition-all duration-200"
        style={{
          borderTopWidth: "8px",
          borderTopStyle: "solid",
          borderTopColor: "transparent",
          borderRightWidth: isUser ? "8px" : 0,
          borderRightStyle: "solid",
          borderRightColor: isUser ? "#800020" : "transparent",
          borderLeftWidth: isUser ? 0 : "8px",
          borderLeftStyle: "solid",
          borderLeftColor: isUser ? "transparent" : "#f3f4f6",
          right: isUser ? "-8px" : "auto",
          left: isUser ? "auto" : "-8px",
        }}
      />
    </div>
  );
}

export default GuidiaAiMessage;
