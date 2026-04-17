/**
 * Mezr App - Breath Module Component
 * Breathing circle, phase display, and progress
 */

import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../stores/appStore';
import { useBreathingSession } from '../../hooks/useBreathingSession';

export const BreathModule: React.FC = () => {
  const isActive = useAppStore((state) => state.isActive);
  const {
    mainAnim,
    pattern,
    getPhaseDisplay,
    getProgressDisplay,
  } = useBreathingSession();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          { transform: [{ scale: mainAnim }] },
        ]}
      />
      <Text style={styles.phaseText}>{getPhaseDisplay()}</Text>
      <Text style={styles.counterText}>{getProgressDisplay()}</Text>
      {!isActive && (
        <Text style={styles.patternLabel}>{pattern.name}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  phaseText: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '200',
    letterSpacing: 8,
    marginTop: 50,
    minHeight: 30,
    textAlign: 'center',
  },
  counterText: {
    color: colors.textDark,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 15,
    fontWeight: '600',
  },
  patternLabel: {
    color: colors.textDarker,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 25,
    fontStyle: 'italic',
  },
});

export default BreathModule;
