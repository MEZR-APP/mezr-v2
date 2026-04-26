// src/components/ExportModal.tsx

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../stores/appStore';
import { useActivityStore } from '../stores/activityStore';
import {
  exportUserData,
  shareExportedData,
  listBackups,
  deleteBackup,
} from '../services/exportService';
import {
  formatFileSize,
  formatBackupDate,
  invalidateCache,
} from '../services/fileRecoveryService';

// ============================================================================
// TYPES
// ============================================================================

type ModalState = 'idle' | 'exporting' | 'success' | 'error' | 'listing';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ExportModal({ visible, onClose }: Props) {
  const showToast = useAppStore((state) => state.showToast);
  const history = useActivityStore((state) => state.history);

  const [state, setState] = useState<ModalState>('idle');
  const [exportedFilename, setExportedFilename] = useState('');
  const [exportedSize, setExportedSize] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingBackups, setExistingBackups] = useState<string[]>([]);
  const [showBackupList, setShowBackupList] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Summary data
  const totalSessions = history.length;
  const dateRange = getDateRange(history);
  const estimatedSize = estimateExportSize(totalSessions);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setState('idle');
      setExportedFilename('');
      setErrorMessage('');
      setShowBackupList(false);
    }
  }, [visible]);

  const handleExport = useCallback(async () => {
    console.log('[ExportModal] handleExport clicked');
    setState('exporting');
    setErrorMessage('');

    try {
      console.log('[ExportModal] Calling exportUserData...');
      const result = await exportUserData();
      console.log('[ExportModal] Export result:', JSON.stringify(result));

      if (result.success && result.filename) {
        setState('success');
        setExportedFilename(result.filename);
        setExportedSize(result.fileSize ?? 0);
        invalidateCache();
        showToast('Backup created successfully');
      } else {
        console.log('[ExportModal] Export not successful:', result.message);
        setState('error');
        setErrorMessage(result.message || 'Export failed unexpectedly.');
      }
    } catch (err) {
      console.error('[ExportModal] Export CATCH error:', err);
      setState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    }
  }, [showToast]);

  const handleShare = useCallback(async () => {
    if (!exportedFilename) return;
    setIsSharing(true);

    try {
      const shared = await shareExportedData(exportedFilename);
      if (!shared) {
        showToast('Sharing is not available on this device');
      }
    } catch (err) {
      console.error('[ExportModal] Share error:', err);
      showToast('Could not share the backup file');
    } finally {
      setIsSharing(false);
    }
  }, [exportedFilename, showToast]);

  const handleShowBackups = useCallback(async () => {
    const backups = await listBackups();
    setExistingBackups(backups);
    setShowBackupList(true);
  }, []);

  const handleDeleteBackup = useCallback(
    async (filename: string) => {
      const deleted = await deleteBackup(filename);
      if (deleted) {
        setExistingBackups((prev) => prev.filter((b) => b !== filename));
        invalidateCache();
        showToast('Backup deleted');
      } else {
        showToast('Could not delete backup');
      }
    },
    [showToast]
  );

  const handleRetry = useCallback(() => {
    setState('idle');
    setErrorMessage('');
  }, []);

  const handleDone = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>EXPORT DATA</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={12}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.bodyContent}>
            {/* ── IDLE STATE ── */}
            {state === 'idle' && (
              <>
                <Text style={styles.sectionLabel}>BACKUP SUMMARY</Text>
                <View style={styles.summaryCard}>
                  <SummaryRow label="Total sessions" value={String(totalSessions)} />
                  <SummaryRow label="Date range" value={dateRange} />
                  <SummaryRow label="Estimated size" value={estimatedSize} />
                </View>

                <Pressable style={styles.primaryButton} onPress={handleExport}>
                  <Text style={styles.primaryButtonText}>EXPORT NOW</Text>
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={handleShowBackups}>
                  <Text style={styles.secondaryButtonText}>
                    VIEW EXISTING BACKUPS
                  </Text>
                </Pressable>
              </>
            )}

            {/* ── EXPORTING STATE ── */}
            {state === 'exporting' && (
              <View style={styles.centeredContent}>
                <ActivityIndicator size="large" color={colors.textPrimary} />
                <Text style={styles.statusText}>Exporting your data...</Text>
                <Text style={styles.statusSubtext}>
                  Creating backup file on device
                </Text>
              </View>
            )}

            {/* ── SUCCESS STATE ── */}
            {state === 'success' && (
              <>
                <View style={styles.centeredContent}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.statusText}>Backup Created</Text>
                  <Text style={styles.filenameText}>{exportedFilename}</Text>
                  {exportedSize > 0 && (
                    <Text style={styles.statusSubtext}>
                      {formatFileSize(exportedSize)}
                    </Text>
                  )}
                </View>

                <Pressable
                  style={styles.primaryButton}
                  onPress={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <ActivityIndicator size="small" color={colors.buttonPrimaryText} />
                  ) : (
                    <Text style={styles.primaryButtonText}>SHARE</Text>
                  )}
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={handleDone}>
                  <Text style={styles.secondaryButtonText}>DONE</Text>
                </Pressable>
              </>
            )}

            {/* ── ERROR STATE ── */}
            {state === 'error' && (
              <>
                <View style={styles.centeredContent}>
                  <Text style={styles.errorIcon}>!</Text>
                  <Text style={styles.statusText}>Export Failed</Text>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>

                <Pressable style={styles.primaryButton} onPress={handleRetry}>
                  <Text style={styles.primaryButtonText}>TRY AGAIN</Text>
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={handleDone}>
                  <Text style={styles.secondaryButtonText}>CLOSE</Text>
                </Pressable>
              </>
            )}

            {/* ── BACKUP LIST (expandable in idle state) ── */}
            {showBackupList && (
              <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
                  EXISTING BACKUPS
                </Text>
                {existingBackups.length === 0 ? (
                  <Text style={styles.emptyText}>No backups found on device</Text>
                ) : (
                  existingBackups.map((filename) => (
                    <View key={filename} style={styles.backupRow}>
                      <View style={styles.backupInfo}>
                        <Text style={styles.backupFilename} numberOfLines={1}>
                          {filename}
                        </Text>
                        <Text style={styles.backupDate}>
                          {extractDisplayDate(filename)}
                        </Text>
                      </View>
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => handleDeleteBackup(filename)}
                      >
                        <Text style={styles.deleteButtonText}>DELETE</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getDateRange(
  history: { date: string }[]
): string {
  if (history.length === 0) return 'No sessions yet';

  const dates = history
    .map((h) => new Date(h.date).getTime())
    .filter((t) => !isNaN(t));

  if (dates.length === 0) return 'No sessions yet';

  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  if (earliest.toDateString() === latest.toDateString()) {
    return fmt(earliest);
  }

  return `${fmt(earliest)} – ${fmt(latest)}`;
}

function estimateExportSize(sessionCount: number): string {
  // ~200 bytes per session + ~500 bytes overhead
  const bytes = sessionCount * 200 + 500;
  if (bytes < 1024) return `${bytes} B`;
  return `~${(bytes / 1024).toFixed(1)} KB`;
}

function extractDisplayDate(filename: string): string {
  const match = filename.match(/MEZR-Backup-(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return new Date(match[1]).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return '';
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDarker,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
    paddingBottom: 32,
  },
  sectionLabel: {
    color: colors.textDark,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  centeredContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  statusText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 16,
  },
  statusSubtext: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  filenameText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 8,
    textAlign: 'center',
  },
  successIcon: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
  },
  errorIcon: {
    color: colors.dangerText,
    fontSize: 32,
    fontWeight: '700',
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: colors.buttonPrimaryText,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  emptyText: {
    color: colors.textDark,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 16,
  },
  backupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  backupInfo: {
    flex: 1,
    marginRight: 12,
  },
  backupFilename: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  backupDate: {
    color: colors.textDark,
    fontSize: 10,
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: colors.dangerBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.dangerText,
  },
  deleteButtonText: {
    color: colors.dangerText,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
