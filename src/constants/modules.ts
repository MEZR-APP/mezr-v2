/**
 * Mezr App - Module Constants & Configuration
 */

import type {
  Category,
  Module,
  BreathPattern,
  ModuleSounds,
} from '../types';

// ============================================
// CATEGORIES
// ============================================

export const CATEGORIES: Category[] = [
  { id: 'health', label: 'HEALTH', emoji: '🏃' },
  { id: 'wellness', label: 'WELLNESS', emoji: '😴' },
  { id: 'productivity', label: 'PRODUCTIVITY', emoji: '📝' },
  { id: 'finance', label: 'FINANCE', emoji: '💰' },
];

// ============================================
// MODULES
// ============================================

export const ALL_MODULES: Module[] = [
  { id: 'breath', label: 'BREATH', category: 'health' },
  { id: 'swim', label: 'SWIM', category: 'health' },
  { id: 'run', label: 'RUN', category: 'health' },
  { id: 'cycle', label: 'CYCLE', category: 'health' },
  { id: 'meditate', label: 'ZEN', category: 'wellness' },
  { id: 'gaze', label: 'GAZE', category: 'wellness' },
];

// ============================================
// DEFAULT BREATHING PATTERNS
// ============================================

export const DEFAULT_PATTERNS: BreathPattern[] = [
  {
    id: 'basic',
    name: 'Basic',
    inhaleDuration: 2500,
    exhaleDuration: 3000,
    breathCycles: 5,
    hold1Duration: 10,
    hold2Duration: 0,
    restDuration: 5,
    sessions: 3,
    isDefault: true,
  },
  {
    id: 'sleep',
    name: 'Sleep',
    inhaleDuration: 4000,
    exhaleDuration: 8000,
    breathCycles: 4,
    hold1Duration: 7,
    hold2Duration: 0,
    restDuration: 0,
    sessions: 4,
    isDefault: true,
  },
  {
    id: 'relaxation',
    name: 'Relaxation',
    inhaleDuration: 4000,
    exhaleDuration: 6000,
    breathCycles: 10,
    hold1Duration: 5,
    hold2Duration: 0,
    restDuration: 3,
    sessions: 3,
    isDefault: true,
  },
];

// ============================================
// MODULE SOUNDS
// ============================================

export const MODULE_SOUNDS: ModuleSounds = {
  breath: {
    inhale: {
      url: 'https://assets.mixkit.co/active_storage/sfx/1212/1212-preview.mp3',
      pitch: 1.1,
    },
    exhale: {
      url: 'https://assets.mixkit.co/active_storage/sfx/1212/1212-preview.mp3',
      pitch: 0.9,
    },
    hold: {
      url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      pitch: 1.0,
    },
    rest: {
      url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      pitch: 0.8,
    },
  },
  swim: {
    stroke: {
      url: 'https://assets.mixkit.co/active_storage/sfx/2504/2504-preview.mp3',
      pitch: 1.0,
    },
  },
  meditate: {
    bell: {
      url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      pitch: 1.0,
    },
  },
  run: {
    footstep: {
      url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      pitch: 1.0,
    },
  },
  cycle: {
    pedal: {
      url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      pitch: 1.0,
    },
  },
  gaze: {
    breathing: {
      url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      pitch: 1.0,
    },
  },
};

// ============================================
// HELPER CONSTANTS
// ============================================

export const STORAGE_KEYS = {
  BREATH_PATTERNS: 'breath_patterns',
  APP_HISTORY: 'app_history',
  CLOUD_BACKUP: 'cloud_backup_enabled',
} as const;

export const DEFAULT_PATTERN_ID = 'basic';

export const DEFAULT_MED_TIME = 600; // 10 minutes in seconds
