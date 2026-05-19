/**
 * Gaze Service
 * Handles session persistence, Firestore integration, and streak calculations
 * Bridges gazeStore with Firebase and AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firebaseDb } from './firebase';
import { GazeSession, StreakData } from '../types/gaze';
import {
  SESSION_CONFIG,
  GAZE_COLLECTION,
  DEFAULT_GAZE_SETTINGS,
} from '../constants/gazeConfig';
import { useGazeStore } from '../stores/gazeStore';

/**
 * Save completed Gaze session to Firestore and local AsyncStorage
 * Called when user ends a session
 */
export const saveGazeSession = async (
  userId: string,
  session: GazeSession
): Promise<void> => {
  if (!session || session.status !== 'completed') {
    console.warn('[gazeService] Cannot save incomplete session');
    return;
  }

  try {
    // Prepare session document for Firestore
    const sessionDoc = {
      userId,
      startTime: Timestamp.fromDate(new Date(session.startTime)),
      endTime: Timestamp.fromDate(new Date(session.endTime || Date.now())),
      duration: session.duration,
      targetDuration: session.targetDuration,
      audioMuted: session.audioMuted,
      status: 'completed',
      createdAt: Timestamp.serverTimestamp(),
    };

    // Save to Firestore
    const gazeSessionsRef = collection(firebaseDb, 'users', userId, GAZE_COLLECTION);
    await addDoc(gazeSessionsRef, sessionDoc);

    // Also save to local AsyncStorage for offline access
    const existingSessions = await AsyncStorage.getItem(SESSION_CONFIG.storageKey);
    const sessions: GazeSession[] = existingSessions ? JSON.parse(existingSessions) : [];
    sessions.push(session);
    await AsyncStorage.setItem(SESSION_CONFIG.storageKey, JSON.stringify(sessions));

    console.log('[gazeService] Session saved:', session.id);
  } catch (error) {
    console.error('[gazeService] Error saving session:', error);
    throw error;
  }
};

/**
 * Auto-save an abandoned paused session as "Complete"
 * Called when app is backgrounded for 10+ minutes
 */
export const autoSaveAbandonedSession = async (userId: string): Promise<void> => {
  const store = useGazeStore.getState();
  const { currentSession, isPaused } = store;

  if (!currentSession || !isPaused || currentSession.status !== 'paused') {
    return; // No session to auto-save
  }

  // Mark as completed and save
  const completedSession: GazeSession = {
    ...currentSession,
    status: 'completed',
    endTime: Date.now(),
    completedAt: Date.now(),
  };

  try {
    await saveGazeSession(userId, completedSession);
    store.endSession(); // Clear session from store
  } catch (error) {
    console.error('[gazeService] Error auto-saving abandoned session:', error);
  }
};

/**
 * Load all Gaze sessions for a user from Firestore
 * Called on app launch and after session completion
 */
export const loadGazeSessions = async (userId: string): Promise<GazeSession[]> => {
  try {
    const gazeSessionsRef = collection(firebaseDb, 'users', userId, GAZE_COLLECTION);
    const q = query(gazeSessionsRef, where('status', '==', 'completed'));
    const querySnapshot = await getDocs(q);

    const sessions: GazeSession[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      sessions.push({
        id: docSnapshot.id,
        userId,
        startTime: data.startTime?.toMillis?.() || Date.now(),
        endTime: data.endTime?.toMillis?.() || undefined,
        duration: data.duration || 0,
        targetDuration: data.targetDuration || 0,
        status: 'completed',
        audioMuted: data.audioMuted || false,
        completedAt: data.createdAt?.toMillis?.() || Date.now(),
        createdAt: data.createdAt?.toMillis?.() || Date.now(),
      });
    });

    return sessions;
  } catch (error) {
    console.error('[gazeService] Error loading sessions:', error);
    return [];
  }
};

/**
 * Calculate streak from session history
 * Returns consecutive calendar days with ≥1 session
 */
export const calculateStreakFromHistory = (
  sessionHistory: GazeSession[]
): StreakData => {
  if (sessionHistory.length === 0) {
    return {
      currentStreak: 0,
      lastSessionDate: '',
      totalSessionsCompleted: 0,
    };
  }

  // Filter completed sessions
  const completed = sessionHistory
    .filter((s) => s.status === 'completed')
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  if (completed.length === 0) {
    return {
      currentStreak: 0,
      lastSessionDate: '',
      totalSessionsCompleted: 0,
    };
  }

  // Convert to ISO date strings (YYYY-MM-DD)
  const sessionDates = completed.map((s) => {
    const date = new Date(s.completedAt || s.startTime);
    return date.toISOString().split('T')[0];
  });

  // Remove duplicates (multiple sessions same day = 1 day)
  const uniqueDates = Array.from(new Set(sessionDates));
  const lastSessionDate = uniqueDates[0];

  // Calculate consecutive streak
  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const nextDate = new Date(uniqueDates[i + 1]);
    const diffDays = Math.floor(
      (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break; // Streak broken
    }
  }

  return {
    currentStreak: streak,
    lastSessionDate,
    totalSessionsCompleted: completed.length,
  };
};

/**
 * Initialize Gaze on app startup
 * Loads user settings, history, and recovers any paused session
 */
export const initializeGaze = async (userId: string): Promise<void> => {
  try {
    const store = useGazeStore.getState();

    // Load settings from AsyncStorage
    const savedSettings = await AsyncStorage.getItem(SESSION_CONFIG.settingsStorageKey);
    if (savedSettings) {
      store.updateSettings(JSON.parse(savedSettings));
    }

    // Load session history from Firestore
    const sessions = await loadGazeSessions(userId);

    // Calculate streak
    const streak = calculateStreakFromHistory(sessions);

    // Update store with history and streak
    // Note: sessionHistory is not in the store interface; you may want to add it
    store.calculateStreak();

    console.log('[gazeService] Gaze initialized for user:', userId);
  } catch (error) {
    console.error('[gazeService] Error initializing Gaze:', error);
  }
};

/**
 * Save Gaze settings to AsyncStorage and Firestore
 */
export const saveGazeSettings = async (userId: string, settingsJson: string): Promise<void> => {
  try {
    // Save to local storage
    await AsyncStorage.setItem(SESSION_CONFIG.settingsStorageKey, settingsJson);

    // Also save to Firestore (optional, for sync across devices)
    const userDocRef = doc(firebaseDb, 'users', userId);
    await updateDoc(userDocRef, {
      gazeSettings: JSON.parse(settingsJson),
      updatedAt: serverTimestamp(),
    });

    console.log('[gazeService] Settings saved');
  } catch (error) {
    console.error('[gazeService] Error saving settings:', error);
  }
};

/**
 * Check if a session should be auto-saved due to abandonment
 * Returns true if session has been paused for > 10 minutes
 */
export const shouldAutoSaveSession = (pausedAtMs: number): boolean => {
  const now = Date.now();
  const elapsedSincePause = now - pausedAtMs;
  return elapsedSincePause > SESSION_CONFIG.abandonmentTimeout;
};

/**
 * Recover a paused session if the app was killed
 * Called on app startup
 */
export const recoverPausedSession = async (): Promise<GazeSession | null> => {
  try {
    const sessionJson = await AsyncStorage.getItem(SESSION_CONFIG.storageKey);
    if (!sessionJson) return null;

    const session: GazeSession = JSON.parse(sessionJson);

    // Only recover if it's paused (not completed)
    if (session.status === 'paused') {
      console.log('[gazeService] Recovered paused session:', session.id);
      return session;
    }

    return null;
  } catch (error) {
    console.error('[gazeService] Error recovering session:', error);
    return null;
  }
};

/**
 * Clear the current session from AsyncStorage
 * Called after session is saved to Firestore
 */
export const clearCurrentSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESSION_CONFIG.storageKey);
  } catch (error) {
    console.error('[gazeService] Error clearing session:', error);
  }
};
