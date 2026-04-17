/**
 * Mezr App - Storage Service
 * AsyncStorage wrapper for persistent data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/modules';
import type { BreathPattern, ActivityEntry } from '../types';

const STORAGE_KEYS_LIST = [
  STORAGE_KEYS.BREATH_PATTERNS,
  STORAGE_KEYS.APP_HISTORY,
  STORAGE_KEYS.CLOUD_BACKUP,
] as const;

// ============================================
// CLOUD BACKUP (PR-007: Default OFF, opt-in only)
// ============================================

/**
 * Load cloud backup preference (default: OFF)
 */
export const loadCloudBackupEnabled = async (): Promise<boolean> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.CLOUD_BACKUP);
    return saved === 'true';
  } catch (error) {
    console.log('Cloud backup load error:', error);
    return false;
  }
};

/**
 * Save cloud backup preference
 */
export const saveCloudBackupEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CLOUD_BACKUP, enabled ? 'true' : 'false');
  } catch (error) {
    console.log('Cloud backup save error:', error);
  }
};

// ============================================
// BREATH PATTERNS
// ============================================

/**
 * Load custom breath patterns from storage
 * @returns Array of custom patterns (non-default)
 */
export const loadBreathPatternsFromStorage = async (): Promise<BreathPattern[]> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.BREATH_PATTERNS);
    if (saved) {
      return JSON.parse(saved) as BreathPattern[];
    }
    return [];
  } catch (error) {
    console.log('Pattern load error:', error);
    return [];
  }
};

/**
 * Save custom breath patterns to storage
 * @param patterns - Array of all patterns (will filter to custom only)
 */
export const saveBreathPatternsToStorage = async (
  patterns: BreathPattern[]
): Promise<void> => {
  try {
    const customPatterns = patterns.filter((p) => !p.isDefault);
    await AsyncStorage.setItem(
      STORAGE_KEYS.BREATH_PATTERNS,
      JSON.stringify(customPatterns)
    );
  } catch (error) {
    console.log('Pattern save error:', error);
  }
};

// ============================================
// ACTIVITY HISTORY
// ============================================

/**
 * Load activity history from storage
 * @returns Array of activity entries
 */
export const loadHistoryFromStorage = async (): Promise<ActivityEntry[]> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.APP_HISTORY);
    if (saved) {
      return JSON.parse(saved) as ActivityEntry[];
    }
    return [];
  } catch (error) {
    console.log('History load error:', error);
    return [];
  }
};

/**
 * Save activity history to storage
 * @param history - Array of activity entries
 */
export const saveHistoryToStorage = async (
  history: ActivityEntry[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.log('History save error:', error);
  }
};

/**
 * Add a new activity entry and save to storage
 * @param entry - The activity entry to add
 * @returns Updated history array
 */
export const addActivityEntry = async (
  entry: Omit<ActivityEntry, 'date'>
): Promise<ActivityEntry[]> => {
  try {
    const currentHistory = await loadHistoryFromStorage();
    const newEntry = {
      ...entry,
      date: new Date().toISOString(),
    } as ActivityEntry;
    
    const updatedHistory = [...currentHistory, newEntry];
    await saveHistoryToStorage(updatedHistory);
    return updatedHistory;
  } catch (error) {
    console.log('Add activity error:', error);
    return [];
  }
};

// ============================================
// GENERIC STORAGE HELPERS
// ============================================

/**
 * Clear all app data from storage.
 * Uses AsyncStorage.clear() to remove every key — nothing left on device.
 */
export const clearAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log('Clear storage error:', error);
  }
};

/**
 * Get a generic value from storage
 */
export const getStorageItem = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.log(`Get ${key} error:`, error);
    return null;
  }
};

/**
 * Set a generic value in storage
 */
export const setStorageItem = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(`Set ${key} error:`, error);
  }
};

// ============================================
// PRIVACY DASHBOARD (PR-012)
// ============================================

/**
 * Get approximate device storage used by app (KB).
 * Reads stored values and sums string length (UTF-16 ≈ 2 bytes per char).
 */
export const getDeviceStorageKB = async (): Promise<number> => {
  try {
    const pairs = await AsyncStorage.multiGet(STORAGE_KEYS_LIST);
    let totalChars = 0;
    for (const [, value] of pairs) {
      if (value != null) totalChars += value.length;
    }
    return Math.round((totalChars * 2) / 1024);
  } catch (error) {
    console.log('Storage size error:', error);
    return 0;
  }
};
