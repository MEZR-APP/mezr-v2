/**
 * Mezr App - Profile Screen
 * Account, Privacy controls, Privacy & Terms, App Info, Sign Out
 * Multi-module ready: Profile is separate from Module Settings.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuthStore } from '../stores/authStore';
import { useActivityStore, useActivityStats } from '../stores/activityStore';
import { useAppStore } from '../stores/appStore';
import { getDeviceStorageKB } from '../services/storageService';
import { useBreathStore } from '../stores/breathStore';
import ExportModal from '../components/ExportModal';
import ImportModal from '../components/ImportModal';

const APP_VERSION = '1.0.0';

export default function ProfileScreen() {
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);
  const setShowPrivacyPolicy = useAppStore((state) => state.setShowPrivacyPolicy);
  const showToast = useAppStore((state) => state.showToast);

  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const isSigningOut = useAuthStore((state) => state.isSigningOut);

  const history = useActivityStore((state) => state.history);
  const stats = useActivityStats();
  const patterns = useBreathStore((state) => state.patterns);

  const [storageKB, setStorageKB] = useState<number | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const email = user?.email ?? 'Not signed in';
  const sessionCount = stats.breath + stats.swim + stats.meditate;

  useEffect(() => {
    getDeviceStorageKB().then(setStorageKB);
  }, []);

  const buildExportPayload = () => ({
    exportDate: new Date().toISOString(),
    email: user?.email ?? null,
    sessions: sessionCount,
    storageSize: storageKB !== null ? `${storageKB} KB` : '—',
    stats: { breath: stats.breath, swim: stats.swim, meditate: stats.meditate },
    activityHistory: history,
    breathPatterns: patterns,
  });

  const handleViewData = () => {
    const payload = buildExportPayload();
    setShowJsonPreview(true);
  };

  const handleExportData = () => {
    setShowExportModal(true);
  };

  const handleImportData = () => {
    setShowImportModal(true);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Delete your account and all data? This cannot be undone. Will delete: account, all sessions, all settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            setDeletePassword('');
            setDeleteError(null);
            setShowDeleteModal(true);
          },
        },
      ]
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      setDeleteError('Password is required');
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      showToast('Your account and all data have been permanently deleted');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Delete failed';
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'Sign out failed';
            showToast(msg);
          }
        },
      },
    ]);
  };

  const handlePrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms of Service',
      'Mezr Terms of Service. Use the app responsibly. We reserve the right to update these terms. Your use of the app constitutes acceptance.',
      [{ text: 'OK' }]
    );
  };

  const exportJsonString = () =>
    JSON.stringify(buildExportPayload(), null, 2);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentTab('main')} style={styles.backButton}>
          <Text style={styles.backLabel}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PROFILE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Account */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>
          <Text style={styles.label}>Display name</Text>
          <Text style={styles.value}>—</Text>
        </View>

        {/* Privacy Controls */}
        <Text style={styles.sectionTitle}>PRIVACY CONTROLS</Text>
        <TouchableOpacity style={styles.buttonSecondary} onPress={handleViewData}>
          <Text style={styles.buttonSecondaryText}>VIEW DATA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={handleExportData}>
          <Text style={styles.buttonSecondaryText}>EXPORT DATA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={handleImportData}>
          <Text style={styles.buttonSecondaryText}>IMPORT FROM BACKUP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonSecondary, styles.buttonDanger]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.dangerText} />
          ) : (
            <Text style={styles.buttonDangerText}>DELETE ACCOUNT</Text>
          )}
        </TouchableOpacity>

        {/* Privacy & Terms */}
        <Text style={styles.sectionTitle}>PRIVACY & TERMS</Text>
        <TouchableOpacity style={styles.linkButton} onPress={handlePrivacyPolicy}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={handleTerms}>
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>

        {/* App Info */}
        <Text style={styles.sectionTitle}>APP INFO</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>{APP_VERSION}</Text>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.buttonSecondary, styles.buttonSignOut, { marginTop: 32 }]}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color={colors.dangerText} />
          ) : (
            <Text style={styles.buttonSignOutText}>SIGN OUT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

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
            <Text style={styles.modalTitle}>Your data (JSON)</Text>
            <ScrollView style={styles.jsonScroll}>
              <Text style={styles.jsonText} selectable>
                {exportJsonString()}
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

      {/* Export Modal */}
      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Import Modal */}
      <ImportModal
        visible={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* Delete Account Password Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>CONFIRM DELETION</Text>
            <Text style={styles.deleteModalSubtitle}>
              Enter your password to permanently delete your account.
            </Text>
            {deleteError && (
              <View style={styles.deleteErrorContainer}>
                <Text style={styles.deleteErrorText}>{deleteError}</Text>
              </View>
            )}
            <TextInput
              style={styles.deletePasswordInput}
              value={deletePassword}
              onChangeText={(text) => {
                setDeletePassword(text);
                if (deleteError) setDeleteError(null);
              }}
              placeholder="Enter your password"
              placeholderTextColor={colors.inputPlaceholder}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isDeleting}
            />
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancel}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.deleteModalCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalConfirm, isDeleting && { opacity: 0.5 }]}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.dangerText} />
                ) : (
                  <Text style={styles.deleteModalConfirmText}>DELETE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDarker,
  },
  backButton: {
    padding: 8,
  },
  backLabel: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: '700',
    marginLeft: 16,
  },
  scroll: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  sectionTitle: {
    color: colors.textDark,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 12,
    minWidth: 220,
    alignSelf: 'center',
  },
  buttonSecondaryText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  buttonDanger: {
    backgroundColor: colors.dangerBackground,
    borderWidth: 1,
    borderColor: colors.dangerText,
  },
  buttonDangerText: {
    color: colors.dangerText,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  buttonSignOut: {
    backgroundColor: colors.dangerBackground,
    borderWidth: 1,
    borderColor: colors.dangerText,
  },
  buttonSignOutText: {
    color: colors.dangerText,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  linkButton: {
    paddingVertical: 12,
    marginBottom: 4,
  },
  linkText: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.backgroundDark,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 12,
  },
  jsonScroll: {
    maxHeight: 300,
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
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  deleteModalSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  deleteErrorContainer: {
    backgroundColor: colors.dangerBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.dangerText,
  },
  deleteErrorText: {
    color: colors.dangerText,
    fontSize: 12,
    textAlign: 'center',
  },
  deletePasswordInput: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteModalCancel: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
  },
  deleteModalCancelText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  deleteModalConfirm: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.dangerBackground,
    borderWidth: 1,
    borderColor: colors.dangerText,
  },
  deleteModalConfirmText: {
    color: colors.dangerText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
