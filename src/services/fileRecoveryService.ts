// src/services/fileRecoveryService.ts

import * as FileSystem from 'expo-file-system/legacy';

/**
 * MEZR File Recovery Service
 *
 * Scans the device for existing MEZR backup files and provides
 * metadata for recovery suggestions. Runs on app startup or
 * when the user opens the Import modal.
 *
 * Privacy: All operations are device-local. No network calls.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface BackupInfo {
  filename: string;
  exportDate: string;
  sessionCount: number;
  backupSize: number;
  isRecent: boolean;
}

export interface RecoveryResult {
  hasBackups: boolean;
  backups: BackupInfo[];
  suggestedBackup?: BackupInfo;
}

// ============================================================================
// IN-MEMORY CACHE
// ============================================================================

let cachedResult: RecoveryResult | null = null;
let cacheTimestamp = 0;

const CACHE_TTL_MS = 60_000; // 1 minute

function isCacheValid(): boolean {
  return cachedResult !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
}

/**
 * Clear the in-memory cache. Call after creating or deleting backups
 * so the next scan picks up changes.
 */
export function invalidateCache(): void {
  cachedResult = null;
  cacheTimestamp = 0;
}

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Extract metadata from a single backup file.
 * Reads the full file (backups are typically < 1 MB) and
 * pulls out metadata + session count.
 *
 * Returns null if the file can't be read or isn't a valid backup.
 */
export async function extractBackupMetadata(
  filename: string
): Promise<BackupInfo | null> {
  try {
    const dir = FileSystem.documentDirectory;
    if (!dir) return null;

    const fileUri = `${dir}${filename}`;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) return null;

    const backupSize = fileInfo.size ?? 0;

    const rawJson = await FileSystem.readAsStringAsync(fileUri);

    const data = JSON.parse(rawJson);

    if (!data || typeof data !== 'object' || !data.metadata) {
      return null;
    }

    const exportDate: string =
      data.metadata?.exportDate ?? extractDateFromFilename(filename);

    const sessionCount: number = Array.isArray(data.sessions)
      ? data.sessions.length
      : 0;

    const exportTime = new Date(exportDate).getTime();
    const isRecent = Date.now() - exportTime < SEVEN_DAYS_MS;

    return {
      filename,
      exportDate,
      sessionCount,
      backupSize,
      isRecent,
    };
  } catch (error) {
    console.error(
      `[FileRecoveryService] Failed to read metadata for ${filename}:`,
      error
    );
    return null;
  }
}

/**
 * Fallback: extract a date string from the MEZR-Backup-YYYY-MM-DD-XXXXXX.json
 * filename pattern.
 */
function extractDateFromFilename(filename: string): string {
  const match = filename.match(/MEZR-Backup-(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return new Date(match[1]).toISOString();
  }
  return new Date().toISOString();
}

// ============================================================================
// SCANNING
// ============================================================================

/**
 * Get all available backup files with metadata.
 * Results are sorted newest-first.
 */
export async function getAvailableBackups(): Promise<BackupInfo[]> {
  console.log('[FileRecovery] getAvailableBackups called');
  try {
    const dir = FileSystem.documentDirectory;
    console.log('[FileRecovery] documentDirectory:', dir);
    if (!dir) {
      console.log('[FileRecovery] documentDirectory is null/undefined');
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(dir);
    console.log('[FileRecovery] Total files in directory:', files.length);

    const backupFiles = files.filter(
      (f) => f.startsWith('MEZR-Backup-') && f.endsWith('.json')
    );
    console.log('[FileRecovery] MEZR backup files found:', backupFiles.length, backupFiles);

    if (backupFiles.length === 0) return [];

    // Extract metadata for each backup in parallel
    const metadataPromises = backupFiles.map((f) => extractBackupMetadata(f));
    const results = await Promise.all(metadataPromises);
    console.log('[FileRecovery] Metadata results:', results.length, 'valid:', results.filter(Boolean).length);

    const validBackups = results.filter(
      (b): b is BackupInfo => b !== null
    );

    // Sort newest first by exportDate
    validBackups.sort(
      (a, b) =>
        new Date(b.exportDate).getTime() - new Date(a.exportDate).getTime()
    );

    return validBackups;
  } catch (error) {
    console.error('[FileRecovery] getAvailableBackups ERROR:', error);
    return [];
  }
}

/**
 * Get the most recent backup if it was created within the last 7 days.
 * Returns null if no recent backup exists.
 */
export async function getSuggestedBackup(): Promise<BackupInfo | null> {
  const backups = await getAvailableBackups();
  if (backups.length === 0) return null;

  const newest = backups[0];
  return newest.isRecent ? newest : null;
}

/**
 * Full scan for backups with caching. Returns a RecoveryResult with
 * all available backups and a suggested backup (if any).
 *
 * Uses an in-memory cache (1 minute TTL) to avoid repeated
 * filesystem reads within the same session.
 */
export async function scanForBackups(): Promise<RecoveryResult> {
  if (isCacheValid() && cachedResult) {
    return cachedResult;
  }

  try {
    const backups = await getAvailableBackups();

    const suggestedBackup =
      backups.length > 0 && backups[0].isRecent ? backups[0] : undefined;

    const result: RecoveryResult = {
      hasBackups: backups.length > 0,
      backups,
      suggestedBackup,
    };

    cachedResult = result;
    cacheTimestamp = Date.now();

    return result;
  } catch (error) {
    console.error('[FileRecoveryService] Scan failed:', error);

    return {
      hasBackups: false,
      backups: [],
    };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format export date for display.
 */
export function formatBackupDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}
