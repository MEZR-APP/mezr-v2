/**
 * Mezr App - Timeline Store
 * Zustand store with persist middleware for timeline activity state.
 * Persist auto-hydrates activities from AsyncStorage on launch and
 * writes back whenever the activities array changes.
 * @since v1.1.0
 * @see DECISIONS.md#D008
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ActivityEntry } from '../types';
import type {
  TimelineActivity,
  TimelineCategory,
  TimelineModule,
  TimelineState,
  TimelineActions,
} from '../types/timeline';
import { STORAGE_KEYS, getCategoryColor } from '../constants/timeline';
import { generateId } from '../services/timelineService';

// ============================================
// MODULE → TIMELINE MAPPING
// ============================================

const MODULE_TO_CATEGORY: Record<string, TimelineCategory> = {
  breath: 'breathwork',
  swim: 'movement',
  meditate: 'mindfulness',
  run: 'movement',
  cycle: 'movement',
};

/** Only these module types map to a non-null TimelineModule. */
const TIMELINE_MODULE_SET = new Set<string>(['breath', 'swim', 'meditate']);

const MODULE_TITLES: Record<string, string> = {
  breath: 'Breathwork',
  swim: 'Swimming',
  meditate: 'Meditation',
  run: 'Running',
  cycle: 'Cycling',
};

/** Default auto-logged session duration: 15 minutes in ms. */
const AUTO_LOG_DURATION_MS = 900_000;

// ============================================
// HELPERS
// ============================================

/** Returns today's date as YYYY-MM-DD in the device's local timezone. */
function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ============================================
// STORE INTERFACE
// ============================================

interface TimelineStore extends TimelineState, TimelineActions {
  /** Remove all timeline activities from state and storage. */
  clearAllActivities: () => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

const useTimelineStore = create<TimelineStore>()(
  persist(
    (set, get) => ({
      // ---- State ----
      activities: [],
      selectedDate: todayISO(),
      isLoading: false,
      error: null,

      // ---- Actions ----

      /**
       * Set the viewing date. Activities are already hydrated in memory via
       * persist middleware, so no async I/O is needed.
       */
      loadActivitiesForDate: async (date) => {
        set({ selectedDate: date, isLoading: true, error: null });
        set({ isLoading: false });
      },

      /** Create a new activity with auto-generated id and createdAt. */
      addActivity: async (activity) => {
        try {
          const newActivity: TimelineActivity = {
            ...activity,
            id: generateId(),
            createdAt: Date.now(),
          };
          set((state) => ({
            activities: [...state.activities, newActivity],
            error: null,
          }));
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : 'Failed to add activity';
          set({ error: msg });
          console.error('Timeline addActivity error:', error);
        }
      },

      /** Partially update an existing activity by id. */
      editActivity: async (id, updates) => {
        try {
          set((state) => ({
            activities: state.activities.map((a) =>
              a.id === id ? { ...a, ...updates, id } : a,
            ),
            error: null,
          }));
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : 'Failed to edit activity';
          set({ error: msg });
          console.error('Timeline editActivity error:', error);
        }
      },

      /** Remove an activity by id from state (persist propagates to storage). */
      deleteActivity: async (id) => {
        try {
          set((state) => ({
            activities: state.activities.filter((a) => a.id !== id),
            error: null,
          }));
        } catch (error) {
          const msg =
            error instanceof Error
              ? error.message
              : 'Failed to delete activity';
          set({ error: msg });
          console.error('Timeline deleteActivity error:', error);
        }
      },

      /** Switch the visible date on the timeline. */
      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      /**
       * Convert a completed module session (ActivityEntry) into a
       * TimelineActivity and add it to the timeline.
       *
       * Mapping:
       *   breath   → breathwork  (🟢)
       *   swim     → movement    (🔵)
       *   meditate → mindfulness (🟣)
       *   run      → movement    (🔵)
       *   cycle    → movement    (🔵)
       *
       * startTime is derived from entry.date (ISO string).
       * endTime   = startTime + 15 min (900 000 ms).
       */
      autoLogActivity: async (entry: ActivityEntry) => {
        try {
          const category: TimelineCategory =
            MODULE_TO_CATEGORY[entry.type] ?? 'other';

          const module: TimelineModule = TIMELINE_MODULE_SET.has(entry.type)
            ? (entry.type as TimelineModule)
            : null;

          const startTime = new Date(entry.date).getTime();
          const endTime = startTime + AUTO_LOG_DURATION_MS;
          const date = entry.date.slice(0, 10);

          await get().addActivity({
            date,
            startTime,
            endTime,
            category,
            module,
            title: MODULE_TITLES[entry.type] ?? 'Activity',
            color: getCategoryColor(category),
            isManual: false,
          });
        } catch (error) {
          console.error('Timeline autoLog error:', error);
        }
      },

      /** Clear the current error state. */
      clearError: () => {
        set({ error: null });
      },

      /** Wipe all timeline activities from state and storage. */
      clearAllActivities: () => {
        set({ activities: [], error: null });
      },
    }),
    {
      name: STORAGE_KEYS.TIMELINE_ACTIVITIES,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ activities: state.activities }),
    },
  ),
);

export default useTimelineStore;

// ============================================
// SELECTORS
// ============================================

/** Activities filtered to the currently selected date. */
export const useActivitiesForSelectedDate = () =>
  useTimelineStore((state) =>
    state.activities.filter((a) => a.date === state.selectedDate),
  );

/** Activities filtered to an arbitrary date string. */
export const useActivitiesForDate = (date: string) =>
  useTimelineStore((state) =>
    state.activities.filter((a) => a.date === date),
  );
