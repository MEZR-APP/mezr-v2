/**
 * Gaze Module Configuration
 * Central configuration for all Gaze-related constants and parameters
 */

import { GazeSettings, GazeBreathingPattern } from '../types/gaze';

// Default durations (in milliseconds)
export const GAZE_DURATIONS = {
  SHORT: 3 * 60 * 1000,      // 3 minutes
  DEFAULT: 5 * 60 * 1000,    // 5 minutes (default)
  MEDIUM: 7 * 60 * 1000,     // 7 minutes
  LONG: 10 * 60 * 1000,      // 10 minutes
} as const;

// Breathing pattern (same as breathing module for consistency)
export const GAZE_BREATHING_PATTERN: GazeBreathingPattern = {
  inhaleDuration: 4000,  // 4 seconds
  exhaleDuration: 4000,  // 4 seconds
  // Full cycle: 8 seconds
};

// Flame animation parameters
export const FLAME_ANIMATION_CONFIG = {
  // Frequency of flame flicker (lower = slower, more organic)
  flickerFrequency: 0.8, // oscillations per second

  // Base intensity (0-1)
  baseIntensity: 0.7,

  // Random variation (0-1)
  randomVariation: 0.3,

  // Animation update interval (ms)
  updateInterval: 50, // 20 FPS for smooth animation
} as const;

// Session persistence & recovery
export const SESSION_CONFIG = {
  // How long until an abandoned paused session auto-saves
  abandonmentTimeout: 10 * 60 * 1000, // 10 minutes

  // Storage key for current session
  storageKey: 'gaze_current_session',

  // Settings storage key
  settingsStorageKey: 'gaze_settings',
} as const;

// Default settings
export const DEFAULT_GAZE_SETTINGS: GazeSettings = {
  defaultDuration: GAZE_DURATIONS.DEFAULT,
  autoEndOnCompletion: true,
  guidanceAudioEnabled: true,
  visualId: 'candle', // Default visual
  audioId: 'silence', // Default to silence (no background audio)
};

// Firestore collection name
export const GAZE_COLLECTION = 'gazeSessions';

// Audio file for breathing guidance
export const GAZE_AUDIO_FILES = {
  guidanceBreathing: 'breathing-guidance.m4a', // Existing audio asset
};

// Analytics event names
export const GAZE_ANALYTICS_EVENTS = {
  sessionStarted: 'gaze_session_started',
  sessionCompleted: 'gaze_session_completed',
  sessionAbandoned: 'gaze_session_abandoned',
  streakUpdated: 'gaze_streak_updated',
} as const;
