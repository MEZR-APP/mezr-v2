/**
 * Gaze Visuals Registry Configuration
 * Centralized configuration for all available visual themes
 * Add new visuals by extending this registry - no core logic changes needed
 */

export type GazeVisualId = 'candle' | 'cosmos';
export type GazeVisualCategory = 'fire' | 'sky' | 'nature';

export interface GazeVisualConfig {
  id: GazeVisualId;
  name: string;
  category: GazeVisualCategory;
  description: string;
  thumbnailColor: string; // Hex color for UI preview
  minDuration: number; // Milliseconds
  maxDuration: number; // Milliseconds
  recommendedAudioId: string | null; // Default audio pairing
}

/**
 * Visual Registry - Add new visuals here
 * Each visual must have a corresponding component in src/components/modules/visuals/
 */
export const GAZE_VISUALS_REGISTRY: Record<GazeVisualId, GazeVisualConfig> = {
  candle: {
    id: 'candle',
    name: 'Candle',
    category: 'fire',
    description: 'Warm, organic flame to focus on',
    thumbnailColor: '#FF6B35',
    minDuration: 3 * 60 * 1000, // 3 minutes
    maxDuration: 30 * 60 * 1000, // 30 minutes
    recommendedAudioId: 'crackling',
  },
  cosmos: {
    id: 'cosmos',
    name: 'Cosmos',
    category: 'sky',
    description: 'Peaceful galaxy with twinkling stars',
    thumbnailColor: '#1E3A8A',
    minDuration: 3 * 60 * 1000, // 3 minutes
    maxDuration: 30 * 60 * 1000, // 30 minutes
    recommendedAudioId: 'ambient-space',
  },
};

/**
 * Group visuals by category for UI organization
 * Used for filtering and displaying visuals in settings
 */
export const GAZE_VISUAL_CATEGORIES: Record<GazeVisualCategory, GazeVisualId[]> = {
  fire: ['candle'],
  sky: ['cosmos'],
  nature: [],
};

/**
 * Default visual selection
 */
export const DEFAULT_GAZE_VISUAL_ID: GazeVisualId = 'candle';
