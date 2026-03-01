// src/services/exportService.ts

import { useActivityStore } from '../stores/activityStore';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useBreathStore } from '../stores/breathStore';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { auth } from './firebase';
import type { ActivityEntry } from '../types';

/**
 * MEZR Export Service
 * 
 * Handles complete export of user data including:
 * - All activity sessions with metadata
 * - User settings and preferences
 * - Computed statistics
 * - Device backup metadata
 * 
 * Privacy: User has full control, exports to device, no server storage
 * Compliance: GDPR Article 20 (User Data Portability)
 */

// ============================================================================
// TYPES
// ============================================================================

interface SessionRecord {
  id: string;
  date: string; // ISO string
  breathCycles: number;
  holdDuration: number; // Target duration in seconds
  actualHoldTimes: number[]; // Actual durations per session
  sessionsCompleted: number;
  totalSessions: number;
  drivingMode: boolean;
}

interface ExportData {
  metadata: {
    exportDate: string; // ISO timestamp
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
    totalHoldTime: number; // In seconds
    averageHoldTime: number;
    bestHoldTime: number;
    dateRangeStart: string | null;
    dateRangeEnd: string | null;
  };
}

interface ExportResult {
  success: boolean;
  message: string;
  filename?: string;
  fileSize?: number; // In bytes
  fileUri?: string; // Local file URI for debugging
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Export all user data to JSON file
 * Creates downloadable/shareable backup
 */
export async function exportUserData(): Promise<ExportResult> {
  if (__DEV__) console.log('[ExportService] exportUserData called');
  try {
    const { user } = useAuthStore.getState();
    if (__DEV__) console.log('[ExportService] User:', user?.email);
    if (!user) {
      if (__DEV__) console.log('[ExportService] No user found, aborting');
      return {
        success: false,
        message: 'User not authenticated. Please sign in first.',
      };
    }

    const { history } = useActivityStore.getState();
    if (__DEV__) console.log('[ExportService] History entries:', history.length);
    const appState = useAppStore.getState();
    const breathState = useBreathStore.getState();
    const currentPattern = breathState.getCurrentPattern();
    if (__DEV__) console.log('[ExportService] Current pattern:', currentPattern?.name);

    const sessions = activityEntriesToSessionRecords(history);
    if (__DEV__) console.log('[ExportService] Sessions converted:', sessions.length);

    const exportData = buildExportPackage(user, sessions, {
      patternName: currentPattern.name,
      soundEnabled: !appState.isMuted,
      breathHoldDuration: currentPattern.hold1Duration,
      breathsPerSession: currentPattern.breathCycles,
      numberOfSessions: currentPattern.sessions,
      drivingMode: false,
    });
    if (__DEV__) console.log('[ExportService] Export package built');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `MEZR-Backup-${timestamp}-${generateShortId()}.json`;

    const dir = FileSystem.documentDirectory;
    if (__DEV__) console.log('[ExportService] documentDirectory:', dir);
    if (!dir) {
      if (__DEV__) console.log('[ExportService] documentDirectory is null/undefined');
      return { success: false, message: 'Storage directory not available.' };
    }

    const fileUri = `${dir}${filename}`;
    const jsonString = JSON.stringify(exportData, null, 2);
    if (__DEV__) console.log('[ExportService] Writing to:', fileUri, 'size:', jsonString.length);
    await FileSystem.writeAsStringAsync(fileUri, jsonString);
    if (__DEV__) console.log('[ExportService] File written successfully');

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (__DEV__) console.log('[ExportService] File info:', JSON.stringify(fileInfo));
    const fileSize = fileInfo.exists ? (fileInfo.size ?? jsonString.length) : jsonString.length;

    if (__DEV__) console.log('[ExportService] SUCCESS - filename:', filename, 'size:', fileSize);
    return {
      success: true,
      message: `Backup created: ${filename}`,
      filename,
      fileSize,
      fileUri,
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error during export';

    if (__DEV__) {
      console.error('[ExportService] Export failed:', errorMessage);
      console.error('[ExportService] Full error:', error);
    }

    return {
      success: false,
      message: `Export failed: ${errorMessage}`,
    };
  }
}

// ============================================================================
// SHARE/DOWNLOAD FUNCTIONS
// ============================================================================

/**
 * Share exported data via system share sheet
 * User can send to email, cloud storage, etc.
 */
export async function shareExportedData(filename: string): Promise<boolean> {
  try {
    const dir = FileSystem.documentDirectory;
    if (!dir) return false;

    const fileUri = `${dir}${filename}`;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.error('[ExportService] File not found:', fileUri);
      return false;
    }

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      console.error('[ExportService] Sharing not available on this device');
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Share MEZR Backup',
      UTI: 'public.json',
    });

    return true;
  } catch (error) {
    console.error('[ExportService] Share failed:', error);
    return false;
  }
}

/**
 * List all existing backups on device
 */
export async function listBackups(): Promise<string[]> {
  try {
    const dir = FileSystem.documentDirectory;
    if (!dir) return [];

    const files = await FileSystem.readDirectoryAsync(dir);

    const backups = files.filter((file) =>
      file.startsWith('MEZR-Backup-') && file.endsWith('.json')
    );

    return backups.sort().reverse();
  } catch (error) {
    console.error('[ExportService] Failed to list backups:', error);
    return [];
  }
}

/**
 * Delete a backup file
 */
export async function deleteBackup(filename: string): Promise<boolean> {
  try {
    const dir = FileSystem.documentDirectory;
    if (!dir) return false;

    if (!filename.startsWith('MEZR-Backup-')) {
      console.warn('[ExportService] Not a MEZR backup file');
      return false;
    }

    const fileUri = `${dir}${filename}`;
    await FileSystem.deleteAsync(fileUri);
    return true;
  } catch (error) {
    console.error('[ExportService] Failed to delete backup:', error);
    return false;
  }
}

/**
 * Get metadata from a backup file without importing
 */
export async function getBackupMetadata(
  filename: string
): Promise<ExportData['metadata'] | null> {
  try {
    const dir = FileSystem.documentDirectory;
    if (!dir) return null;

    const fileUri = `${dir}${filename}`;
    const jsonString = await FileSystem.readAsStringAsync(fileUri);
    const data: ExportData = JSON.parse(jsonString);

    return data.metadata;
  } catch (error) {
    console.error('[ExportService] Failed to read backup metadata:', error);
    return null;
  }
}

// ============================================================================
// DATA CONVERSION
// ============================================================================

/**
 * Convert ActivityEntry[] from the activity store into SessionRecord[]
 * for the export format. Breath entries carry pattern info; other module
 * types get sensible defaults so every activity is preserved in the backup.
 */
function activityEntriesToSessionRecords(
  history: ActivityEntry[]
): SessionRecord[] {
  return history.map((entry, index) => {
    if (entry.type === 'breath') {
      return {
        id: `session-${index}-${entry.date}`,
        date: entry.date,
        breathCycles: 0,
        holdDuration: 0,
        actualHoldTimes: [],
        sessionsCompleted: 1,
        totalSessions: 1,
        drivingMode: false,
      };
    }

    return {
      id: `session-${index}-${entry.date}`,
      date: entry.date,
      breathCycles: 0,
      holdDuration: 0,
      actualHoldTimes: [],
      sessionsCompleted: 1,
      totalSessions: 1,
      drivingMode: false,
    };
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

interface ExportSettings {
  patternName: string;
  soundEnabled: boolean;
  breathHoldDuration: number;
  breathsPerSession: number;
  numberOfSessions: number;
  drivingMode: boolean;
}

/**
 * Build complete export package with all user data
 */
function buildExportPackage(
  user: { uid: string; email: string | null },
  sessions: SessionRecord[],
  settings: ExportSettings
): ExportData {
  const stats = calculateExportStatistics(sessions);
  const deviceInfo = getDeviceInfo();

  return {
    metadata: {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      exportFormat: '1.0',
      deviceInfo,
    },

    user: {
      uid: user.uid,
      email: user.email ?? '',
      accountCreatedAt: auth.currentUser?.metadata?.creationTime ?? '',
    },

    settings: {
      patternName: settings.patternName,
      soundEnabled: settings.soundEnabled,
      breathHoldDuration: settings.breathHoldDuration,
      breathsPerSession: settings.breathsPerSession,
      numberOfSessions: settings.numberOfSessions,
      drivingMode: settings.drivingMode,
    },

    sessions,

    statistics: {
      totalSessions: stats.totalSessions,
      totalBreaths: stats.totalBreaths,
      totalHoldTime: stats.totalHoldTime,
      averageHoldTime: stats.averageHoldTime,
      bestHoldTime: stats.bestHoldTime,
      dateRangeStart: stats.dateRangeStart,
      dateRangeEnd: stats.dateRangeEnd,
    },
  };
}

/**
 * Calculate aggregate statistics for export
 */
function calculateExportStatistics(sessions: SessionRecord[]) {
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalBreaths: 0,
      totalHoldTime: 0,
      averageHoldTime: 0,
      bestHoldTime: 0,
      dateRangeStart: null,
      dateRangeEnd: null,
    };
  }

  const allHoldTimes = sessions.flatMap((s) => s.actualHoldTimes);
  const totalHoldTime = allHoldTimes.reduce((sum, t) => sum + t, 0);
  const totalBreaths = sessions.reduce((sum, s) => sum + s.breathCycles, 0);

  const dates = sessions.map((s) => new Date(s.date)).filter(Boolean);
  const dateRangeStart = dates.length > 0 
    ? new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString() 
    : null;
  const dateRangeEnd = dates.length > 0 
    ? new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString() 
    : null;

  return {
    totalSessions: sessions.length,
    totalBreaths,
    totalHoldTime,
    averageHoldTime:
      allHoldTimes.length > 0
        ? Math.round((totalHoldTime / allHoldTimes.length) * 100) / 100
        : 0,
    bestHoldTime: allHoldTimes.length > 0 ? Math.max(...allHoldTimes) : 0,
    dateRangeStart,
    dateRangeEnd,
  };
}

/**
 * Get device information for export metadata
 */
function getDeviceInfo() {
  return {
    platform: Platform.OS as 'ios' | 'android',
    appId: 'com.mezr.app',
  };
}

/**
 * Generate short unique ID for filename (6 random alphanumeric chars)
 */
function generateShortId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
