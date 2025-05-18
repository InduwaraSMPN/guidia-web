import { formatDateForDivider } from "@/features/chat/lib/utils";

interface Message {
  messageID: string;
  timestamp: string;
  message: string;
  isSender: boolean;
  senderID: string;
  receiverID: string;
  senderName?: string;
  senderImage?: string;
  read?: boolean;
  pending?: boolean;
}

/**
 * Group messages by date for displaying date dividers
 * @param messages Array of message objects
 * @returns Array of grouped messages by date
 */
export function groupMessagesByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: { [key: string]: Message[] } = {};

  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const dateString = date.toDateString(); // Use date string as key

    if (!groups[dateString]) {
      groups[dateString] = [];
    }

    groups[dateString].push(message);
  });

  // Convert to array and sort by date
  return Object.entries(groups)
    .map(([dateString, messages]) => ({
      date: formatDateForDivider(new Date(dateString)),
      messages
    }))
    .sort((a, b) => {
      // Sort by the first message's timestamp in each group
      const dateA = new Date(a.messages[0].timestamp);
      const dateB = new Date(b.messages[0].timestamp);
      return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Format a date for display in a date divider
 * @param date Date object or string
 * @returns Formatted date string (Today, Yesterday, or formatted date)
 */
export function formatDateForDivider(date: Date | string): string {
  const inputDate = date instanceof Date ? date : new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if date is today
  if (inputDate.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if date is yesterday
  if (inputDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Otherwise return formatted date
  return inputDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

/**
 * Format time for display in a message
 * @param timestamp ISO timestamp string
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatMessageTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
