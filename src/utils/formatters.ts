/**
 * Mezr App - Utility Functions
 * Formatters and helper functions
 */

/**
 * Format seconds into MM:SS display
 * @param seconds - Total seconds
 * @returns Formatted string like "5:30"
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format milliseconds into seconds with decimal
 * @param ms - Milliseconds
 * @returns Formatted string like "2.5"
 */
export const formatMsToSeconds = (ms: number): string => {
  return (ms / 1000).toFixed(1);
};

/**
 * Parse seconds string to number, with fallback
 * @param value - String value to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed number or fallback
 */
export const parseSeconds = (value: string, fallback: number = 0): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Parse integer string to number, with fallback
 * @param value - String value to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed integer or fallback
 */
export const parseInteger = (value: string, fallback: number = 0): number => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Clamp a number between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Format a date ISO string to readable format
 * @param isoString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date ISO string to time format
 * @param isoString - ISO date string
 * @returns Formatted time string
 */
export const formatTimeOfDay = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param isoString - ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(isoString);
};
