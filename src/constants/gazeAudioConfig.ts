/**
 * Gaze Audio Effects Registry Configuration
 * Centralized configuration for all available sound effects
 * Add new audio effects by extending this registry - no core logic changes needed
 */

export type GazeAudioId = 'crackling' | 'ambient-space' | 'silence';
export type GazeAudioCategory = 'ambient' | 'nature' | 'none';

export interface GazeAudioConfig {
  id: GazeAudioId;
  name: string;
  category: GazeAudioCategory;
  description: string;
  soundFile: string; // Path to audio asset (empty for silence)
  volume: number; // 0-1 scale
  loopable: boolean; // Whether audio loops during session
  fadeDuration: number; // Fade in/out time in milliseconds
}

/**
 * Audio Effects Registry - Add new audio here
 * Each audio must have a corresponding file in assets/sounds/
 */
export const GAZE_AUDIO_REGISTRY: Record<GazeAudioId, GazeAudioConfig> = {
  crackling: {
    id: 'crackling',
    name: 'Crackling Fire',
    category: 'ambient',
    description: 'Gentle crackling fire sounds',
    soundFile: 'gaze/crackling.mp3',
    volume: 0.4,
    loopable: true,
    fadeDuration: 2000, // 2 second fade
  },
  ambient_space: {
    id: 'ambient-space',
    name: 'Cosmic Ambience',
    category: 'ambient',
    description: 'Peaceful cosmic background sounds',
    soundFile: 'gaze/cosmic-ambient.mp3',
    volume: 0.3,
    loopable: true,
    fadeDuration: 3000, // 3 second fade
  },
  silence: {
    id: 'silence',
    name: 'No Sound',
    category: 'none',
    description: 'Silent session',
    soundFile: '',
    volume: 0,
    loopable: false,
    fadeDuration: 0,
  },
};

/**
 * Audio categories for UI organization
 */
export const GAZE_AUDIO_CATEGORIES: Record<GazeAudioCategory, GazeAudioId[]> = {
  ambient: ['crackling', 'ambient-space'],
  nature: [],
  none: ['silence'],
};

/**
 * Default audio selection
 */
export const DEFAULT_GAZE_AUDIO_ID: GazeAudioId = 'silence';
