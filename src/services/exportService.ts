// src/services/exportService.ts

import { useStatsStore } from '../stores/statsStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * MEZR Export Service
 * 
 * Handles complete export of user data including:
 * - All breathing sessions with metadata
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
  // Metadata
  metadata: {
    exportDate: string; // ISO timestamp
    appVersion: string;
    exportFormat: '1.0';
    deviceInfo: {
      platform: 'ios' | 'android';
      osVersion: string;
      appId: string;
    };
  };

  // User info (anonymized if needed)
  user: {
    uid: string;
    email: string;
    accountCreatedAt: string;
  };

  // Settings preserved
  settings: {
    soundEnabled: boolean;
    breathHoldDuration: number;
    breathsPerSession: number;
    numberOfSessions: number;
    drivingMode: boolean;
  };

  // All sessions
  sessions: SessionRecord[];

  // Computed statistics
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
 * 
 * @returns Promise<ExportResult> with success status and filename
 */
export async function exportUserData(): Promise<ExportResult> {
  try {
    // Validate user is authenticated
    const { user } = useAuthStore.getState();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated. Please sign in first.',
      };
    }

    // Fetch all data from stores
    const sessions = useStatsStore.getState().sessions;
    const settings = useSettingsStore.getState();
    const auth = useAuthStore.getState();

    // Build complete export package
    const exportData = buildExportPackage(
      user,
      sessions,
      settings,
      auth
    );

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `MEZR-Backup-${timestamp}-${generateShortId()}.json`;

    // Save to device filesystem
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Write JSON to file
    const jsonString = JSON.stringify(exportData, null, 2);
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Get file size for feedback
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    const fileSize = fileInfo.size || jsonString.length;

    return {
      success: true,
      message: `Backup created: ${filename}`,
      filename,
      fileSize,
      fileUri, // For debugging/testing
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error during export';

    console.error('[ExportService] Export failed:', errorMessage);

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
 * 
 * @param filename - Name of exported file
 * @returns Promise<boolean> true if shared successfully
 */
export async function shareExportedData(filename: string): Promise<boolean> {
  try {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Check file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.error('[ExportService] File not found:', fileUri);
      return false;
    }

    // Open system share sheet
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

    console.log('[ExportService] Data shared successfully');
    return true;
  } catch (error) {
    console.error('[ExportService] Share failed:', error);
    return false;
  }
}

/**
 * List all existing backups on device
 * 
 * @returns Promise<string[]> array of backup filenames
 */
export async function listBackups(): Promise<string[]> {
  try {
    const files = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory || ''
    );

    const backups = files.filter((file) =>
      file.startsWith('MEZR-Backup-') && file.endsWith('.json')
    );

    return backups.sort().reverse(); // Newest first
  } catch (error) {
    console.error('[ExportService] Failed to list backups:', error);
    return [];
  }
}

/**
 * Delete a backup file
 * 
 * @param filename - Name of backup to delete
 * @returns Promise<boolean> true if deleted successfully
 */
export async function deleteBackup(filename: string): Promise<boolean> {
  try {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Safety check: only delete MEZR backups
    if (!filename.startsWith('MEZR-Backup-')) {
      console.warn('[ExportService] Not a MEZR backup file');
      return false;
    }

    await FileSystem.deleteAsync(fileUri);
    console.log('[ExportService] Backup deleted:', filename);
    return true;
  } catch (error) {
    console.error('[ExportService] Failed to delete backup:', error);
    return false;
  }
}

/**
 * Get metadata from a backup file without importing
 * Useful for showing backup info before import
 * 
 * @param filename - Name of backup file
 * @returns Promise<ExportData['metadata'] | null>
 */
export async function getBackupMetadata(
  filename: string
): Promise<ExportData['metadata'] | null> {
  try {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    const jsonString = await FileSystem.readAsStringAsync(fileUri);
    const data: ExportData = JSON.parse(jsonString);

    return data.metadata;
  } catch (error) {
    console.error('[ExportService] Failed to read backup metadata:', error);
    return null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build complete export package with all user data
 * 
 * Privacy note: This is all local data, user can inspect JSON before sharing
 */
function buildExportPackage(
  user: any,
  sessions: SessionRecord[],
  settings: any,
  auth: any
): ExportData {
  // Calculate statistics
  const stats = calculateExportStatistics(sessions);

  // Get device info
  const deviceInfo = getDeviceInfo();

  // Build package
  const exportData: ExportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0', // Should match app.json version
      exportFormat: '1.0',
      deviceInfo,
    },

    user: {
      uid: user.uid,
      email: user.email,
      accountCreatedAt: user.createdAt,
    },

    settings: {
      soundEnabled: settings.soundEnabled ?? true,
      breathHoldDuration: settings.breathHoldDuration ?? 15,
      breathsPerSession: settings.breathsPerSession ?? 25,
      numberOfSessions: settings.numberOfSessions ?? 3,
      drivingMode: settings.drivingMode ?? false,
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

  return exportData;
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
  // In production, you could use react-native-device-info
  // For now, return basic info
  return {
    platform: ('ios' || 'android') as 'ios' | 'android',
    osVersion: 'unknown', // Would need device-info library
    appId: 'com.mezr.app',
  };
}

/**
 * Generate short unique ID for filename
 * Format: 6 random characters
 */
function generateShortId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}