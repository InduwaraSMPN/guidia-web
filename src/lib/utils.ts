import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileExtension(filename: string): string {
  if (!filename) return '';
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Strips HTML tags from a string
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '');
}

/**
 * Formats a meeting type string with a bidirectional arrow
 * e.g., 'student_counselor' becomes 'Student ↔ Counselor'
 */
export function formatMeetingType(type: string): string {
  if (!type) return '';

  switch (type) {
    case 'student_company':
      return 'Student ↔ Company';
    case 'student_counselor':
      return 'Student ↔ Counselor';
    case 'company_counselor':
      return 'Company ↔ Counselor';
    case 'student_student':
      return 'Student ↔ Student';
    case 'company_company':
      return 'Company ↔ Company';
    case 'counselor_counselor':
      return 'Counselor ↔ Counselor';
    default:
      // Try to format unknown types by splitting on underscore
      const parts = type.split('_');
      if (parts.length === 2) {
        return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ↔ ');
      }
      return type;
  }
}
