/**
 * Gaze Visuals Registry
 * Dynamically loads visual components based on registry
 * Add new visuals by: 1) Create component, 2) Import here, 3) Add to registry
 */

import GazeCandleAnimation from '../GazeCandleAnimation';
import GazeCosmosAnimation from './GazeCosmosAnimation';

export type VisualComponentType = React.FC<{ isActive: boolean; size: number }>;

/**
 * Visual component registry
 * Maps visual IDs to their React components
 */
export const GAZE_VISUAL_COMPONENTS: Record<string, VisualComponentType> = {
  candle: GazeCandleAnimation,
  cosmos: GazeCosmosAnimation,
};

/**
 * Get visual component by ID
 * @param visualId - The visual identifier
 * @returns The visual component or undefined if not found
 */
export const getVisualComponent = (visualId: string): VisualComponentType | undefined => {
  return GAZE_VISUAL_COMPONENTS[visualId];
};

export default GAZE_VISUAL_COMPONENTS;
