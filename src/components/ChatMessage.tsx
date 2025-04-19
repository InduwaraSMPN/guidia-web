import { User } from "lucide-react";
import { AzureImage, CompanyImage, CounselorImage, StudentImage } from "@/lib/imageUtils";

interface ChatMessageProps {
  message: string;
  timestamp: string;
  isSender: boolean;
  senderName?: string;
  senderImage?: string;
  senderType?: 'student' | 'counselor' | 'company' | 'admin';
}

export function ChatMessage({
  message,
  timestamp,
  isSender,
  senderName,
  senderImage,
  senderType = 'student',
}: ChatMessageProps) {
  return (
    <div
      className={`flex w-full ${
        isSender ? "justify-end" : "justify-start"
      } mb-3 relative group items-end`}
    >
      {/* Avatar for receiver messages only */}
      {!isSender && (
        <div className="h-8 w-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center bg-secondary-dark mr-1.5">
          {senderImage ? (
            senderType === 'company' ? (
              <CompanyImage
                src={senderImage}
                alt={senderName || "Sender"}
                className="h-full w-full object-cover"
                fallbackSrc="/company-avatar.png"
              />
            ) : senderType === 'counselor' ? (
              <CounselorImage
                src={senderImage}
                alt={senderName || "Sender"}
                className="h-full w-full object-cover"
                fallbackSrc="/counselor-avatar.png"
              />
            ) : (
              <StudentImage
                src={senderImage}
                alt={senderName || "Sender"}
                className="h-full w-full object-cover"
                fallbackSrc="/student-avatar.png"
              />
            )
          ) : (
            <User className="h-4 w-4 text-white" />
          )}
        </div>
      )}

      {/* Message bubble with improved spacing and transitions */}
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2.5 shadow-sm transition-all duration-200 ${
          isSender
            ? "bg-brand text-white"
            : "bg-secondary-light text-adaptive-dark"
        }`}
        style={{
          borderBottomRightRadius: isSender ? 0 : undefined,
          borderBottomLeftRadius: isSender ? undefined : 0,
          transform: "scale(1)",
          transition: "transform 0.2s ease, background-color 0.2s ease",
        }}
      >
        {senderName && !isSender && (
          <p className="text-xs font-semibold mb-1 text-blue-600">
            {senderName}
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        <p
          className={`text-xs mt-1 opacity-80 ${
            isSender ? "text-white/80" : "text-muted-foreground"
          }`}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
}



