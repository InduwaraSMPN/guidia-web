interface ChatMessageProps {
  message: string;
  timestamp: string;
  isSender: boolean;
  senderName?: string;
}

export function ChatMessage({
  message,
  timestamp,
  isSender,
  senderName,
}: ChatMessageProps) {
  return (
    <div
      className={`flex w-full ${
        isSender ? "justify-end" : "justify-start"
      } mb-4 relative group`}
    >
      {/* Message bubble with improved spacing and transitions */}
      <div
        className={`max-w-[70%] rounded-lg px-5 py-3.5 shadow-sm transition-all duration-200 ${
          isSender
            ? "bg-brand text-white hover:bg-[#8a0024]"
            : "bg-secondary-light text-adaptive-dark hover:bg-secondary-dark"
        }`}
        style={{
          borderBottomRightRadius: isSender ? 0 : undefined,
          borderBottomLeftRadius: isSender ? undefined : 0,
          transform: "scale(1)",
          transition: "transform 0.2s ease, background-color 0.2s ease",
        }}
      >
        {senderName && !isSender && (
          <p className="text-xs font-semibold mb-1.5 text-blue-600">
            {senderName}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        <p
          className={`text-xs mt-2 opacity-80 ${
            isSender ? "text-gray-200" : "text-muted-foreground"
          }`}
        >
          {timestamp}
        </p>
      </div>

      {/* Enhanced triangle for chat bubble */}
      <div
        className="absolute bottom-0 w-0 h-0 transition-all duration-200"
        style={{
          borderTopWidth: "8px",
          borderTopStyle: "solid",
          borderTopColor: "transparent",
          borderRightWidth: isSender ? "8px" : 0,
          borderRightStyle: "solid",
          borderRightColor: isSender ? "#800020" : "transparent",
          borderLeftWidth: isSender ? 0 : "8px",
          borderLeftStyle: "solid",
          borderLeftColor: isSender ? "transparent" : "#f3f4f6",
          right: isSender ? "-8px" : "auto",
          left: isSender ? "auto" : "-8px",
        }}
      />
    </div>
  );
}



