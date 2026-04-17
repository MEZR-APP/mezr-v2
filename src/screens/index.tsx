/**
 * Mezr App - Main Screen
 * Primary application screen with all modules
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, BarChart3, Settings, User, Activity } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAppStore } from '../stores/appStore';
import { useBreathStore } from '../stores/breathStore';
import { useActivityStore } from '../stores/activityStore';
import { loadCloudBackupEnabled } from '../services/storageService';
import { initializeAudio, preloadSounds } from '../services/audioService';
import { ALL_MODULES, DEFAULT_MED_TIME } from '../constants/modules';

// Components
import { Toast } from '../components/ui/Toast';
import { CategoryBar } from '../components/CategoryBar';
import { ModulePicker } from '../components/ModulePicker';
import { SettingsScreen } from '../components/SettingsScreen';
import { QuickEntryBar } from '../components/QuickEntryBar';
import PrivacyDashboard from './PrivacyDashboard';
import PrivacyPolicy from './PrivacyPolicy';
import StatsScreen from './StatsScreen';
import ProfileScreen from './ProfileScreen';
import TimelineScreen from './TimelineScreen';
import { useTaskStore, getElapsedMs } from '../stores/taskStore';
import {
  initializeNotifications,
  setupNotificationHandlers,
  updatePersistentNotification,
  dismissPersistentNotification,
  loadQuickPresets,
  setupBackgroundNotificationHandler,
} from '../services/notificationService';
import type { MainTabId } from '../stores/appStore';
import type { NotificationAction } from '../services/notificationService';

const TAB_ICON_SIZE = 24;
const TAB_ACTIVE_COLOR = '#FFFFFF';
const TAB_INACTIVE_COLOR = '#666666';
import { BreathModule } from '../components/modules/BreathModule';
import { SwimModule } from '../components/modules/SwimModule';
import { MeditateModule } from '../components/modules/MeditateModule';
export default function MainScreen() {
  // App Store
  const currentModule = useAppStore((state) => state.currentModule);
  const isActive = useAppStore((state) => state.isActive);
  const currentTab = useAppStore((state) => state.currentTab);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);
  const isMuted = useAppStore((state) => state.isMuted);
  const showSettings = useAppStore((state) => state.showSettings);
  const showPrivacyDashboard = useAppStore((state) => state.showPrivacyDashboard);
  const showPrivacyPolicy = useAppStore((state) => state.showPrivacyPolicy);
  const setShowSettings = useAppStore((state) => state.setShowSettings);
  const setShowPrivacyPolicy = useAppStore((state) => state.setShowPrivacyPolicy);
  const setShowModulePicker = useAppStore((state) => state.setShowModulePicker);
  const toggleMuted = useAppStore((state) => state.toggleMuted);
  const setIsActive = useAppStore((state) => state.setIsActive);
  const showToast = useAppStore((state) => state.showToast);

  // Breath Store
  const loadPatterns = useBreathStore((state) => state.loadPatterns);
  const resetBreathSession = useBreathStore((state) => state.resetSession);

  // Activity Store
  const loadHistory = useActivityStore((state) => state.loadHistory);

  // Local state for module-specific settings
  const [targetLaps, setTargetLaps] = useState('10');
  const [manualDistance, setManualDistance] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [manualLaps, setManualLaps] = useState('');
  const [medTime, setMedTime] = useState(DEFAULT_MED_TIME);
  const [medInput, setMedInput] = useState('10');
  const [targetDistance, setTargetDistance] = useState('5');
  const [targetDuration, setTargetDuration] = useState('30');
  const [cycleDistance, setCycleDistance] = useState('10');
  const [cycleDuration, setCycleDuration] = useState('45');

  const setCloudBackupEnabled = useAppStore((state) => state.setCloudBackupEnabled);

  // Task store
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const activeTask = useTaskStore((state) => state.activeTask);
  const pauseTask = useTaskStore((state) => state.pauseTask);
  const resumeTask = useTaskStore((state) => state.resumeTask);
  const stopTask = useTaskStore((state) => state.stopTask);
  const startTask = useTaskStore((state) => state.startTask);

  // Local state for notification sync
  const [notifTick, setNotifTick] = useState(0); // Ticker to update notification every second
  const [unsubscribeNotifications, setUnsubscribeNotifications] = useState<(() => void) | null>(null);

  // Handle notification actions (pause, stop, quick start)
  const handleNotificationAction = (action: NotificationAction) => {
    switch (action.type) {
      case 'pause_task':
        pauseTask();
        break;
      case 'resume_task':
        resumeTask();
        break;
      case 'stop_task':
        stopTask();
        break;
      case 'start_task':
        if (action.taskName) {
          startTask(action.taskName);
        }
        break;
      case 'open_app':
        // Just open the app — already open, so navigate to timeline tab
        setCurrentTab('timeline');
        break;
    }
  };

  // Initialize on mount (PR-007: Load cloud backup preference - default OFF)
  useEffect(() => {
    (async () => {
      initializeAudio().then(() => preloadSounds());
      loadPatterns();
      loadHistory();
      loadTasks();
      loadCloudBackupEnabled().then((enabled) => setCloudBackupEnabled(enabled));

      // Initialize notifications
      const notifGranted = await initializeNotifications();
      setupBackgroundNotificationHandler();

      if (notifGranted) {
        // Set up notification listeners
        const unsub = setupNotificationHandlers(handleNotificationAction);
        setUnsubscribeNotifications(() => unsub);

        // Load quick presets for notifications
        await loadQuickPresets();
      }
    })();
  }, [setCloudBackupEnabled, loadTasks]);

  // Update persistent notification every second when task is running
  useEffect(() => {
    if (!activeTask) return;

    const elapsed = getElapsedMs(activeTask);
    updatePersistentNotification(activeTask, elapsed);

    // Set up ticker to update every second
    const ticker = setInterval(() => {
      setNotifTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(ticker);
  }, [activeTask, notifTick]);

  // Update notification when tick changes
  useEffect(() => {
    if (!activeTask) {
      updatePersistentNotification(null, 0);
      return;
    }
    const elapsed = getElapsedMs(activeTask);
    updatePersistentNotification(activeTask, elapsed);
  }, [notifTick, activeTask]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }
    };
  }, [unsubscribeNotifications]);

  // Reset all state
  const resetAll = () => {
    resetBreathSession();
    setIsActive(false);
  };

  // Handle start/stop
  const handleStartStop = () => {
    if (isActive) {
      resetAll();
    } else {
      setIsActive(true);
    }
  };

  // If privacy policy is open (from Settings or elsewhere)
  if (showPrivacyPolicy) {
    return <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />;
  }

  // If privacy dashboard is open (legacy / from elsewhere)
  if (showPrivacyDashboard) {
    return <PrivacyDashboard />;
  }

  const settingsScreenProps = {
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
  };

  return (
    <View style={styles.container}>
      {/* QuickEntryBar — always visible at top, notification-bar style */}
      <QuickEntryBar />

      {/* Tab content section - currentTab state controls which screen displays */}
      {currentTab === 'main' && (
        <>
          <ModulePicker />
          <Toast />
          <CategoryBar />
          <View style={styles.topHeader}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => !isActive && setShowModulePicker(true)}
                style={styles.activeModuleButton}
              >
                <Text style={styles.activeModuleText}>
                  {ALL_MODULES.find((m) => m.id === currentModule)?.label}
                </Text>
                {!isActive && <View style={styles.dropdownArrow} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleMuted} style={styles.soundToggle}>
                <Text style={[styles.soundToggleText, isMuted && styles.soundToggleMuted]}>
                  {isMuted ? 'MUTED' : 'SOUND'}
                </Text>
              </TouchableOpacity>
            </View>
            {!isActive && (
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.settingsIcon}
                  onPress={() => {
                    setShowSettings(true);
                    setCurrentTab('settings');
                  }}
                >
                  <View style={styles.gearCircle}>
                    <View style={styles.gearInner} />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.mainDisplay}>
            {currentModule === 'breath' && <BreathModule />}
            {currentModule === 'swim' && <SwimModule />}
            {currentModule === 'meditate' && (
              <MeditateModule medTime={medTime} setMedTime={setMedTime} />
            )}
            {(currentModule === 'run' || currentModule === 'cycle') && (
              <View style={styles.comingSoonContainer}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isActive && styles.buttonActive]}
              onPress={handleStartStop}
            >
              <Text style={[styles.buttonText, isActive && styles.buttonTextActive]}>
                {isActive ? 'STOP' : 'START'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {currentTab === 'timeline' && <TimelineScreen />}
      {currentTab === 'stats' && <StatsScreen />}
      {currentTab === 'settings' && <SettingsScreen {...settingsScreenProps} />}
      {currentTab === 'profile' && <ProfileScreen />}

      {/* Bottom tab bar - 4 tabs: Main | Stats | Settings | Profile */}
      <TabBar currentTab={currentTab} setCurrentTab={setCurrentTab} />
    </View>
  );
}

function TabBar({
  currentTab,
  setCurrentTab,
}: {
  currentTab: MainTabId;
  setCurrentTab: (tab: MainTabId) => void;
}) {
  return (
    <View style={tabBarStyles.container}>
      <TouchableOpacity
        style={tabBarStyles.tab}
        onPress={() => setCurrentTab('main')}
        activeOpacity={0.7}
      >
        <Home
          size={TAB_ICON_SIZE}
          color={currentTab === 'main' ? TAB_ACTIVE_COLOR : TAB_INACTIVE_COLOR}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={tabBarStyles.tab}
        onPress={() => setCurrentTab('timeline')}
        activeOpacity={0.7}
      >
        <Activity
          size={TAB_ICON_SIZE}
          color={currentTab === 'timeline' ? TAB_ACTIVE_COLOR : TAB_INACTIVE_COLOR}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={tabBarStyles.tab}
        onPress={() => setCurrentTab('stats')}
        activeOpacity={0.7}
      >
        <BarChart3
          size={TAB_ICON_SIZE}
          color={currentTab === 'stats' ? TAB_ACTIVE_COLOR : TAB_INACTIVE_COLOR}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={tabBarStyles.tab}
        onPress={() => setCurrentTab('settings')}
        activeOpacity={0.7}
      >
        <Settings
          size={TAB_ICON_SIZE}
          color={currentTab === 'settings' ? TAB_ACTIVE_COLOR : TAB_INACTIVE_COLOR}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={tabBarStyles.tab}
        onPress={() => setCurrentTab('profile')}
        activeOpacity={0.7}
      >
        <User
          size={TAB_ICON_SIZE}
          color={currentTab === 'profile' ? TAB_ACTIVE_COLOR : TAB_INACTIVE_COLOR}
        />
      </TouchableOpacity>
    </View>
  );
}

const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: colors.borderDarker,
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: 28,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeModuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeModuleText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '200',
    letterSpacing: 4,
  },
  dropdownArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.textDark,
    marginLeft: 10,
    marginTop: 4,
  },
  soundToggle: {
    marginLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: colors.inputBorder,
    paddingLeft: 15,
  },
  soundToggleText: {
    color: colors.textPrimary,
    fontSize: 10,
    letterSpacing: 1,
  },
  soundToggleMuted: {
    color: colors.textMuted,
  },
  settingsIcon: {
    padding: 5,
  },
  gearCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  gearInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textPrimary,
    position: 'absolute',
    top: 6.5,
    left: 6.5,
  },
  mainDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonContainer: {
    alignItems: 'center',
  },
  comingSoonText: {
    color: colors.textDark,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 40,
    minWidth: 220,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: colors.inputBackground,
  },
  buttonText: {
    color: colors.buttonPrimaryText,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  buttonTextActive: {
    color: colors.textPrimary,
  },
});
