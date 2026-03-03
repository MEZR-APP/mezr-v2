/**
 * Mezr App - Timeline Feature Constants
 * @since v1.1.0
 * @see DECISIONS.md#D008
 */

import type { TimelineCategory, TimelineState } from '../types/timeline';

// ============================================
// CATEGORY VISUAL MAPS
// ============================================

/** Hex colors rendered on each timeline block, keyed by category. */
export const CATEGORY_COLORS = {
  breathwork: '#4ADE80',
  movement: '#3B82F6',
  mindfulness: '#8B5CF6',
  work: '#F59E0B',
  gym: '#EF4444',
  other: '#6B7280',
} as const satisfies Record<TimelineCategory, string>;

/** Human-readable labels for each category. */
export const CATEGORY_LABELS = {
  breathwork: 'Breathwork',
  movement: 'Movement',
  mindfulness: 'Mindfulness',
  work: 'Work',
  gym: 'Gym',
  other: 'Other',
} as const satisfies Record<TimelineCategory, string>;

/** Emoji dot icons used in compact list views. */
export const CATEGORY_ICONS = {
  breathwork: '🟢',
  movement: '🔵',
  mindfulness: '🟣',
  work: '🟠',
  gym: '🔴',
  other: '⚪',
} as const satisfies Record<TimelineCategory, string>;

// ============================================
// STORAGE
// ============================================

/** AsyncStorage keys scoped to the timeline feature. */
export const STORAGE_KEYS = {
  TIMELINE_ACTIVITIES: '@mezr/timeline-activities',
} as const;

// ============================================
// DEFAULT STATE
// ============================================

/** Returns today's date as YYYY-MM-DD in the device's local timezone. */
const todayISO = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/** Initial Zustand state for the timeline slice. */
export const DEFAULT_TIMELINE_STATE: TimelineState = {
  activities: [],
  selectedDate: todayISO(),
  isLoading: false,
  error: null,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Resolve the hex color for a category.
 * Falls back to the "other" color for unknown categories.
 */
export function getCategoryColor(category: string): string {
  return (CATEGORY_COLORS as Record<string, string>)[category] ?? CATEGORY_COLORS.other;
}

/**
 * Resolve the human-readable label for a category.
 * Falls back to "Other" for unknown categories.
 */
export function getCategoryLabel(category: string): string {
  return (CATEGORY_LABELS as Record<string, string>)[category] ?? CATEGORY_LABELS.other;
}

/**
 * Resolve the emoji icon for a category.
 * Falls back to ⚪ for unknown categories.
 */
export function getCategoryIcon(category: string): string {
  return (CATEGORY_ICONS as Record<string, string>)[category] ?? CATEGORY_ICONS.other;
}
