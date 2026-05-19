/**
 * Gaze Module Types
 * Defines all TypeScript interfaces for the Gaze wellness feature
 */

export type GazeSessionStatus = 'idle' | 'active' | 'paused' | 'completed';

export interface GazeSession {
  id: string;
  userId: string;
  startTime: number; // timestamp in ms
  endTime?: number; // timestamp in ms (null if still running)
  duration: number; // elapsed time in ms
  targetDuration: number; // intended duration in ms (5 min default)
  status: GazeSessionStatus;
  audioMuted: boolean;
  completedAt?: number; // when session was marked complete
  createdAt: number;
}

export interface GazeSettings {
  defaultDuration: number; // in ms (default 5 * 60 * 1000)
  autoEndOnCompletion: boolean; // auto-dismiss when timer ends
  guidanceAudioEnabled: boolean; // breathing guidance voice
  visualId: 'candle' | 'cosmos'; // Selected visual theme
  audioId: 'crackling' | 'ambient-space' | 'silence'; // Selected audio effect
}

export interface StreakData {
  currentStreak: number; // consecutive calendar days
  lastSessionDate: string; // ISO date string (YYYY-MM-DD)
  totalSessionsCompleted: number;
}

export interface GazeBreathingPattern {
  inhaleDuration: number; // ms (4000 default)
  exhaleDuration: number; // ms (4000 default)
}

export interface GazeStoreState {
  // Current session state
  currentSession: GazeSession | null;
  isActive: boolean;
  isPaused: boolean;

  // Settings
  settings: GazeSettings;

  // Analytics
  streak: StreakData;
  sessionHistory: GazeSession[];

  // Actions
  startSession: (targetDuration: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  setAudioMuted: (muted: boolean) => void;
  updateSettings: (settings: Partial<GazeSettings>) => void;
  setVisual: (visualId: 'candle' | 'cosmos') => void;
  setAudio: (audioId: 'crackling' | 'ambient-space' | 'silence') => void;
  loadSessionHistory: () => Promise<void>;
  calculateStreak: () => StreakData;

  // Selectors / derived state
  getElapsedTime: () => number; // current elapsed ms
  getTimeRemaining: () => number; // remaining ms
  getProgressPercent: () => number; // 0-100
}
