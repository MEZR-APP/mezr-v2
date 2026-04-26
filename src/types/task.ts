/**
 * Mezr App - Task Type Definitions
 * Core types for the quick-entry notification bar and timeline visualization
 */

// ============================================
// TASK ENTRY TYPES
// ============================================

export type TaskStatus = 'running' | 'paused' | 'completed';

export interface TaskEntry {
  id: string;               // uuid-style unique id
  name: string;             // task name (e.g. "driving to work")
  startTime: string;        // ISO string
  endTime?: string;         // ISO string — undefined while running
  pausedAt?: string;        // ISO string — when currently paused
  totalPausedMs: number;    // accumulated paused duration in ms
  status: TaskStatus;
  notifyAfterMin: number;   // reminder in minutes (user-configurable per task)
  location?: string;        // optional location label
  color: string;            // auto-assigned from palette
  dateKey: string;          // YYYY-MM-DD — for grouping by day
}

// ============================================
// SAVED / RECENT TASK TYPES
// ============================================

export interface SavedTask {
  name: string;
  lastUsed: string;  // ISO string
  count: number;     // how many times entered
}

// ============================================
// TIMELINE DISPLAY TYPES
// ============================================

export interface DayGroup {
  dateKey: string;        // YYYY-MM-DD
  label: string;          // "Today", "Yesterday", "Mon Apr 14"
  tasks: TaskEntry[];
}

// ============================================
// COLOR PALETTE
// Colors visible on dark (#000) background
// ============================================

export const TASK_COLORS = [
  '#4A90E2', // blue
  '#50E3C2', // teal
  '#7ED321', // green
  '#F5A623', // orange
  '#FF6B6B', // coral
  '#BD10E0', // purple
  '#00BFAE', // cyan-green
  '#FF9F43', // warm orange
  '#A29BFE', // lavender
  '#FD79A8', // pink
  '#00CEC9', // dark teal
  '#6C5CE7', // medium purple
] as const;

export const getTaskColor = (index: number): string =>
  TASK_COLORS[index % TASK_COLORS.length];
