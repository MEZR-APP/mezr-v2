/**
 * GazeBreathingGuide Component (v2 - Breath Module Styling)
 * Displays "Inhale" / "Exhale" text with font-size scaling animation
 * Synced to breathing pattern (4s inhale, 4s exhale)
 * Matches Breath module aesthetic (grey, light weight, no bold)
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { GAZE_BREATHING_PATTERN } from '../../constants/gazeConfig';

interface GazeBreathingGuideProps {
  isActive: boolean;
  elapsedMs?: number;
}

const GazeBreathingGuide: React.FC<GazeBreathingGuideProps> = ({
  isActive,
  elapsedMs = 0,
}) => {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [fontSize, setFontSize] = useState(22);

  const CYCLE_DURATION =
    GAZE_BREATHING_PATTERN.inhaleDuration + GAZE_BREATHING_PATTERN.exhaleDuration;

  // Determine current phase and font size based on elapsed time
  useEffect(() => {
    if (!isActive) {
      setFontSize(22);
      return;
    }

    // Calculate which phase we're in
    const cyclePosition = elapsedMs % CYCLE_DURATION;
    const isInhaling = cyclePosition < GAZE_BREATHING_PATTERN.inhaleDuration;

    setBreathingPhase(isInhaling ? 'inhale' : 'exhale');

    // Calculate progress within current phase (0-1)
    let phaseProgress: number;
    if (isInhaling) {
      phaseProgress = cyclePosition / GAZE_BREATHING_PATTERN.inhaleDuration;
    } else {
      const exhaleElapsed = cyclePosition - GAZE_BREATHING_PATTERN.inhaleDuration;
      phaseProgress = exhaleElapsed / GAZE_BREATHING_PATTERN.exhaleDuration;
    }

    // Inhale: grow from 22 to 36, Exhale: shrink from 36 to 22
    const newFontSize = isInhaling ? 22 + phaseProgress * 14 : 36 - phaseProgress * 14;
    setFontSize(newFontSize);
  }, [isActive, elapsedMs]);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          {
            fontSize,
          },
        ]}
      >
        {breathingPhase === 'inhale' ? 'Inhale' : 'Exhale'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
    minHeight: 50,
  },

  // Matches Breath module phaseText styling
  text: {
    color: colors.textDark, // Grey/muted
    fontWeight: '200', // Very light, not bold
    letterSpacing: 8,
    textAlign: 'center',
  },
});

export default GazeBreathingGuide;
