// src/components/ImportModal.tsx

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Switch,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { colors } from '../theme/colors';
import { useAppStore } from '../stores/appStore';
import {
  getAvailableBackups,
  formatFileSize,
  formatBackupDate,
  invalidateCache,
  type BackupInfo,
} from '../services/fileRecoveryService';
import {
  importFromFile,
  parseBackupForPreview,
  type ExportData,
} from '../services/importService';

// ============================================================================
// TYPES
// ============================================================================

type ModalState = 'idle' | 'preview' | 'importing' | 'success' | 'error';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ImportModal({ visible, onClose }: Props) {
  const showToast = useAppStore((state) => state.showToast);

  const [state, setState] = useState<ModalState>('idle');
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null);
  const [previewData, setPreviewData] = useState<ExportData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [mergeMode, setMergeMode] = useState(true); // true = merge, false = overwrite
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Load backup list when modal opens
  useEffect(() => {
    if (visible) {
      setState('idle');
      setSelectedBackup(null);
      setPreviewData(null);
      setMergeMode(true);
      setErrorMessage('');
      loadBackupList();
    }
  }, [visible]);

  const loadBackupList = useCallback(async () => {
    console.log('[ImportModal] loadBackupList called');
    setIsLoadingList(true);
    try {
      console.log('[ImportModal] Calling getAvailableBackups...');
      const available = await getAvailableBackups();
      console.log('[ImportModal] Backups found:', available.length, JSON.stringify(available));
      setBackups(available);
    } catch (err) {
      console.error('[ImportModal] loadBackupList ERROR:', err);
      setBackups([]);
    } finally {
      setIsLoadingList(false);
      console.log('[ImportModal] loadBackupList finished');
    }
  }, []);

  const handleSelectBackup = useCallback(async (backup: BackupInfo) => {
    setSelectedBackup(backup);
    setIsLoadingPreview(true);
    setState('preview');

    try {
      const dir = FileSystem.documentDirectory ?? '';
      const fileUri = `${dir}${backup.filename}`;
      const data = await parseBackupForPreview(fileUri);
      setPreviewData(data);
    } catch (err) {
      console.error('[ImportModal] Preview failed:', err);
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (!selectedBackup) return;

    setState('importing');
    setErrorMessage('');

    try {
      const dir = FileSystem.documentDirectory ?? '';
      const fileUri = `${dir}${selectedBackup.filename}`;
      const strategy = mergeMode ? 'merge' : 'overwrite';

      const result = await importFromFile(fileUri, strategy);

      if (result.success) {
        setState('success');
        setImportedCount(result.sessionsImported);
        invalidateCache();
        showToast(result.message);
      } else {
        setState('error');
        setErrorMessage(result.message);
      }
    } catch (err) {
      setState('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
      console.error('[ImportModal] Import error:', err);
    }
  }, [selectedBackup, mergeMode, showToast]);

  const handleBack = useCallback(() => {
    setState('idle');
    setSelectedBackup(null);
    setPreviewData(null);
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
            <View style={styles.headerLeft}>
              {(state === 'preview' || state === 'error') && (
                <Pressable onPress={handleBack} style={styles.backButton}>
                  <Text style={styles.backText}>←</Text>
                </Pressable>
              )}
              <Text style={styles.title}>
                {state === 'idle' && 'IMPORT BACKUP'}
                {state === 'preview' && 'BACKUP PREVIEW'}
                {state === 'importing' && 'IMPORTING'}
                {state === 'success' && 'IMPORT COMPLETE'}
                {state === 'error' && 'IMPORT FAILED'}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={12}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.bodyContent}>
            {/* ── IDLE: backup list ── */}
            {state === 'idle' && (
              <>
                <Text style={styles.sectionLabel}>AVAILABLE BACKUPS</Text>

                {isLoadingList ? (
                  <View style={styles.centeredContent}>
                    <ActivityIndicator size="small" color={colors.textMuted} />
                    <Text style={styles.statusSubtext}>Scanning device...</Text>
                  </View>
                ) : backups.length === 0 ? (
                  <View style={styles.centeredContent}>
                    <Text style={styles.emptyText}>
                      No backup files found on this device.
                    </Text>
                    <Text style={styles.emptyHint}>
                      Export your data first to create a backup.
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    style={{ maxHeight: 320 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    {backups.map((backup) => (
                      <Pressable
                        key={backup.filename}
                        style={styles.backupRow}
                        onPress={() => handleSelectBackup(backup)}
                      >
                        <View style={styles.backupInfo}>
                          <Text style={styles.backupFilename} numberOfLines={1}>
                            {backup.filename}
                          </Text>
                          <View style={styles.backupMeta}>
                            <Text style={styles.backupMetaText}>
                              {formatBackupDate(backup.exportDate)}
                            </Text>
                            <Text style={styles.backupMetaDot}>·</Text>
                            <Text style={styles.backupMetaText}>
                              {backup.sessionCount} sessions
                            </Text>
                            <Text style={styles.backupMetaDot}>·</Text>
                            <Text style={styles.backupMetaText}>
                              {formatFileSize(backup.backupSize)}
                            </Text>
                          </View>
                        </View>
                        {backup.isRecent && (
                          <View style={styles.recentBadge}>
                            <Text style={styles.recentBadgeText}>RECENT</Text>
                          </View>
                        )}
                        <Text style={styles.chevron}>→</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </>
            )}

            {/* ── PREVIEW: backup details + merge toggle ── */}
            {state === 'preview' && selectedBackup && (
              <>
                {isLoadingPreview ? (
                  <View style={styles.centeredContent}>
                    <ActivityIndicator size="small" color={colors.textMuted} />
                    <Text style={styles.statusSubtext}>Reading backup...</Text>
                  </View>
                ) : (
                  <>
                    <ScrollView
                      style={{ maxHeight: 240 }}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                    >
                      <Text style={styles.sectionLabel}>BACKUP DETAILS</Text>
                      <View style={styles.detailCard}>
                        <DetailRow
                          label="File"
                          value={selectedBackup.filename}
                          mono
                        />
                        <DetailRow
                          label="Created"
                          value={formatBackupDate(selectedBackup.exportDate)}
                        />
                        <DetailRow
                          label="Sessions"
                          value={String(selectedBackup.sessionCount)}
                        />
                        <DetailRow
                          label="Size"
                          value={formatFileSize(selectedBackup.backupSize)}
                        />
                        {previewData?.metadata?.appVersion && (
                          <DetailRow
                            label="App version"
                            value={previewData.metadata.appVersion}
                          />
                        )}
                        {previewData?.statistics?.dateRangeStart && (
                          <DetailRow
                            label="Date range"
                            value={`${formatShortDate(previewData.statistics.dateRangeStart)} – ${formatShortDate(previewData.statistics.dateRangeEnd ?? '')}`}
                          />
                        )}
                      </View>

                      {previewData?.settings && (
                        <>
                          <Text style={styles.sectionLabel}>SETTINGS IN BACKUP</Text>
                          <View style={styles.detailCard}>
                            <DetailRow
                              label="Sound"
                              value={previewData.settings.soundEnabled ? 'On' : 'Off'}
                            />
                            <DetailRow
                              label="Hold duration"
                              value={`${previewData.settings.breathHoldDuration}s`}
                            />
                            <DetailRow
                              label="Breaths/session"
                              value={String(previewData.settings.breathsPerSession)}
                            />
                            <DetailRow
                              label="Sessions"
                              value={String(previewData.settings.numberOfSessions)}
                            />
                          </View>
                        </>
                      )}
                    </ScrollView>

                    <Text style={styles.sectionLabel}>CONFLICT RESOLUTION</Text>
                    <View style={styles.toggleRow}>
                      <View style={styles.toggleInfo}>
                        <Text style={styles.toggleLabel}>
                          {mergeMode ? 'Merge with existing' : 'Replace all data'}
                        </Text>
                        <Text style={styles.toggleDescription}>
                          {mergeMode
                            ? 'Keeps your current sessions and adds new ones from the backup. Duplicates are skipped.'
                            : 'Removes all current data and replaces it with the backup. This cannot be undone.'}
                        </Text>
                      </View>
                      <Switch
                        value={mergeMode}
                        onValueChange={setMergeMode}
                        trackColor={{
                          false: colors.dangerBackground,
                          true: colors.backgroundElevated,
                        }}
                        thumbColor={mergeMode ? colors.textPrimary : colors.dangerText}
                      />
                    </View>

                    {!mergeMode && (
                      <View style={styles.warningBanner}>
                        <Text style={styles.warningText}>
                          Replace mode will delete ALL current sessions and settings.
                          Consider exporting your data first.
                        </Text>
                      </View>
                    )}

                    <Pressable
                      style={[
                        styles.primaryButton,
                        !mergeMode && styles.dangerButton,
                      ]}
                      onPress={handleImport}
                    >
                      <Text
                        style={[
                          styles.primaryButtonText,
                          !mergeMode && styles.dangerButtonText,
                        ]}
                      >
                        {mergeMode ? 'IMPORT & MERGE' : 'REPLACE ALL DATA'}
                      </Text>
                    </Pressable>
                  </>
                )}
              </>
            )}

            {/* ── IMPORTING: spinner ── */}
            {state === 'importing' && (
              <View style={styles.centeredContent}>
                <ActivityIndicator size="large" color={colors.textPrimary} />
                <Text style={styles.statusText}>Importing data...</Text>
                <Text style={styles.statusSubtext}>
                  {mergeMode
                    ? 'Merging sessions with your existing data'
                    : 'Replacing all data with backup'}
                </Text>
              </View>
            )}

            {/* ── SUCCESS ── */}
            {state === 'success' && (
              <>
                <View style={styles.centeredContent}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.statusText}>Import Successful</Text>
                  <Text style={styles.statusSubtext}>
                    {importedCount === 0
                      ? 'No new sessions to import (all duplicates).'
                      : `${importedCount} session${importedCount !== 1 ? 's' : ''} imported.`}
                  </Text>
                </View>

                <Pressable style={styles.primaryButton} onPress={handleDone}>
                  <Text style={styles.primaryButtonText}>DONE</Text>
                </Pressable>
              </>
            )}

            {/* ── ERROR ── */}
            {state === 'error' && (
              <>
                <View style={styles.centeredContent}>
                  <Text style={styles.errorIcon}>!</Text>
                  <Text style={styles.statusText}>Import Failed</Text>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>

                <Pressable style={styles.primaryButton} onPress={handleBack}>
                  <Text style={styles.primaryButtonText}>TRY ANOTHER BACKUP</Text>
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={handleDone}>
                  <Text style={styles.secondaryButtonText}>CLOSE</Text>
                </Pressable>
              </>
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

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[styles.detailValue, mono && styles.monoText]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
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
    maxHeight: '85%',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backText: {
    color: colors.textMuted,
    fontSize: 16,
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
    marginTop: 8,
  },
  centeredContent: {
    alignItems: 'center',
    paddingVertical: 32,
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
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyText: {
    color: colors.textDark,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyHint: {
    color: colors.textDark,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
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

  // Backup list items
  backupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  backupInfo: {
    flex: 1,
    marginRight: 8,
  },
  backupFilename: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  backupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  backupMetaText: {
    color: colors.textDark,
    fontSize: 10,
  },
  backupMetaDot: {
    color: colors.textDark,
    fontSize: 10,
    marginHorizontal: 6,
  },
  recentBadge: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 8,
  },
  recentBadgeText: {
    color: colors.textPrimary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  chevron: {
    color: colors.textDark,
    fontSize: 14,
  },

  // Detail card
  detailCard: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  monoText: {
    fontFamily: 'monospace',
    fontSize: 10,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },

  // Warning
  warningBanner: {
    backgroundColor: colors.dangerBackground,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dangerText,
  },
  warningText: {
    color: colors.dangerText,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },

  // Buttons
  primaryButton: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.buttonPrimaryText,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  dangerButton: {
    backgroundColor: colors.dangerBackground,
    borderWidth: 1,
    borderColor: colors.dangerText,
  },
  dangerButtonText: {
    color: colors.dangerText,
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
});
