/**
 * Mezr App - Notification Service
 * Persistent notification in the Android shade showing current task + quick actions
 *
 * Architecture:
 *   - Shows persistent notification in notification shade (always visible)
 *   - Displays current task name + elapsed time
 *   - Action buttons: Pause | Stop | Open App
 *   - Quick preset tasks as separate notification actions
 *   - Syncs with taskStore in real-time
 *   - Survives app backgrounding on Android
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TaskEntry } from '../types/task';

// ============================================
// CONSTANTS
// ============================================

const NOTIFICATION_CHANNEL_ID = 'mezr_persistent';
const PERSISTENT_NOTIF_ID = 999; // Fixed ID so it updates, not duplicates
const QUICK_PRESETS_KEY = '@mezr_quick_presets';

export const DEFAULT_QUICK_PRESETS = [
  'Driving',
  'Coffee',
  'Shower',
  'Meeting',
  'Break',
  'Workout',
];

// ============================================
// TYPES
// ============================================

export interface NotificationAction {
  type: 'start_task' | 'pause_task' | 'resume_task' | 'stop_task' | 'open_app';
  taskName?: string;
}

// ============================================
// INIT & PERMISSIONS
// ============================================

/**
 * Request notification permissions + set up Android channel
 * Call this once on app launch
 */
export const initializeNotifications = async (): Promise<boolean> => {
  try {
    // Request permission
    const { status } = await Notifications.requestPermissionsAsync();
    const granted = status === 'granted';

    if (granted) {
      // Set up Android notification channel for persistent notifications
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'MEZR Task Tracking',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
        enableLights: true,
        enableVibration: true,
        showBadge: true,
      });
    }

    return granted;
  } catch (err) {
    console.error('Notification init error:', err);
    return false;
  }
};

// ============================================
// PERSISTENT NOTIFICATION DISPLAY
// ============================================

/**
 * Show/update the persistent notification in the notification shade
 * This gets called every second when a task is running
 */
export const updatePersistentNotification = async (
  activeTask: TaskEntry | null,
  elapsedMs: number
): Promise<string | null> => {
  try {
    // Format elapsed time
    const totalSec = Math.max(0, Math.floor(elapsedMs / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const timeStr =
      h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    if (!activeTask) {
      // No active task — show "Ready to log" notification
      await Notifications.scheduleNotificationAsync({
        identifier: String(PERSISTENT_NOTIF_ID),
        content: {
          title: 'MEZR Task Logger',
          body: 'Ready to log your next task',
          data: { action: 'open_app' },
          android: {
            channelId: NOTIFICATION_CHANNEL_ID,
            priority: 'max',
            sticky: true,
            onlyAlertOnce: true,
          },
        },
        trigger: null, // Immediate
      });
      return String(PERSISTENT_NOTIF_ID);
    }

    // Active task — show name + elapsed time + action buttons
    const title = activeTask.name.toUpperCase();
    const subtitle =
      activeTask.status === 'paused' ? `${timeStr} (PAUSED)` : timeStr;

    await Notifications.scheduleNotificationAsync({
      identifier: String(PERSISTENT_NOTIF_ID),
      content: {
        title,
        body: subtitle,
        data: {
          taskId: activeTask.id,
          action: 'open_app',
          taskName: activeTask.name,
          taskStatus: activeTask.status,
        },
        android: {
          channelId: NOTIFICATION_CHANNEL_ID,
          priority: 'max',
          sticky: true,
          onlyAlertOnce: true,
          // Show action buttons (pause/resume and stop)
          actions: [
            {
              identifier: 'pause_task',
              buttonTitle: activeTask.status === 'paused' ? '▶ RESUME' : '⏸ PAUSE',
              icon: 'ic_action_pause',
            },
            {
              identifier: 'stop_task',
              buttonTitle: '■ STOP',
              icon: 'ic_action_stop',
              isAuthenticationRequired: false,
              isDestructive: true,
            },
          ],
        },
      },
      trigger: null, // Immediate
    });

    return String(PERSISTENT_NOTIF_ID);
  } catch (err) {
    console.error('Update persistent notification error:', err);
    return null;
  }
};

// ============================================
// QUICK PRESET NOTIFICATIONS
// ============================================

/**
 * Load quick preset tasks from storage
 */
export const loadQuickPresets = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(QUICK_PRESETS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_QUICK_PRESETS;
  } catch (err) {
    console.error('Load quick presets error:', err);
    return DEFAULT_QUICK_PRESETS;
  }
};

/**
 * Save quick preset tasks to storage
 */
export const saveQuickPresets = async (presets: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(QUICK_PRESETS_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Save quick presets error:', err);
  }
};

/**
 * Show quick preset buttons as a separate notification
 * User can tap "Start: Coffee" button to quickly start a task
 */
export const showQuickPresetsNotification = async (presets: string[]): Promise<void> => {
  try {
    const actions = presets.slice(0, 3).map((preset) => ({
      identifier: `quick_${preset}`,
      buttonTitle: `▶ ${preset}`,
      icon: 'ic_action_play',
    }));

    await Notifications.scheduleNotificationAsync({
      identifier: 'quick_presets',
      content: {
        title: 'Quick Start',
        body: 'Tap to start a quick task',
        data: { action: 'quick_presets' },
        android: {
          channelId: NOTIFICATION_CHANNEL_ID,
          priority: 'default',
          sticky: false,
          onlyAlertOnce: true,
          actions,
        },
      },
      trigger: { seconds: 1 }, // Show after 1 sec
    });
  } catch (err) {
    console.error('Quick presets notification error:', err);
  }
};

// ============================================
// DISMISS & CLEANUP
// ============================================

export const dismissPersistentNotification = async (): Promise<void> => {
  try {
    await Notifications.dismissNotificationAsync(String(PERSISTENT_NOTIF_ID));
  } catch (err) {
    console.error('Dismiss notification error:', err);
  }
};

export const dismissAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (err) {
    console.error('Dismiss all notifications error:', err);
  }
};

// ============================================
// NOTIFICATION HANDLERS
// ============================================

/**
 * Set up listeners for when user taps notification or presses action button
 * Returns unsubscribe functions
 */
export const setupNotificationHandlers = (
  onNotificationResponse: (action: NotificationAction) => void
): (() => void) => {
  // Listener: User taps on a notification
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response: Notifications.NotificationResponse) => {
      const action = response.notification.request.content.data.action;
      const taskName = response.notification.request.content.data.taskName;
      const actionId = response.actionId;

      // Handle action button press (pause, stop, etc.)
      if (actionId === 'pause_task') {
        onNotificationResponse({ type: 'pause_task' });
      } else if (actionId === 'stop_task') {
        onNotificationResponse({ type: 'stop_task' });
      } else if (actionId?.startsWith('quick_')) {
        // Quick preset task
        const presetName = actionId.replace('quick_', '');
        onNotificationResponse({ type: 'start_task', taskName: presetName });
      } else {
        // Default: open app
        onNotificationResponse({ type: 'open_app' });
      }
    }
  );

  // Return unsubscribe function
  return () => {
    responseListener.remove();
  };
};

// ============================================
// BACKGROUND NOTIFICATION HANDLING
// ============================================

/**
 * Set up handler for notifications that arrive while app is backgrounded
 * (For future use — currently just logs)
 */
export const setupBackgroundNotificationHandler = (): void => {
  // This is called by setupNotificationListener in the foreground handler
  // For background handling with task manager, we'd use expo-task-manager
  // But for now, just log it
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};
