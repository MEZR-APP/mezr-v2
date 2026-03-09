/**
 * Mezr App - Breath Module Component
 * Breathing circle, phase display, and progress
 */

import React from 'react';
import { View, Text, Animated, Pressable, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../stores/appStore';
import { useBreathStore } from '../../stores/breathStore';
import { useBreathingSession } from '../../hooks/useBreathingSession';

export const BreathModule: React.FC = () => {
  const isActive = useAppStore((state) => state.isActive);
  const setIsActive = useAppStore((state) => state.setIsActive);
  const phase = useBreathStore((state) => state.sessionState.phase);
  const resetSession = useBreathStore((state) => state.resetSession);
  const {
    mainAnim,
    pattern,
    skipToNextPhase,
    getPhaseDisplay,
    getProgressDisplay,
  } = useBreathingSession();

  const showControls = isActive && phase !== 'idle' && phase !== 'complete' && phase !== 'ready';

  const handlePause = () => {
    setIsActive(false);
  };

  const handleSkip = () => {
    skipToNextPhase();
  };

  const handleReset = () => {
    resetSession();
    setIsActive(false);
  };

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
      {!isActive && !showControls && (
        <Text style={styles.patternLabel}>{pattern.name}</Text>
      )}
      {showControls && (
        <View style={styles.controlRow}>
          <Pressable style={styles.controlButton} onPress={handlePause}>
            <Text style={styles.controlButtonText}>PAUSE</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={handleSkip}>
            <Text style={styles.controlButtonText}>SKIP</Text>
          </Pressable>
          <Pressable style={[styles.controlButton, styles.controlButtonDanger]} onPress={handleReset}>
            <Text style={[styles.controlButtonText, styles.controlButtonDangerText]}>RESET</Text>
          </Pressable>
        </View>
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
  controlRow: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 12,
  },
  controlButton: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
  },
  controlButtonText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  controlButtonDanger: {
    backgroundColor: colors.dangerBackground,
  },
  controlButtonDangerText: {
    color: colors.dangerText,
  },
});

export default BreathModule;
