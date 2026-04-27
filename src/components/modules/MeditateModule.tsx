/**
 * Mezr App - Meditate Module Component
 * Countdown meditation timer with ambient circle
 */

import React, { useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../stores/appStore';
import { useActivityStore } from '../../stores/activityStore';
import { playSound } from '../../services/audioService';
import { MODULE_SOUNDS, DEFAULT_MED_TIME } from '../../constants/modules';
import { formatTime } from '../../utils/formatters';

interface MeditateModuleProps {
  medTime: number;
  setMedTime: React.Dispatch<React.SetStateAction<number>>;
}

export const MeditateModule: React.FC<MeditateModuleProps> = ({
  medTime,
  setMedTime,
}) => {
  const isActive = useAppStore((state) => state.isActive);
  const isMuted = useAppStore((state) => state.isMuted);
  const setIsActive = useAppStore((state) => state.setIsActive);
  const showToast = useAppStore((state) => state.showToast);
  const logActivity = useActivityStore((state) => state.logActivity);
  
  // Animated value for subtle pulse
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setMedTime((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            logActivity('meditate');
            playSound(MODULE_SOUNDS.meditate.bell, isMuted);
            showToast('Meditation complete! 🧘');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isMuted, setIsActive, setMedTime, logActivity, showToast]);
  
  // Subtle breathing animation when active
  useEffect(() => {
    if (isActive) {
      const breatheAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      );
      breatheAnimation.start();
      
      return () => breatheAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />
      <Text style={styles.largeNum}>{formatTime(medTime)}</Text>
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
    borderWidth: 1,
    borderColor: colors.textPrimary,
    opacity: 0.3,
    position: 'absolute',
  },
  largeNum: {
    color: colors.textPrimary,
    fontSize: 90,
    fontWeight: '100',
    marginTop: 45,
  },
});

export default MeditateModule;
