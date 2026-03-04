/**
 * Mezr App - Timeline Storage Service
 * Direct AsyncStorage CRUD for TimelineActivity data.
 * Used by the timeline store, exports, migrations, and standalone queries.
 * @since v1.1.0
 * @see DECISIONS.md#D008
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TimelineActivity } from '../types/timeline';
import { STORAGE_KEYS } from '../constants/timeline';

// ============================================
// ID GENERATION
// ============================================

/**
 * Generate a UUID v4 string for timeline activity identifiers.
 * Uses Math.random — sufficient for local-only, privacy-first storage.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================
// INTERNAL HELPERS
// ============================================

/**
 * Read every timeline activity stored on disk.
 * Returns an empty array on read/parse failure (graceful degradation).
 */
export async function getAllStoredActivities(): Promise<TimelineActivity[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.TIMELINE_ACTIVITIES);
    return raw ? (JSON.parse(raw) as TimelineActivity[]) : [];
  } catch (error) {
    console.error('Timeline storage read error:', error);
    return [];
  }
}

/**
 * Overwrite the full activities array in AsyncStorage.
 */
async function persistAll(activities: TimelineActivity[]): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.TIMELINE_ACTIVITIES,
    JSON.stringify(activities),
  );
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Persist a new activity. Generates `id` and `createdAt` automatically.
 * @param activity - Activity data without id or createdAt.
 * @returns The fully-formed activity that was written to storage.
 */
export async function saveActivity(
  activity: Omit<TimelineActivity, 'id' | 'createdAt'>,
): Promise<TimelineActivity> {
  const newActivity: TimelineActivity = {
    ...activity,
    id: generateId(),
    createdAt: Date.now(),
  };

  try {
    const all = await getAllStoredActivities();
    all.push(newActivity);
    await persistAll(all);
  } catch (error) {
    console.error('Timeline save error:', error);
  }

  return newActivity;
}

/**
 * Retrieve all activities that belong to a single date.
 * @param date - Date string in YYYY-MM-DD format.
 */
export async function getActivitiesForDate(
  date: string,
): Promise<TimelineActivity[]> {
  try {
    const all = await getAllStoredActivities();
    return all.filter((a) => a.date === date);
  } catch (error) {
    console.error('Timeline date query error:', error);
    return [];
  }
}

/**
 * Retrieve activities within an inclusive date range.
 * Comparison is lexicographic on YYYY-MM-DD strings.
 * @param startDate - Inclusive start (YYYY-MM-DD).
 * @param endDate   - Inclusive end   (YYYY-MM-DD).
 */
export async function getActivitiesDateRange(
  startDate: string,
  endDate: string,
): Promise<TimelineActivity[]> {
  try {
    const all = await getAllStoredActivities();
    return all.filter((a) => a.date >= startDate && a.date <= endDate);
  } catch (error) {
    console.error('Timeline range query error:', error);
    return [];
  }
}

/**
 * Partially update an existing activity by id.
 * The `id` field is preserved and cannot be overwritten.
 * @returns The updated activity, or null if not found.
 */
export async function updateActivity(
  id: string,
  updates: Partial<TimelineActivity>,
): Promise<TimelineActivity | null> {
  try {
    const all = await getAllStoredActivities();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    all[idx] = { ...all[idx], ...updates, id };
    await persistAll(all);
    return all[idx];
  } catch (error) {
    console.error('Timeline update error:', error);
    return null;
  }
}

/**
 * Remove an activity by id.
 * @returns `true` if the activity existed and was removed, `false` otherwise.
 */
export async function deleteActivity(id: string): Promise<boolean> {
  try {
    const all = await getAllStoredActivities();
    const filtered = all.filter((a) => a.id !== id);
    if (filtered.length === all.length) return false;

    await persistAll(filtered);
    return true;
  } catch (error) {
    console.error('Timeline delete error:', error);
    return false;
  }
}

/**
 * Return every persisted timeline activity.
 * Alias for {@link getAllStoredActivities}.
 */
export async function getAllActivities(): Promise<TimelineActivity[]> {
  return getAllStoredActivities();
}

/**
 * Permanently remove all timeline activities from device storage.
 */
export async function clearAllActivities(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TIMELINE_ACTIVITIES);
  } catch (error) {
    console.error('Timeline clear error:', error);
  }
}
