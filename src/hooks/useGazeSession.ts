/**
 * useGazeSession Hook
 * Manages Gaze session lifecycle: timer, auto-save, persistence
 * Similar pattern to useBreathingSession
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGazeStore } from '../stores/gazeStore';
import {
  saveGazeSession,
  autoSaveAbandonedSession,
  saveGazeSettings,
  recoverPausedSession,
  clearCurrentSession,
} from '../services/gazeService';
import { useAuthStore } from '../stores/authStore';
import { GAZE_DURATIONS } from '../constants/gazeConfig';

export const useGazeSession = () => {
  const {
    currentSession,
    isActive,
    isPaused,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    setAudioMuted,
    settings,
    getElapsedTime,
    getTimeRemaining,
    getProgressPercent,
  } = useGazeStore();

  const userId = useAuthStore((state) => state.userId); // Get from auth store
  const appStateRef = useRef<AppStateStatus>('active');
  const pausedAtRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [, setUpdateTrigger] = useState(0); // Force re-render for timer updates

  // =========================================================
  // TIMER MANAGEMENT
  // =========================================================

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      // Force component re-render to update timer display
      setUpdateTrigger((prev) => prev + 1);

      const remaining = getTimeRemaining();
      const targetDuration = currentSession?.targetDuration || GAZE_DURATIONS.DEFAULT;

      // Auto-end when time runs out
      if (remaining <= 0 && currentSession?.status === 'active') {
        endSession();
        clearInterval(timerIntervalRef.current!);
      }
    }, 100); // Update UI every 100ms (smooth 10 FPS)
  }, [currentSession, getTimeRemaining, endSession]);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // =========================================================
  // SESSION LIFECYCLE
  // =========================================================

  const handleStartSession = useCallback(
    (duration?: number) => {
      if (isActive) return; // Already running

      const targetDuration = duration || settings.defaultDuration;
      startSession(targetDuration);
      startTimer();
    },
    [isActive, settings.defaultDuration, startSession, startTimer]
  );

  const handlePauseSession = useCallback(() => {
    if (!isActive || isPaused) return;

    pauseSession();
    stopTimer();
    pausedAtRef.current = Date.now();
  }, [isActive, isPaused, pauseSession, stopTimer]);

  const handleResumeSession = useCallback(() => {
    if (!isPaused || !currentSession) return;

    resumeSession();
    startTimer();
  }, [isPaused, currentSession, resumeSession, startTimer]);

  const handleEndSession = useCallback(async () => {
    if (!currentSession) return;

    endSession();
    stopTimer();

    // Persist to Firestore
    if (userId && currentSession.status === 'completed') {
      try {
        await saveGazeSession(userId, {
          ...currentSession,
          status: 'completed',
          completedAt: Date.now(),
        });
        await clearCurrentSession();
      } catch (error) {
        console.error('[useGazeSession] Error saving session:', error);
      }
    }
  }, [currentSession, userId, endSession, stopTimer]);

  // =========================================================
  // APP STATE MONITORING (Background/Foreground)
  // =========================================================

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      const prevAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      if (prevAppState === 'active' && nextAppState.match(/inactive|background/)) {
        // App is backgrounding
        if (isActive) {
          handlePauseSession();
        }

        // Mark when app went to background
        pausedAtRef.current = Date.now();
      } else if (prevAppState.match(/inactive|background/) && nextAppState === 'active') {
        // App is coming to foreground
        if (isPaused && currentSession) {
          // Check if auto-save timeout elapsed
          const timeSincePause = Date.now() - pausedAtRef.current;
          const shouldAutoSave = timeSincePause > 10 * 60 * 1000; // 10 minutes

          if (shouldAutoSave && userId) {
            // Auto-save the paused session as complete
            autoSaveAbandonedSession(userId);
            console.log('[useGazeSession] Auto-saved abandoned session');
          }
        }
      }
    },
    [isActive, isPaused, currentSession, handlePauseSession, userId]
  );

  // =========================================================
  // SESSION PERSISTENCE
  // =========================================================

  // Save settings whenever they change
  useEffect(() => {
    if (userId) {
      const settingsJson = JSON.stringify(settings);
      saveGazeSettings(userId, settingsJson);
    }
  }, [userId, settings]);

  // Cleanup: Save session state when component unmounts
  useEffect(() => {
    return () => {
      stopTimer();

      // If session is still paused, it will be auto-recovered on next app launch
      if (isPaused && currentSession && userId) {
        // Optionally, you can do immediate cleanup here
        // For now, rely on auto-save on app state change
      }
    };
  }, [stopTimer, isPaused, currentSession, userId]);

  // =========================================================
  // TIMER UPDATES
  // =========================================================

  // Start timer whenever session becomes active
  useEffect(() => {
    if (isActive && !timerIntervalRef.current) {
      startTimer();
    } else if (!isActive && timerIntervalRef.current) {
      stopTimer();
    }

    return () => {
      // Cleanup on unmount
    };
  }, [isActive, startTimer, stopTimer]);

  // =========================================================
  // PUBLIC API
  // =========================================================

  return {
    // Current state
    currentSession,
    isActive,
    isPaused,
    elapsedMs: getElapsedTime(),
    remainingMs: getTimeRemaining(),
    progressPercent: getProgressPercent(),

    // Controls
    startSession: handleStartSession,
    pauseSession: handlePauseSession,
    resumeSession: handleResumeSession,
    endSession: handleEndSession,
    setAudioMuted,

    // Settings
    settings,

    // Utility
    formatTime: (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
  };
};
