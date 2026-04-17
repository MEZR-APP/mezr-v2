/**
 * Mezr App - Swim Module Component
 * Lap counter with tap-to-count functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../stores/appStore';
import { useActivityStore } from '../../stores/activityStore';
import { playSound, stopSound } from '../../services/audioService';
import { MODULE_SOUNDS } from '../../constants/modules';
import { formatTime } from '../../utils/formatters';

interface SwimModuleProps {
  onReset?: () => void;
}

export const SwimModule: React.FC<SwimModuleProps> = ({ onReset }) => {
  const [laps, setLaps] = useState(0);
  const [swimTime, setSwimTime] = useState(0);
  
  const isActive = useAppStore((state) => state.isActive);
  const isMuted = useAppStore((state) => state.isMuted);
  const logActivity = useActivityStore((state) => state.logActivity);
  const activeSoundRef = useRef<Audio.Sound | null>(null);

  // Stop active sound when muted or session ends
  useEffect(() => {
    if (isMuted || !isActive) {
      stopSound(activeSoundRef.current);
      activeSoundRef.current = null;
    }
  }, [isMuted, isActive]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive) {
      interval = setInterval(() => {
        setSwimTime((prev) => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  // Reset handler
  useEffect(() => {
    if (!isActive && onReset) {
      // Log activity if there was any progress
      if (laps > 0 || swimTime > 0) {
        logActivity('swim', { laps, time: swimTime });
      }
    }
  }, [isActive]);
  
  const handleTap = async () => {
    if (isActive) {
      setLaps((prev) => prev + 1);
      await stopSound(activeSoundRef.current);
      const sound = await playSound(MODULE_SOUNDS.swim.stroke, isMuted);
      activeSoundRef.current = sound;
    }
  };
  
  // Reset function exposed to parent
  const reset = () => {
    setLaps(0);
    setSwimTime(0);
  };
  
  // Expose reset to parent via ref or callback
  useEffect(() => {
    if (onReset) {
      // This will be called by parent when needed
    }
  }, [onReset]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.swimZone}
      onPress={handleTap}
    >
      <Text style={styles.largeNum}>{laps}</Text>
      <Text style={styles.label}>LAPS</Text>
      <Text style={styles.subLabel}>{formatTime(swimTime)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  swimZone: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  largeNum: {
    color: colors.textPrimary,
    fontSize: 90,
    fontWeight: '100',
  },
  label: {
    color: colors.textDark,
    fontSize: 14,
    letterSpacing: 4,
  },
  subLabel: {
    color: colors.textMuted,
    fontSize: 18,
    marginTop: 10,
  },
});

export default SwimModule;
