import { format } from 'date-fns';

/**
 * Safely formats a date string to a human-readable format
 * Handles various date formats and provides fallbacks for invalid dates
 *
 * @param dateStr The date string to format
 * @param formatStr The format string to use (default: 'MMMM d, yyyy')
 * @param fallbackText The text to return if the date is invalid (default: the original date string)
 * @returns Formatted date string
 */
export function formatSafeDate(
  dateStr: string | null | undefined,
  formatStr: string = 'MMMM d, yyyy',
  fallbackText?: string
): string {
  try {
    // Check if dateStr is valid
    if (!dateStr) {
      return fallbackText || 'Date not available';
    }

    // Handle different date formats
    if (dateStr.includes('-')) {
      // Format: YYYY-MM-DD
      const [year, month, day] = dateStr.split('-').map(Number);

      // Validate date components
      if (isNaN(year) || isNaN(month) || isNaN(day) ||
          year < 2000 || year > 2100 ||
          month < 1 || month > 12 ||
          day < 1 || day > 31) {
        return fallbackText || dateStr; // Return fallback or raw string if invalid
      }

      // Create date with local timezone (months are 0-indexed in JS Date)
      const date = new Date(year, month - 1, day);
      return format(date, formatStr);
    } else if (dateStr.includes('/')) {
      // Format: MM/DD/YYYY or DD/MM/YYYY
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        // Assume MM/DD/YYYY format
        const month = parseInt(parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);

        // Validate date components
        if (isNaN(year) || isNaN(month) || isNaN(day) ||
            year < 2000 || year > 2100 ||
            month < 1 || month > 12 ||
            day < 1 || day > 31) {
          return fallbackText || dateStr; // Return fallback or raw string if invalid
        }

        const date = new Date(year, month - 1, day);
        return format(date, formatStr);
      }
    }

    // Handle ISO date strings with timezone information (e.g., 2025-04-14T18:30:00.000Z)
    if (dateStr.includes('T')) {
      try {
        // Extract just the date part from the ISO string
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);

        // Validate date components
        if (!isNaN(year) && !isNaN(month) && !isNaN(day) &&
            year >= 2000 && year <= 2100 &&
            month >= 1 && month <= 12 &&
            day >= 1 && day <= 31) {
          // Create date with local timezone (months are 0-indexed in JS Date)
          const date = new Date(year, month - 1, day);
          return format(date, formatStr);
        }
      } catch (error) {
        console.error('Error parsing ISO date:', error);
      }
    }

    // If we get here, try to parse as a timestamp or ISO date
    const timestamp = Date.parse(dateStr);
    if (!isNaN(timestamp)) {
      const date = new Date(timestamp);
      return format(date, formatStr);
    }

    // If all else fails, return the fallback or raw string
    return fallbackText || dateStr;
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallbackText || dateStr; // Fallback to the raw date string
  }
}

/**
 * Safely parses a date string to a Date object
 * Handles various date formats and provides fallbacks for invalid dates
 *
 * @param dateStr The date string to parse
 * @param fallback The fallback date to use if parsing fails (default: new Date())
 * @returns Date object
 */
export function parseSafeDate(dateStr: string | null | undefined, fallback: Date = new Date()): Date {
  try {
    // Check if dateStr is valid
    if (!dateStr) {
      return fallback;
    }

    // Handle different date formats
    if (dateStr.includes('-')) {
      // Format: YYYY-MM-DD
      const [year, month, day] = dateStr.split('-').map(Number);

      // Validate date components
      if (isNaN(year) || isNaN(month) || isNaN(day) ||
          year < 2000 || year > 2100 ||
          month < 1 || month > 12 ||
          day < 1 || day > 31) {
        return fallback;
      }

      // Create date with local timezone (months are 0-indexed in JS Date)
      return new Date(year, month - 1, day);
    } else if (dateStr.includes('/')) {
      // Format: MM/DD/YYYY or DD/MM/YYYY
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        // Assume MM/DD/YYYY format
        const month = parseInt(parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);

        // Validate date components
        if (isNaN(year) || isNaN(month) || isNaN(day) ||
            year < 2000 || year > 2100 ||
            month < 1 || month > 12 ||
            day < 1 || day > 31) {
          return fallback;
        }

        return new Date(year, month - 1, day);
      }
    }

    // Handle ISO date strings with timezone information (e.g., 2025-04-14T18:30:00.000Z)
    if (dateStr.includes('T')) {
      try {
        // Extract just the date part from the ISO string
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);

        // Validate date components
        if (!isNaN(year) && !isNaN(month) && !isNaN(day) &&
            year >= 2000 && year <= 2100 &&
            month >= 1 && month <= 12 &&
            day >= 1 && day <= 31) {
          // Create date with local timezone (months are 0-indexed in JS Date)
          return new Date(year, month - 1, day);
        }
      } catch (error) {
        console.error('Error parsing ISO date:', error);
      }
    }

    // If we get here, try to parse as a timestamp or ISO date
    const timestamp = Date.parse(dateStr);
    if (!isNaN(timestamp)) {
      return new Date(timestamp);
    }

    // If all else fails, return the fallback
    return fallback;
  } catch (error) {
    console.error('Error parsing date:', error);
    return fallback;
  }
}

/**
 * Format a time string (HH:MM) to a more readable format (h:MM AM/PM)
 *
 * @param time Time string in 24-hour format (HH:MM)
 * @returns Formatted time string in 12-hour format with AM/PM
 */
export function formatTime(time: string): string {
  if (!time) return '';

  try {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time;

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
}

/**
 * Format a local date in YYYY-MM-DD format
 * Avoids timezone issues by using local date components
 *
 * @param date Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
