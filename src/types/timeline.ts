/**
 * Mezr App - Timeline Feature Type Definitions
 * @since v1.1.0
 * @see DECISIONS.md#D008
 */

import type { ActivityEntry } from './index';

// ============================================
// TIMELINE CATEGORY TYPES
// ============================================

/** Supported timeline activity categories for color-coded time blocks. */
export type TimelineCategory =
  | 'breathwork'
  | 'movement'
  | 'mindfulness'
  | 'work'
  | 'gym'
  | 'other';

/** Module types that can auto-log into the timeline. */
export type TimelineModule = 'breath' | 'swim' | 'meditate' | null;

// ============================================
// TIMELINE ACTIVITY
// ============================================

/** A single time block on the infinite-scroll timeline. */
export interface TimelineActivity {
  /** Unique identifier (UUID v4). */
  id: string;
  /** Date the activity belongs to (ISO YYYY-MM-DD). */
  date: string;
  /** Activity start time in Unix milliseconds. */
  startTime: number;
  /** Activity end time in Unix milliseconds. */
  endTime: number;
  /** Visual category that determines the color band. */
  category: TimelineCategory;
  /** Originating MEZR module, or null for manual entries. */
  module: TimelineModule;
  /** Links back to the module session that auto-created this entry. */
  moduleSessionId?: string;
  /** User-facing label shown on the timeline block. */
  title: string;
  /** Optional freeform notes attached to the block. */
  notes?: string;
  /** Hex color rendered on the timeline strip. */
  color: string;
  /** True when the user created this entry manually (not auto-logged). */
  isManual: boolean;
  /** Timestamp when the entry was persisted (Unix ms). */
  createdAt: number;
}

// ============================================
// TIMELINE STORE STATE
// ============================================

/** Zustand slice state for the timeline feature. */
export interface TimelineState {
  /** Activities loaded for the currently selected date. */
  activities: TimelineActivity[];
  /** The date the user is viewing (YYYY-MM-DD). */
  selectedDate: string;
  /** True while activities are being read from storage. */
  isLoading: boolean;
  /** Last error message, or null when healthy. */
  error: string | null;
}

// ============================================
// TIMELINE STORE ACTIONS
// ============================================

/** Zustand slice actions for the timeline feature. */
export interface TimelineActions {
  /** Fetch and hydrate activities for a given date from async storage. */
  loadActivitiesForDate(date: string): Promise<void>;
  /** Persist a new activity (id and createdAt are generated automatically). */
  addActivity(activity: Omit<TimelineActivity, 'id' | 'createdAt'>): Promise<void>;
  /** Partially update an existing activity by id. */
  editActivity(id: string, updates: Partial<TimelineActivity>): Promise<void>;
  /** Remove an activity by id from storage and state. */
  deleteActivity(id: string): Promise<void>;
  /** Switch the visible date on the timeline. */
  setSelectedDate(date: string): void;
  /** Auto-log a timeline entry when a module session completes. */
  autoLogActivity(entry: ActivityEntry): Promise<void>;
  /** Clear the current error state. */
  clearError(): void;
}
