/**
 * Mezr App - Settings Screen Component
 * Module-specific settings and stats display
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../stores/appStore';
import { useBreathStore } from '../stores/breathStore';
import { useActivityStore, useActivityStats } from '../stores/activityStore';
import { useAuthStore } from '../stores/authStore';
import { PatternBuilder } from './PatternBuilder';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { DEFAULT_MED_TIME } from '../constants/modules';
import { loadCloudBackupEnabled, saveCloudBackupEnabled } from '../services/storageService';

interface SettingsScreenProps {
  // Swim settings
  targetLaps: string;
  setTargetLaps: (value: string) => void;
  manualDistance: string;
  setManualDistance: (value: string) => void;
  manualTime: string;
  setManualTime: (value: string) => void;
  manualLaps: string;
  setManualLaps: (value: string) => void;
  // Meditate settings
  medInput: string;
  setMedInput: (value: string) => void;
  setMedTime: (value: number) => void;
  // Run settings
  targetDistance: string;
  setTargetDistance: (value: string) => void;
  targetDuration: string;
  setTargetDuration: (value: string) => void;
  // Cycle settings
  cycleDistance: string;
  setCycleDistance: (value: string) => void;
  cycleDuration: string;
  setCycleDuration: (value: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  targetLaps,
  setTargetLaps,
  manualDistance,
  setManualDistance,
  manualTime,
  setManualTime,
  manualLaps,
  setManualLaps,
  medInput,
  setMedInput,
  setMedTime,
  targetDistance,
  setTargetDistance,
  targetDuration,
  setTargetDuration,
  cycleDistance,
  setCycleDistance,
  cycleDuration,
  setCycleDuration,
}) => {
  const currentModule = useAppStore((state) => state.currentModule);
  const setShowSettings = useAppStore((state) => state.setShowSettings);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);
  const showToast = useAppStore((state) => state.showToast);
  const cloudBackupEnabled = useAppStore((state) => state.cloudBackupEnabled);
  const setCloudBackupEnabled = useAppStore((state) => state.setCloudBackupEnabled);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!user;

  const handleCloudBackupToggle = async (value: boolean) => {
    if (value && !isAuthenticated) {
      showToast('Sign in to enable cloud backup');
      return;
    }
    await saveCloudBackupEnabled(value);
    setCloudBackupEnabled(value);
    if (value) {
      try {
        await syncExistingHistoryToCloud();
        showToast('Cloud backup enabled. Sessions will sync.');
      } catch {
        showToast('Cloud backup enabled. Sync may complete in background.');
      }
    } else {
      showToast('Sessions saved on device only');
    }
  };
  
  const patterns = useBreathStore((state) => state.patterns);
  const selectedPatternId = useBreathStore((state) => state.selectedPatternId);
  const setSelectedPattern = useBreathStore((state) => state.setSelectedPattern);
  const openNewPatternBuilder = useBreathStore((state) => state.openNewPatternBuilder);
  const openEditPatternBuilder = useBreathStore((state) => state.openEditPatternBuilder);
  const openDeleteConfirm = useBreathStore((state) => state.openDeleteConfirm);
  
  const logActivity = useActivityStore((state) => state.logActivity);
  const syncExistingHistoryToCloud = useActivityStore((state) => state.syncExistingHistoryToCloud);
  const stats = useActivityStats();

  const handleEditPattern = (pattern: typeof patterns[0]) => {
    if (pattern.isDefault) {
      showToast('Cannot edit default patterns');
      return;
    }
    openEditPatternBuilder(pattern);
  };

  const handleDeletePattern = (pattern: typeof patterns[0]) => {
    if (pattern.isDefault) {
      showToast('Cannot delete default patterns');
      return;
    }
    openDeleteConfirm(pattern);
  };

  const saveManualSwimSession = () => {
    const distance = parseFloat(manualDistance) || 0;
    const time = parseFloat(manualTime) || 0;
    const lapCount = parseInt(manualLaps) || 0;

    if (distance > 0 || time > 0 || lapCount > 0) {
      logActivity('swim', { distance, time, laps: lapCount, manual: true });
      setManualDistance('');
      setManualTime('');
      setManualLaps('');
      showToast('Swim session saved! 🏊');
    } else {
      showToast('Please enter at least one value');
    }
  };

  const handleDone = () => {
    setShowSettings(false);
    setCurrentTab('main');
  };

  return (
    <View style={styles.container}>
      {/* Modals rendered inside settings */}
      <PatternBuilder />
      <DeleteConfirmModal />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
      <ScrollView
        contentContainerStyle={styles.settingsScroll}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.settingsTitle}>
          MODULE: {currentModule === 'breath' ? 'BREATHING 🫁' : currentModule.toUpperCase()}
        </Text>
        <Text style={styles.settingsSubtitle}>
          {currentModule === 'breath'
            ? 'Configure breathing session settings'
            : `Configure ${currentModule} settings`}
        </Text>

        {/* BREATH MODULE SETTINGS */}
        {currentModule === 'breath' && (
          <View style={styles.fullWidth}>
            <Text style={[styles.settingsTitle, { marginBottom: 15 }]}>
              BREATHING PATTERNS
            </Text>

            {patterns.map((pattern) => (
              <View key={pattern.id} style={styles.patternCard}>
                <TouchableOpacity
                  style={styles.patternCardContent}
                  onPress={() => setSelectedPattern(pattern.id)}
                >
                  <View style={styles.patternInfo}>
                    <View style={styles.patternNameRow}>
                      <Text
                        style={[
                          styles.patternName,
                          selectedPatternId === pattern.id && styles.patternNameActive,
                        ]}
                      >
                        {pattern.name}
                      </Text>
                      {selectedPatternId === pattern.id && (
                        <Text style={styles.activeIndicator}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.patternDetails}>
                      {pattern.breathCycles} cycles • {pattern.sessions} sessions
                    </Text>
                  </View>
                </TouchableOpacity>

                {!pattern.isDefault && (
                  <View style={styles.patternActions}>
                    <TouchableOpacity
                      onPress={() => handleEditPattern(pattern)}
                      style={styles.miniButton}
                    >
                      <Text style={styles.miniButtonText}>EDIT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletePattern(pattern)}
                      style={[styles.miniButton, styles.miniButtonDanger]}
                    >
                      <Text style={[styles.miniButtonText, styles.miniButtonDangerText]}>
                        DELETE
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={openNewPatternBuilder}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                + NEW PATTERN
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SWIM MODULE SETTINGS */}
        {currentModule === 'swim' && (
          <View style={styles.fullWidth}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Target Laps</Text>
              <TextInput
                style={styles.input}
                value={targetLaps}
                onChangeText={setTargetLaps}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor={colors.textDarker}
              />
            </View>

            <Text style={[styles.settingsTitle, { marginTop: 30, marginBottom: 15 }]}>
              LOG MANUAL SESSION
            </Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Distance (meters)</Text>
              <TextInput
                style={styles.input}
                value={manualDistance}
                onChangeText={setManualDistance}
                keyboardType="numeric"
                placeholder="500"
                placeholderTextColor={colors.textDarker}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Time (minutes)</Text>
              <TextInput
                style={styles.input}
                value={manualTime}
                onChangeText={setManualTime}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor={colors.textDarker}
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Laps Completed</Text>
              <TextInput
                style={styles.input}
                value={manualLaps}
                onChangeText={setManualLaps}
                keyboardType="numeric"
                placeholder="20"
                placeholderTextColor={colors.textDarker}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={saveManualSwimSession}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                SAVE SESSION
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MEDITATE MODULE SETTINGS */}
        {currentModule === 'meditate' && (
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={medInput}
              onChangeText={(t) => {
                setMedInput(t);
                setMedTime((parseInt(t) || 0) * 60);
              }}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor={colors.textDarker}
            />
          </View>
        )}

        {/* RUN / CYCLE MODULE SETTINGS */}
        {(currentModule === 'run' || currentModule === 'cycle') && (
          <View style={styles.fullWidth}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Target Distance (km)</Text>
              <TextInput
                style={styles.input}
                value={currentModule === 'run' ? targetDistance : cycleDistance}
                onChangeText={currentModule === 'run' ? setTargetDistance : setCycleDistance}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor={colors.textDarker}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Target Duration (min)</Text>
              <TextInput
                style={styles.input}
                value={currentModule === 'run' ? targetDuration : cycleDuration}
                onChangeText={currentModule === 'run' ? setTargetDuration : setCycleDuration}
                keyboardType="numeric"
                placeholder="30"
                placeholderTextColor={colors.textDarker}
              />
            </View>
            <Text style={styles.comingSoonText}>Full tracking coming soon</Text>
          </View>
        )}

        {/* CLOUD BACKUP (Global - All Modules) */}
        <Text style={[styles.settingsTitle, { marginTop: 30 }]}>
          CLOUD BACKUP (ALL MODULES)
        </Text>
        <Text style={styles.settingsSubtitle}>Save all your data to cloud</Text>
        <View style={styles.cloudBackupCard}>
          <View style={styles.cloudBackupRow}>
            <Text style={styles.cloudBackupLabel}>Backup Sessions to Cloud</Text>
            <Switch
              value={cloudBackupEnabled}
              onValueChange={handleCloudBackupToggle}
              trackColor={{ false: colors.inputBorder, true: colors.buttonPrimary }}
              thumbColor={colors.textPrimary}
              disabled={!isAuthenticated}
            />
          </View>
          <Text style={styles.cloudBackupDescription}>
            Save breathing sessions to your account. Allows access from multiple
            devices. Optional.
          </Text>
          {!isAuthenticated ? (
            <Text style={styles.cloudBackupStatus}>Sign in to enable</Text>
          ) :           cloudBackupEnabled ? (
            <Text style={styles.cloudBackupStatus}>
              Cloud backup enabled. Sessions will sync.
            </Text>
          ) : (
            <Text style={styles.cloudBackupStatus}>
              When OFF: Data saved on device only. When ON: Sessions synced to cloud.
            </Text>
          )}
        </View>

        {/* LIFETIME STATS */}
        <Text style={[styles.settingsTitle, { marginTop: 40 }]}>LIFETIME TOTALS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.breath}</Text>
            <Text style={styles.statLabel}>BREATH</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.swim}</Text>
            <Text style={styles.statLabel}>SWIM</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{stats.meditate}</Text>
            <Text style={styles.statLabel}>ZEN</Text>
          </View>
        </View>

        {/* DONE BUTTON */}
        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={handleDone}
        >
          <Text style={styles.buttonText}>DONE</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  settingsScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 80,
    paddingBottom: 120,
  },
  settingsTitle: {
    color: colors.textDark,
    fontSize: 10,
    letterSpacing: 3,
    marginBottom: 25,
    fontWeight: '700',
  },
  settingsSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  fullWidth: {
    width: '100%',
    alignItems: 'center',
  },
  settingItem: {
    width: '85%',
    marginBottom: 20,
  },
  settingLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    fontSize: 22,
    textAlign: 'center',
    padding: 15,
    borderRadius: 15,
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 40,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.buttonPrimaryText,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  buttonSecondary: {
    backgroundColor: colors.backgroundElevated,
    marginTop: 20,
  },
  buttonTextSecondary: {
    color: colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statBox: {
    width: '30%',
    backgroundColor: colors.inputBackground,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNum: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '300',
  },
  statLabel: {
    color: colors.textDarker,
    fontSize: 8,
    marginTop: 4,
  },
  patternCard: {
    width: '90%',
    backgroundColor: colors.inputBackground,
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  patternCardContent: {
    flex: 1,
  },
  patternInfo: {
    flex: 1,
  },
  patternNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patternName: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 2,
  },
  patternNameActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  patternDetails: {
    color: colors.textDark,
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 1,
  },
  activeIndicator: {
    color: colors.textPrimary,
    fontSize: 20,
    marginLeft: 10,
  },
  patternActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  miniButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  miniButtonText: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  miniButtonDanger: {
    marginLeft: 10,
    backgroundColor: colors.dangerBackground,
  },
  miniButtonDangerText: {
    color: colors.dangerText,
  },
  comingSoonText: {
    color: colors.textDark,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  cloudBackupCard: {
    width: '90%',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cloudBackupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cloudBackupLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    letterSpacing: 1,
    flex: 1,
    fontWeight: '600',
  },
  cloudBackupDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  cloudBackupStatus: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 10,
    letterSpacing: 0.5,
  },
});

export default SettingsScreen;
