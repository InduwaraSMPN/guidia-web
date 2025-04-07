import { cn } from '@/lib/utils';
import { Message } from './types';

export { cn };

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

export function formatDateForDivider(input: string | number): string {
  const date = new Date(input);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if date is today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Otherwise return formatted date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// Group messages by date for displaying date dividers
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
      date: formatDateForDivider(dateString),
      messages
    }))
    .sort((a, b) => {
      // Sort by the first message's timestamp in each group
      const dateA = new Date(a.messages[0].timestamp);
      const dateB = new Date(b.messages[0].timestamp);
      return dateA.getTime() - dateB.getTime();
    });
}
