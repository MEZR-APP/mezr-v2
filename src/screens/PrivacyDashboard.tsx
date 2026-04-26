/**
 * Mezr App - Privacy Dashboard (PR-012)
 * Settings > Privacy Dashboard
 * What we store, your controls, privacy info
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useActivityStore, useActivityStats } from '../stores/activityStore';
import { useBreathStore } from '../stores/breathStore';
import { getDeviceStorageKB } from '../services/storageService';

export default function PrivacyDashboard() {
  const setShowPrivacyDashboard = useAppStore((state) => state.setShowPrivacyDashboard);
  const setShowPrivacyPolicy = useAppStore((state) => state.setShowPrivacyPolicy);
  const showToast = useAppStore((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const isSigningOut = useAuthStore((state) => state.isSigningOut);
  const history = useActivityStore((state) => state.history);
  const stats = useActivityStats();
  const patterns = useBreathStore((state) => state.patterns);

  const [deviceKB, setDeviceKB] = useState<number | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const email = user?.email ?? 'Not signed in';
  const breathingSessions = stats.breath;
  const cloudBackupEnabled = useAppStore((state) => state.cloudBackupEnabled);
  const cloudKB = cloudBackupEnabled ? 0 : 0; // No size API; show 0 or —

  useEffect(() => {
    getDeviceStorageKB().then(setDeviceKB);
  }, []);

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      email: user?.email ?? null,
      stats: {
        breathingSessions: stats.breath,
        swimSessions: stats.swim,
        meditateSessions: stats.meditate,
      },
      activityHistory: history,
      breathPatterns: patterns,
    };
    return JSON.stringify(payload, null, 2);
  };

  const handleViewAllData = () => {
    setShowJsonPreview(true);
  };

  const handleExport = async () => {
    try {
      const json = exportData();
      await Share.share({
        message: json,
        title: 'Mezr data export',
      });
      showToast('Export shared');
    } catch (e) {
      showToast('Export failed');
    }
  };

  const handleDeleteAccountPress = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirmCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleDeleteConfirmConfirm = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      await deleteAccount();
      setShowPrivacyDashboard(false);
      showToast('Account deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Delete failed';
      showToast(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  const deviceKBLabel = deviceKB !== null ? `${deviceKB} KB` : '…';
  const cloudKBLabel = cloudBackupEnabled ? `${cloudKB} KB` : '—';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setShowPrivacyDashboard(false)}
            style={styles.backButton}
          >
            <Text style={styles.backLabel}>← BACK</Text>
          </TouchableOpacity>
          <Text style={styles.title}>PRIVACY DASHBOARD</Text>
        </View>

        {/* 1. What We Store */}
        <Text style={styles.sectionTitle}>WHAT WE STORE</Text>
        <View style={styles.card}>
          <Row label="Email" value={email} />
          <Row label="Sessions" value={`${breathingSessions} breathing sessions`} />
          <Row label="Storage" value={`${deviceKBLabel} on device, ${cloudKBLabel} in cloud`} />
        </View>

        {/* 2. Your Controls */}
        <Text style={styles.sectionTitle}>YOUR CONTROLS</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleViewAllData}>
            <Text style={styles.controlButtonText}>View all data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleExport}>
            <Text style={styles.controlButtonText}>Export data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.deleteButton]}
            onPress={handleDeleteAccountPress}
            disabled={isDeleting || isSigningOut}
          >
            {(isDeleting || isSigningOut) ? (
              <ActivityIndicator size="small" color={colors.dangerText} />
            ) : (
              <Text style={styles.deleteButtonText}>Delete account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 3. Privacy Info */}
        <Text style={styles.sectionTitle}>PRIVACY INFO</Text>
        <View style={styles.card}>
          <Text style={styles.bullet}>• We never track your behavior</Text>
          <Text style={styles.bullet}>• No ads, no selling data</Text>
          <Text style={styles.bullet}>• You own your data</Text>
          <TouchableOpacity onPress={handlePrivacyPolicy} style={styles.linkWrap}>
            <Text style={styles.link}>Privacy policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Account Confirmation Modal (PR-011) */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleDeleteConfirmCancel}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleDeleteConfirmCancel}
        >
          <TouchableOpacity
            style={styles.deleteConfirmContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.deleteConfirmTitle}>
              Delete your account and all data?
            </Text>
            <Text style={styles.deleteConfirmWarning}>
              This cannot be undone.
            </Text>
            <Text style={styles.deleteConfirmListTitle}>Will delete:</Text>
            <Text style={styles.deleteConfirmBullet}>• Your account</Text>
            <Text style={styles.deleteConfirmBullet}>
              • All sessions (local and cloud)
            </Text>
            <Text style={styles.deleteConfirmBullet}>• All settings</Text>
            <View style={styles.deleteConfirmButtons}>
              <TouchableOpacity
                style={styles.deleteConfirmCancelBtn}
                onPress={handleDeleteConfirmCancel}
              >
                <Text style={styles.deleteConfirmCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmConfirmBtn}
                onPress={handleDeleteConfirmConfirm}
              >
                <Text style={styles.deleteConfirmConfirmBtnText}>
                  Delete Everything
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* JSON Preview Modal */}
      <Modal
        visible={showJsonPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJsonPreview(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowJsonPreview(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your data (preview)</Text>
            <ScrollView style={styles.jsonScroll}>
              <Text style={styles.jsonText} selectable>
                {exportData()}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowJsonPreview(false)}
            >
              <Text style={styles.modalCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { marginBottom: 12 },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backLabel: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.textDark,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
  },
  controls: {
    marginBottom: 28,
  },
  controlButton: {
    backgroundColor: colors.inputBackground,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: 12,
  },
  controlButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.dangerBackground,
    borderColor: colors.dangerText,
  },
  deleteButtonText: {
    color: colors.dangerText,
    fontSize: 13,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  bullet: {
    color: colors.textPrimary,
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  linkWrap: {
    marginTop: 8,
  },
  link: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    padding: 24,
  },
  deleteConfirmContent: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  deleteConfirmTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteConfirmWarning: {
    color: colors.dangerText,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteConfirmListTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  deleteConfirmBullet: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'center',
  },
  deleteConfirmCancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginRight: 12,
  },
  deleteConfirmCancelBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteConfirmConfirmBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.dangerBackground,
    borderWidth: 1,
    borderColor: colors.dangerText,
  },
  deleteConfirmConfirmBtnText: {
    color: colors.dangerText,
    fontSize: 13,
    fontWeight: '600',
  },
  modalContent: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 12,
    fontWeight: '700',
  },
  jsonScroll: {
    maxHeight: 320,
  },
  jsonText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  modalClose: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
