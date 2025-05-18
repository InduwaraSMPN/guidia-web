import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from "dompurify";

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
 * Formats plain text as HTML by converting line breaks to <br> tags
 * and wrapping paragraphs in <p> tags
 * @param text Plain text to format as HTML
 * @returns Formatted HTML string
 */
export function formatTextAsHtml(text: string): string {
  if (!text) return '';

  // Split text by double line breaks (paragraphs)
  const paragraphs = text.split(/\n\s*\n/);

  // Process each paragraph
  return paragraphs.map(para => {
    // Replace single line breaks with <br>
    const withLineBreaks = para.replace(/\n/g, '<br>');
    return `<p>${withLineBreaks}</p>`;
  }).join('');
}

/**
 * Checks if a string contains HTML tags
 * @param text Text to check
 * @returns Boolean indicating if the text contains HTML tags
 */
export function containsHtmlTags(text: string): boolean {
  if (!text) return false;
  return /<[a-z][\s\S]*>/i.test(text);
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Special handling for content with emojis
  // First, check if the content is just plain text with emojis
  const hasHtmlTags = containsHtmlTags(html);

  if (!hasHtmlTags) {
    // If it's just plain text with emojis, format it as HTML
    return formatTextAsHtml(html);
  }

  // Configure DOMPurify to preserve list structure
  DOMPurify.addHook('afterSanitizeAttributes', function(node) {
    // Ensure list items have proper display
    if (node.tagName === 'LI') {
      node.setAttribute('style', 'display: list-item !important; margin-left: 0 !important;');
      // Add a class to help with styling
      node.setAttribute('class', (node.getAttribute('class') || '') + ' ql-list-item');
    }
    // Ensure lists have proper styling
    if (node.tagName === 'UL') {
      node.setAttribute('style', 'list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important;');
      // Add a class to help with styling
      node.setAttribute('class', (node.getAttribute('class') || '') + ' ql-list ql-bullet');
    }
    if (node.tagName === 'OL') {
      node.setAttribute('style', 'list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.5rem 0 !important;');
      // Add a class to help with styling
      node.setAttribute('class', (node.getAttribute('class') || '') + ' ql-list ql-numbered');
    }
  });

  // Sanitize the HTML
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'span',
      'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'img', 'figure', 'figcaption', 'hr', 'section', 'article', 'aside', 'details',
      'summary', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'style', 'src', 'alt', 'title', 'width', 'height',
      'id', 'name', 'align', 'valign', 'border', 'cellpadding', 'cellspacing'
    ],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'style'], // Allow target and style attributes
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false
  });

  // Remove the hook after sanitization
  DOMPurify.removeHook('afterSanitizeAttributes');

  return sanitized;
}

/**
 * Formats a meeting type string with a bidirectional arrow
 * e.g., 'student_counselor' becomes 'Student ↔ Counselor'
 */
export function formatMeetingType(type: string): string {
  if (!type) return 'Unspecified';

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
    case 'unspecified':
      return 'Unspecified';
    default:
      // Try to format unknown types by splitting on underscore
      const parts = type.split('_');
      if (parts.length === 2) {
        return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ↔ ');
      }
      return type || 'Unspecified';
  }
}
