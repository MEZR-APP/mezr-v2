/**
 * Gaze Cosmos Animation Component (v2 - Organic)
 * Galaxy background with deep layered parallax stars, natural pulsing, and flowing motion
 * Design principles: Layered motion, asymmetric timing, color shifts, depth, organic feel
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface Star {
  id: number;
  baseX: number;
  baseY: number;
  size: number;
  layer: 'background' | 'mid' | 'foreground';
  // Organic twinkling (not sine wave)
  twinkleCurve1: number; // Slow pulse (3-8s)
  twinkleCurve2: number; // Medium pulse (1-3s)
  twinkleCurve3: number; // Fast micro-twinkle (0.5-1.5s)
  twinklePhase: number;
  // Layered parallax drift
  driftSpeedX: number; // Very slow horizontal drift
  driftSpeedY: number; // Very slow vertical drift
  driftAmplitude: number;
  driftPhase: number;
  // Color and brightness
  color: string;
  colorVariation: number; // Slight color shift range
  baseBrightness: number; // Natural brightness variance
}

interface GazeCosmosAnimationProps {
  isActive: boolean;
  size: number;
}

const GazeCosmosAnimation: React.FC<GazeCosmosAnimationProps> = ({ isActive, size }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Initialize stars with organic parameters
  useEffect(() => {
    const newStars: Star[] = [];

    // BACKGROUND LAYER: Distant, slow, dim (35 stars)
    for (let i = 0; i < 35; i++) {
      newStars.push({
        id: i,
        baseX: Math.random() * size,
        baseY: Math.random() * size,
        size: Math.random() * 1 + 0.3, // 0.3-1.3px
        layer: 'background',
        twinkleCurve1: Math.random() * 4000 + 5000, // 5-9s
        twinkleCurve2: Math.random() * 1500 + 1200, // 1.2-2.7s
        twinkleCurve3: Math.random() * 800 + 500, // 0.5-1.3s
        twinklePhase: Math.random() * 8000,
        driftSpeedX: Math.random() * 0.5 + 0.2, // 0.2-0.7 (very slow)
        driftSpeedY: Math.random() * 0.3 + 0.1, // 0.1-0.4 (slower vertical)
        driftAmplitude: Math.random() * 8 + 3, // 3-11px
        driftPhase: Math.random() * 360,
        color: '#6B8DFF', // Deep blue
        colorVariation: 0.8,
        baseBrightness: Math.random() * 0.3 + 0.3, // 0.3-0.6
      });
    }

    // MID LAYER: Medium depth, medium speed, visible (40 stars)
    for (let i = 0; i < 40; i++) {
      newStars.push({
        id: 35 + i,
        baseX: Math.random() * size,
        baseY: Math.random() * size,
        size: Math.random() * 1.5 + 0.8, // 0.8-2.3px
        layer: 'mid',
        twinkleCurve1: Math.random() * 2000 + 2000, // 2-4s
        twinkleCurve2: Math.random() * 1000 + 800, // 0.8-1.8s
        twinkleCurve3: Math.random() * 600 + 300, // 0.3-0.9s
        twinklePhase: Math.random() * 4000,
        driftSpeedX: Math.random() * 1 + 0.5, // 0.5-1.5 (medium)
        driftSpeedY: Math.random() * 0.6 + 0.3, // 0.3-0.9
        driftAmplitude: Math.random() * 12 + 6, // 6-18px
        driftPhase: Math.random() * 360,
        color: '#D8E3FF', // Light blue-white
        colorVariation: 1.2,
        baseBrightness: Math.random() * 0.4 + 0.5, // 0.5-0.9
      });
    }

    // FOREGROUND LAYER: Near, fast, bright (25 stars)
    for (let i = 0; i < 25; i++) {
      newStars.push({
        id: 75 + i,
        baseX: Math.random() * size,
        baseY: Math.random() * size,
        size: Math.random() * 2 + 1, // 1-3px
        layer: 'foreground',
        twinkleCurve1: Math.random() * 1200 + 1000, // 1-2.2s
        twinkleCurve2: Math.random() * 800 + 400, // 0.4-1.2s
        twinkleCurve3: Math.random() * 400 + 150, // 0.15-0.55s
        twinklePhase: Math.random() * 2200,
        driftSpeedX: Math.random() * 2 + 1, // 1-3 (fast)
        driftSpeedY: Math.random() * 1.2 + 0.6, // 0.6-1.8
        driftAmplitude: Math.random() * 18 + 10, // 10-28px
        driftPhase: Math.random() * 360,
        color: '#FFFFFF', // Pure white
        colorVariation: 1.5,
        baseBrightness: Math.random() * 0.3 + 0.8, // 0.8-1.0
      });
    }

    setStars(newStars);
  }, [size]);

  // Animation timer - run when active
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setElapsedMs((prev) => prev + 50); // Update every 50ms (20 FPS for smoothness)
    }, 50);

    return () => clearInterval(timer);
  }, [isActive]);

  // Organic non-linear tween function (ease-in-out with overshoot)
  const easeInOutElastic = (t: number): number => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((t * 10 - 10.75) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((t * 10 - 10.75) * c5)) / 2 + 1;
  };

  // Calculate star appearance with organic multi-curve animation
  const getStarStyle = (star: Star) => {
    const timeS = elapsedMs / 1000; // Time in seconds

    // THREE-LAYER PULSING (all three curves affect opacity)
    const pulse1 = Math.sin((timeS * 1000) / star.twinkleCurve1) * 0.5 + 0.5; // Slow fundamental
    const pulse2 = Math.sin((timeS * 1000) / star.twinkleCurve2) * 0.3 + 0.35; // Medium overtone
    const pulse3 = Math.sin((timeS * 1000) / star.twinkleCurve3) * 0.15 + 0.425; // Fast micro-twinkle

    // Combine with easing for organic feel (not just linear sine)
    const eased1 = easeInOutElastic(pulse1);
    const eased2 = pulse2; // Keep overtone as-is
    const eased3 = pulse3;

    // Layer-based modulation
    let opacity = 0;
    if (star.layer === 'background') {
      opacity = (eased1 * 0.3 + eased2 * 0.15 + eased3 * 0.05) * star.baseBrightness;
    } else if (star.layer === 'mid') {
      opacity = (eased1 * 0.5 + eased2 * 0.25 + eased3 * 0.1) * star.baseBrightness;
    } else {
      opacity = (eased1 * 0.7 + eased2 * 0.4 + eased3 * 0.2) * star.baseBrightness;
    }

    opacity = Math.max(0.05, Math.min(1, opacity)); // Clamp 0.05-1.0 (never fully off)

    // PARALLAX DRIFT: Different speeds per layer
    const speedMultiplier = star.layer === 'background' ? 0.3 : star.layer === 'mid' ? 0.7 : 1;
    const driftX =
      Math.sin(timeS * (star.driftSpeedX * speedMultiplier) + star.driftPhase * (Math.PI / 180)) *
      star.driftAmplitude;
    const driftY =
      Math.cos(timeS * (star.driftSpeedY * speedMultiplier) + star.driftPhase * (Math.PI / 180)) *
      star.driftAmplitude *
      0.6;

    // ORGANIC COLOR SHIFT: Stars shift color based on brightness
    const colorShift = (eased1 - 0.5) * star.colorVariation;
    const baseColor = star.color;
    // Shift towards warmer when bright, cooler when dim
    const shiftedColor = colorShift > 0 ? '#FFFFFF' : baseColor;

    // GLOW EFFECT: Brighter stars have larger blur
    const glowRadius = Math.max(0, opacity * star.size * 1.5);

    return {
      position: 'absolute' as const,
      left: star.baseX + driftX,
      top: star.baseY + driftY,
      width: star.size,
      height: star.size,
      borderRadius: star.size / 2,
      backgroundColor: shiftedColor,
      opacity: opacity,
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: opacity * 0.8,
      shadowRadius: glowRadius,
      // Add scale variation for depth (stars get slightly bigger when bright)
      transform: [{ scale: 0.8 + opacity * 0.4 }],
    };
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Galaxy background image */}
      <Image
        source={require('../../../../assets/images/cosmos-galaxy.jpg')}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Gradient overlay (center bright, edges dark) */}
      <View style={styles.gradientOverlay} />

      {/* Animated star field - 100 stars total */}
      {stars.map((star) => (
        <View key={star.id} style={getStarStyle(star)} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    backgroundColor: '#000000',
    opacity: 0.15, // Subtle darkening for better star visibility
  },
});

export default GazeCosmosAnimation;
