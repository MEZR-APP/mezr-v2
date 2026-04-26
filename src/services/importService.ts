// src/services/importService.ts

import * as FileSystem from 'expo-file-system/legacy';
import { useActivityStore } from '../stores/activityStore';
import { useAppStore } from '../stores/appStore';
import { saveHistoryToStorage } from './storageService';
import type { ActivityEntry } from '../types';

/**
 * MEZR Import Service
 *
 * Handles importing user data from JSON backup files:
 * - Validates backup format and integrity
 * - Merges or overwrites existing data
 * - Restores settings and sessions to Zustand stores
 *
 * Privacy: All operations are device-local. No network calls.
 * Compliance: GDPR Article 20 (Data Portability)
 */

// ============================================================================
// TYPES (matching exportService.ts)
// ============================================================================

export interface SessionRecord {
  id: string;
  date: string;
  breathCycles: number;
  holdDuration: number;
  actualHoldTimes: number[];
  sessionsCompleted: number;
  totalSessions: number;
  drivingMode: boolean;
}

export interface ExportData {
  metadata: {
    exportDate: string;
    appVersion: string;
    exportFormat: '1.0';
    deviceInfo: {
      platform: 'ios' | 'android';
      appId: string;
    };
  };
  user: {
    uid: string;
    email: string;
    accountCreatedAt: string;
  };
  settings: {
    patternName: string;
    soundEnabled: boolean;
    breathHoldDuration: number;
    breathsPerSession: number;
    numberOfSessions: number;
    drivingMode: boolean;
  };
  sessions: SessionRecord[];
  statistics: {
    totalSessions: number;
    totalBreaths: number;
    totalHoldTime: number;
    averageHoldTime: number;
    bestHoldTime: number;
    dateRangeStart: string | null;
    dateRangeEnd: string | null;
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  sessionsImported: number;
  errors: string[];
}

export interface DuplicateDetectionResult {
  duplicateIds: string[];
  newSessionIds: string[];
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate that parsed data conforms to the ExportData structure.
 * Checks required fields and types without being overly strict
 * on nested field types to allow minor version drift.
 */
export function validateBackupFormat(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Backup file is empty or not valid JSON.'] };
  }

  const obj = data as Record<string, unknown>;

  // metadata
  if (!obj.metadata || typeof obj.metadata !== 'object') {
    errors.push('Missing or invalid "metadata" section.');
  } else {
    const meta = obj.metadata as Record<string, unknown>;
    if (typeof meta.exportDate !== 'string') {
      errors.push('metadata.exportDate is missing.');
    }
    if (typeof meta.exportFormat !== 'string') {
      errors.push('metadata.exportFormat is missing.');
    }
  }

  // sessions
  if (!Array.isArray(obj.sessions)) {
    errors.push('Missing or invalid "sessions" array.');
  } else {
    const sessions = obj.sessions as unknown[];
    if (sessions.length > 0) {
      const first = sessions[0] as Record<string, unknown>;
      if (typeof first.date !== 'string') {
        errors.push('Session entries must have a "date" field.');
      }
    }
  }

  // settings (optional but warn if missing)
  if (obj.settings && typeof obj.settings !== 'object') {
    errors.push('"settings" is present but not a valid object.');
  }

  // user (optional)
  if (obj.user && typeof obj.user !== 'object') {
    errors.push('"user" is present but not a valid object.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Quick structural check — is this plausibly a MEZR backup?
 */
function isPlausibleBackup(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.metadata === 'object' &&
    obj.metadata !== null &&
    Array.isArray(obj.sessions)
  );
}

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

/**
 * Detect which imported sessions already exist in the current data set.
 * Uses SessionRecord.id for primary matching, falls back to date matching
 * when IDs are unavailable.
 */
export function detectSessionDuplicates(
  newSessions: SessionRecord[],
  existing: SessionRecord[]
): DuplicateDetectionResult {
  const existingIds = new Set(existing.map((s) => s.id));
  const existingDates = new Set(existing.map((s) => s.date));

  const duplicateIds: string[] = [];
  const newSessionIds: string[] = [];

  for (const session of newSessions) {
    const isDupe = session.id
      ? existingIds.has(session.id)
      : existingDates.has(session.date);

    if (isDupe) {
      duplicateIds.push(session.id ?? session.date);
    } else {
      newSessionIds.push(session.id ?? session.date);
    }
  }

  return { duplicateIds, newSessionIds };
}

// ============================================================================
// MERGE LOGIC
// ============================================================================

/**
 * Merge imported sessions with existing ones, skipping duplicates.
 * Primary key: SessionRecord.id, fallback: date string.
 */
export function mergeSessionsWithoutDuplicates(
  newSessions: SessionRecord[],
  existing: SessionRecord[]
): SessionRecord[] {
  const existingIds = new Set(existing.map((s) => s.id));
  const existingDates = new Set(existing.map((s) => s.date));

  const uniqueNew = newSessions.filter((session) => {
    if (session.id && existingIds.has(session.id)) return false;
    if (existingDates.has(session.date)) return false;
    return true;
  });

  return [...existing, ...uniqueNew];
}

/**
 * Convert SessionRecord[] to ActivityEntry[] for the activityStore.
 * SessionRecords are breath-session specific, so they map to BreathActivityEntry.
 */
function sessionRecordsToActivityEntries(
  sessions: SessionRecord[]
): ActivityEntry[] {
  return sessions.map((session) => ({
    type: 'breath' as const,
    date: session.date,
    pattern: `Imported (${session.breathCycles} cycles, ${session.sessionsCompleted}/${session.totalSessions} sessions)`,
  }));
}

/**
 * Merge imported activity entries with existing history, deduplicating by date.
 */
function mergeActivityEntries(
  imported: ActivityEntry[],
  existing: ActivityEntry[]
): ActivityEntry[] {
  const existingDates = new Set(existing.map((e) => e.date));
  const uniqueImported = imported.filter((e) => !existingDates.has(e.date));
  return [...existing, ...uniqueImported];
}

// ============================================================================
// STORE RESTORATION
// ============================================================================

/**
 * Restore validated backup data into Zustand stores.
 *
 * - 'merge': combines imported sessions with existing, no duplicates
 * - 'overwrite': replaces all existing data with imported data
 */
export async function restoreToStores(
  data: ExportData,
  mergeStrategy: 'merge' | 'overwrite'
): Promise<{ sessionsRestored: number }> {
  const activityStore = useActivityStore.getState();
  const appStore = useAppStore.getState();

  const originalLength = activityStore.history.length;

  // Convert imported sessions to ActivityEntry format
  const importedEntries = sessionRecordsToActivityEntries(data.sessions);

  let finalHistory: ActivityEntry[];

  if (mergeStrategy === 'overwrite') {
    finalHistory = importedEntries;
  } else {
    finalHistory = mergeActivityEntries(importedEntries, activityStore.history);
  }

  // Persist to AsyncStorage first, then update Zustand
  await saveHistoryToStorage(finalHistory);

  // Force-refresh the activity store by reloading from storage
  await activityStore.loadHistory();

  // Restore settings where applicable
  if (data.settings) {
    if (typeof data.settings.soundEnabled === 'boolean') {
      appStore.setMuted(!data.settings.soundEnabled);
    }
  }

  return {
    sessionsRestored:
      mergeStrategy === 'overwrite'
        ? importedEntries.length
        : finalHistory.length - originalLength,
  };
}

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================

/**
 * Import user data from a JSON backup file on device.
 *
 * @param fileUri  Full file URI (e.g. FileSystem.documentDirectory + filename)
 * @param mergeStrategy  'merge' keeps existing data and adds new, 'overwrite' replaces all
 */
export async function importFromFile(
  fileUri: string,
  mergeStrategy: 'merge' | 'overwrite'
): Promise<ImportResult> {
  const errors: string[] = [];

  try {
    // 1. Check file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      return {
        success: false,
        message: 'Backup file not found on device.',
        sessionsImported: 0,
        errors: ['File does not exist at the specified path.'],
      };
    }

    // 2. Read file contents
    let rawJson: string;
    try {
      rawJson = await FileSystem.readAsStringAsync(fileUri);
    } catch (readErr) {
      return {
        success: false,
        message: 'Could not read the backup file. It may be corrupted.',
        sessionsImported: 0,
        errors: ['File read failed. Check file permissions.'],
      };
    }

    // 3. Parse JSON
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(rawJson);
    } catch {
      return {
        success: false,
        message: 'Backup file contains invalid JSON.',
        sessionsImported: 0,
        errors: ['JSON parse error. The file may be corrupted or truncated.'],
      };
    }

    // 4. Quick plausibility check
    if (!isPlausibleBackup(parsedData)) {
      return {
        success: false,
        message: 'This file does not appear to be a MEZR backup.',
        sessionsImported: 0,
        errors: ['File is valid JSON but not in the expected MEZR backup format.'],
      };
    }

    // 5. Full validation
    const validation = validateBackupFormat(parsedData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Backup file has formatting issues.',
        sessionsImported: 0,
        errors: validation.errors,
      };
    }

    const exportData = parsedData as ExportData;

    // 6. Check format version compatibility
    const formatVersion = exportData.metadata?.exportFormat;
    if (formatVersion && formatVersion !== '1.0') {
      errors.push(
        `Backup format version "${formatVersion}" may not be fully compatible.`
      );
    }

    // 7. Count what we're importing
    const sessionCount = exportData.sessions?.length ?? 0;
    if (sessionCount === 0 && mergeStrategy === 'merge') {
      return {
        success: true,
        message: 'Backup contains no sessions. Nothing to import.',
        sessionsImported: 0,
        errors: [],
      };
    }

    // 8. Detect duplicates (informational)
    if (mergeStrategy === 'merge') {
      const existingHistory = useActivityStore.getState().history;
      const existingDates = new Set(existingHistory.map((e) => e.date));
      const newCount = exportData.sessions.filter(
        (s) => !existingDates.has(s.date)
      ).length;

      if (newCount === 0) {
        return {
          success: true,
          message: 'All sessions in this backup already exist. Nothing new to import.',
          sessionsImported: 0,
          errors: [],
        };
      }
    }

    // 9. Restore data to stores
    const result = await restoreToStores(exportData, mergeStrategy);

    const finalMessage =
      mergeStrategy === 'overwrite'
        ? `Replaced all data with ${sessionCount} sessions from backup.`
        : `Imported ${result.sessionsRestored} new sessions (${sessionCount} total in backup).`;

    return {
      success: true,
      message: finalMessage,
      sessionsImported:
        mergeStrategy === 'overwrite' ? sessionCount : result.sessionsRestored,
      errors,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during import';

    console.error('[ImportService] Import failed:', errorMessage);

    return {
      success: false,
      message: `Import failed: ${errorMessage}`,
      sessionsImported: 0,
      errors: [errorMessage],
    };
  }
}

// ============================================================================
// UTILITY: PARSE BACKUP WITHOUT IMPORTING
// ============================================================================

/**
 * Read and parse a backup file for preview purposes without modifying stores.
 * Returns the parsed ExportData or null if invalid.
 */
export async function parseBackupForPreview(
  fileUri: string
): Promise<ExportData | null> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) return null;

    const rawJson = await FileSystem.readAsStringAsync(fileUri);

    const parsed = JSON.parse(rawJson);

    if (!isPlausibleBackup(parsed)) return null;

    const validation = validateBackupFormat(parsed);
    if (!validation.valid) return null;

    return parsed as ExportData;
  } catch (error) {
    console.error('[ImportService] Preview parse failed:', error);
    return null;
  }
}
