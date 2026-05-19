/**
 * GazeCandleAnimation Component (v4 - Colored Organic)
 * Warm colored flame (orange→amber→yellow) with tan candle wax
 * Matches design system specifications - organic, phenomenal animation
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

interface GazeCandleAnimationProps {
  isActive: boolean;
  size?: number;
}

interface FlameState {
  intensity: number;
  wobble: number;
  tilt: number;
  scaleY: number;
}

const GazeCandleAnimation: React.FC<GazeCandleAnimationProps> = ({
  isActive,
  size = 400,
}) => {
  const [time, setTime] = useState(0);
  const [flameState, setFlameState] = useState<FlameState>({
    intensity: 0.8,
    wobble: 0,
    tilt: 0,
    scaleY: 1,
  });

  // Timer for animation
  useEffect(() => {
    if (!isActive) {
      setFlameState({ intensity: 0.4, wobble: 0, tilt: 0, scaleY: 0.95 });
      return;
    }

    const interval = setInterval(() => {
      setTime((prevTime) => prevTime + 0.016); // ~60 FPS
    }, 16);

    return () => clearInterval(interval);
  }, [isActive]);

  // Calculate organic flame behavior (3-layer pulsing like cosmos)
  useEffect(() => {
    if (!isActive) return;

    // Three independent oscillation curves
    const slowPulse = Math.sin(time * 0.6) * 0.25 + 0.75; // 0.5 to 1.0, slow breathing
    const mediumFlutter = Math.sin(time * 1.4) * 0.15 + 0.5; // 0.35 to 0.65, medium flutter
    const fastFlicker = Math.sin(time * 2.8) * 0.1 + 0.5; // 0.4 to 0.6, fast micro-flicker

    // Combine curves organically
    const combinedIntensity = (slowPulse * 0.5 + mediumFlutter * 0.3 + fastFlicker * 0.2);

    // Wobble: lateral movement (wind effect)
    const wobble = Math.sin(time * 0.7) * 0.15 + Math.sin(time * 1.3) * 0.1;

    // Tilt: tilting motion
    const tilt = Math.sin(time * 0.5) * 0.12;

    // Height scaling: organic growth/shrink
    const scaleY = 0.9 + Math.sin(time * 0.8) * 0.15;

    setFlameState({
      intensity: Math.max(0.3, Math.min(1, combinedIntensity)),
      wobble,
      tilt,
      scaleY: Math.max(0.8, scaleY),
    });
  }, [time, isActive]);

  const candleWidth = size * 0.12;
  const candleHeight = size * 0.35;
  const flameWidth = size * 0.22;
  const flameHeight = size * 0.32;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Wick */}
      <View
        style={[
          styles.wick,
          {
            width: 1.2,
            height: candleHeight * 0.3,
            bottom: size * 0.35,
            opacity: flameState.intensity,
          },
        ]}
      />

      {/* Flame - Colored layers with organic animation */}
      <View
        style={[
          styles.flameContainer,
          {
            width: flameWidth,
            height: flameHeight,
            bottom: size * 0.32,
            opacity: flameState.intensity,
            transform: [
              { scaleY: flameState.scaleY },
              { scaleX: 1 + flameState.wobble * 0.15 },
              { translateX: flameState.tilt * 6 },
            ] as any,
          },
        ]}
      >
        {/* Outer glow - orange base, soft edges */}
        <View
          style={[
            styles.flamePart,
            {
              width: flameWidth * 1.2,
              height: flameHeight * 0.95,
              backgroundColor: '#ff6b00',
              opacity: 0.25,
            },
          ]}
        />

        {/* Middle flame - warm amber, medium intensity */}
        <View
          style={[
            styles.flamePart,
            {
              width: flameWidth * 0.8,
              height: flameHeight * 0.8,
              backgroundColor: '#ffaa00',
              opacity: 0.6,
            },
          ]}
        />

        {/* Inner flame core - bright yellow */}
        <View
          style={[
            styles.flamePart,
            {
              width: flameWidth * 0.5,
              height: flameHeight * 0.65,
              backgroundColor: '#ffff00',
              opacity: 0.85,
            },
          ]}
        />

        {/* Brightest tip - pale yellow glow */}
        <View
          style={[
            styles.flamePart,
            {
              width: flameWidth * 0.3,
              height: flameHeight * 0.4,
              backgroundColor: '#ffffcc',
              opacity: 0.9,
            },
          ]}
        />
      </View>

      {/* Candle Body - Warm tan wax */}
      <View
        style={[
          styles.candleBody,
          {
            width: candleWidth,
            height: candleHeight,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  flameContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  flamePart: {
    position: 'absolute',
    borderRadius: 1000, // Rounded teardrop shape
  },

  candleBody: {
    position: 'absolute',
    backgroundColor: '#f5deb3', // Warm tan/wheat color from design system
    borderRadius: 3,
    bottom: 0,
  },

  wick: {
    position: 'absolute',
    backgroundColor: '#333333',
    borderRadius: 1,
  },
});

export default GazeCandleAnimation;
