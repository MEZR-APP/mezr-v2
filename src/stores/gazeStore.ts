/**
 * Gaze Store
 * Zustand store for Gaze session state and settings
 * Independent of other stores to maintain modularity
 */

import { create } from 'zustand';
import { GazeSession, GazeSessionStatus, GazeSettings, StreakData, GazeStoreState } from '../types/gaze';
import {
  DEFAULT_GAZE_SETTINGS,
  GAZE_DURATIONS,
  SESSION_CONFIG,
} from '../constants/gazeConfig';

export const useGazeStore = create<GazeStoreState>((set, get) => {
  let sessionStartTime: number = 0; // Track when session actually started (after pause/resume)
  let totalPausedTime: number = 0; // Accumulate paused durations
  let pauseStartTime: number = 0; // When pause was triggered

  return {
    // Initial state
    currentSession: null,
    isActive: false,
    isPaused: false,
    settings: DEFAULT_GAZE_SETTINGS,
    streak: {
      currentStreak: 0,
      lastSessionDate: '',
      totalSessionsCompleted: 0,
    },
    sessionHistory: [],

    // =====================================
    // SESSION ACTIONS
    // =====================================

    startSession: (targetDuration: number) => {
      const now = Date.now();
      const newSession: GazeSession = {
        id: `gaze_${now}_${Math.random().toString(36).slice(2, 9)}`,
        userId: '', // Will be set by gazeService from auth context
        startTime: now,
        duration: 0,
        targetDuration,
        status: 'active',
        audioMuted: false,
        createdAt: now,
      };

      sessionStartTime = now;
      totalPausedTime = 0;
      pauseStartTime = 0;

      set({
        currentSession: newSession,
        isActive: true,
        isPaused: false,
      });
    },

    pauseSession: () => {
      const { currentSession } = get();
      if (!currentSession || currentSession.status !== 'active') return;

      const now = Date.now();
      pauseStartTime = now;

      // Update current session with elapsed time up to this point
      const elapsedInThisRun = now - sessionStartTime;
      const totalElapsedSoFar = totalPausedTime + elapsedInThisRun;

      set((state) => ({
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              duration: totalElapsedSoFar,
              status: 'paused' as GazeSessionStatus,
            }
          : null,
        isActive: false,
        isPaused: true,
      }));
    },

    resumeSession: () => {
      const { currentSession } = get();
      if (!currentSession || currentSession.status !== 'paused') return;

      // Accumulate the paused time
      const pauseDuration = Date.now() - pauseStartTime;
      totalPausedTime += pauseDuration;
      sessionStartTime = Date.now();

      set((state) => ({
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              status: 'active' as GazeSessionStatus,
            }
          : null,
        isActive: true,
        isPaused: false,
      }));
    },

    endSession: () => {
      const { currentSession } = get();
      if (!currentSession) return;

      const now = Date.now();

      // Calculate final elapsed time
      let finalElapsed = totalPausedTime;
      if (currentSession.status === 'active') {
        finalElapsed += now - sessionStartTime;
      }

      set((state) => ({
        currentSession: state.currentSession
          ? {
              ...state.currentSession,
              endTime: now,
              duration: finalElapsed,
              status: 'completed' as GazeSessionStatus,
              completedAt: now,
            }
          : null,
        isActive: false,
        isPaused: false,
      }));
    },

    // =====================================
    // AUDIO & SETTINGS
    // =====================================

    setAudioMuted: (muted: boolean) => {
      set((state) => ({
        currentSession: state.currentSession
          ? { ...state.currentSession, audioMuted: muted }
          : null,
      }));
    },

    updateSettings: (updatedSettings: Partial<GazeSettings>) => {
      set((state) => ({
        settings: { ...state.settings, ...updatedSettings },
      }));
    },

    setVisual: (visualId: 'candle' | 'cosmos') => {
      set((state) => ({
        settings: { ...state.settings, visualId },
      }));
    },

    setAudio: (audioId: 'crackling' | 'ambient-space' | 'silence') => {
      set((state) => ({
        settings: { ...state.settings, audioId },
      }));
    },

    // =====================================
    // HISTORY & STREAK
    // =====================================

    loadSessionHistory: async () => {
      // This will be populated by gazeService from Firestore
      // Placeholder for future integration
      set({ sessionHistory: [] });
    },

    calculateStreak: () => {
      const { sessionHistory } = get();

      if (sessionHistory.length === 0) {
        return {
          currentStreak: 0,
          lastSessionDate: '',
          totalSessionsCompleted: 0,
        };
      }

      // Get completed sessions, sorted by date (newest first)
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

      // Convert timestamps to ISO date strings (YYYY-MM-DD)
      const sessionDates = completed.map((s) => {
        const date = new Date(s.completedAt || s.startTime);
        return date.toISOString().split('T')[0];
      });

      // Remove duplicates (multiple sessions same day count as 1)
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
    },

    // =====================================
    // DERIVED STATE (Selectors)
    // =====================================

    getElapsedTime: () => {
      const { currentSession, isActive } = get();
      if (!currentSession) return 0;

      let elapsed = totalPausedTime;
      if (isActive) {
        elapsed += Date.now() - sessionStartTime;
      }

      return Math.min(elapsed, currentSession.targetDuration);
    },

    getTimeRemaining: () => {
      const { currentSession } = get();
      if (!currentSession) return 0;

      const elapsed = get().getElapsedTime();
      return Math.max(0, currentSession.targetDuration - elapsed);
    },

    getProgressPercent: () => {
      const { currentSession } = get();
      if (!currentSession) return 0;

      const elapsed = get().getElapsedTime();
      return Math.round((elapsed / currentSession.targetDuration) * 100);
    },
  };
});

// =====================================
// SELECTORS (For cleaner component usage)
// =====================================

export const useGazeCurrentSession = () =>
  useGazeStore((state) => state.currentSession);

export const useGazeIsActive = () =>
  useGazeStore((state) => state.isActive);

export const useGazeIsPaused = () =>
  useGazeStore((state) => state.isPaused);

export const useGazeSettings = () =>
  useGazeStore((state) => state.settings);

export const useGazeStreak = () =>
  useGazeStore((state) => state.streak);

export const useGazeElapsedTime = () =>
  useGazeStore((state) => state.getElapsedTime());

export const useGazeTimeRemaining = () =>
  useGazeStore((state) => state.getTimeRemaining());

export const useGazeProgress = () =>
  useGazeStore((state) => state.getProgressPercent());
