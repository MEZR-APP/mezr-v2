/**
 * GazeModule Component (v6 - Scalable Visual Architecture)
 * Dynamic visual loading (candle, cosmos, and future visuals)
 * Audio effect system (crackling, ambient, silence)
 * Breathing guide below visual
 * Start button visible initially, Pause/End buttons visible when active
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import GazeBreathingGuide from './GazeBreathingGuide';
import { getVisualComponent } from './visuals';
import { useGazeSession } from '../../hooks/useGazeSession';
import { useAppStore } from '../../stores/appStore';
import { useGazeStore } from '../../stores/gazeStore';
import { playPreloadedSound } from '../../services/audioService';

interface GazeModuleProps {
  gazeMinutes?: number;
  onClose?: () => void;
}

const GazeModule: React.FC<GazeModuleProps> = ({ gazeMinutes = 5, onClose }) => {
  const appIsActive = useAppStore((state) => state.isActive);
  const setAppIsActive = useAppStore((state) => state.setIsActive);
  const isMuted = useAppStore((state) => state.isMuted);
  const logActivity = useAppStore((state) => state.logActivity) || (() => {});

  const { startSession, pauseSession, resumeSession, endSession, elapsedMs, remainingMs } =
    useGazeSession();

  const isActive = useGazeStore((state) => state.isActive);
  const isPaused = useGazeStore((state) => state.isPaused);
  const currentSession = useGazeStore((state) => state.currentSession);

  const [lastAudioMs, setLastAudioMs] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Sync MainScreen's appIsActive with Gaze session
  // Centralizes session state management based on session status
  useEffect(() => {
    if (appIsActive && (sessionCompleted || !currentSession)) {
      // User clicked START: either no session yet OR a session was just completed
      setSessionCompleted(false); // Reset flag for next session
      startSession(gazeMinutes * 60 * 1000);
    } else if (!appIsActive && currentSession?.status === 'active') {
      // User clicked PAUSE: session is currently active
      pauseSession();
    } else if (appIsActive && currentSession?.status === 'paused') {
      // User clicked RESUME: session is paused, user wants to continue
      resumeSession();
    }
  }, [appIsActive, currentSession?.status, sessionCompleted, gazeMinutes, startSession, pauseSession, resumeSession]);

  // Audio sync
  useEffect(() => {
    if (!isActive || isPaused) return;

    const CYCLE_DURATION = 4000 + 4000;
    const cyclePosition = elapsedMs % CYCLE_DURATION;
    const phase = cyclePosition < 4000 ? 'inhale' : 'exhale';
    setCurrentPhase(phase);

    const phaseChangeThreshold = 100;
    if (Math.abs(cyclePosition) < phaseChangeThreshold || Math.abs(cyclePosition - 4000) < phaseChangeThreshold) {
      if (Math.abs(elapsedMs - lastAudioMs) > 500) {
        playPreloadedSound(phase === 'inhale' ? 'inhale' : 'exhale', isMuted);
        setLastAudioMs(elapsedMs);
      }
    }
  }, [elapsedMs, isActive, isPaused, lastAudioMs, isMuted]);

  // Track when session is completed (either auto or manual)
  useEffect(() => {
    if (currentSession?.status === 'completed' && !sessionCompleted) {
      setSessionCompleted(true);
    }
  }, [currentSession?.status, sessionCompleted]);

  // When session auto-ends (timer runs out), sync app state
  // This handles the case where the hook's timer ends the session automatically
  useEffect(() => {
    if (!isActive && appIsActive && currentSession?.status === 'completed') {
      // Session has auto-ended, clear app state to prevent restart
      setAppIsActive(false);
      if (currentSession) {
        logActivity('gaze', {
          duration: currentSession.duration / 60000, // Convert ms to minutes
          targetDuration: currentSession.targetDuration / 60000, // Convert ms to minutes
        });
      }
    }
  }, [isActive, currentSession?.status, appIsActive, setAppIsActive, logActivity]);

  const handleStart = () => {
    setAppIsActive(true);
  };

  const handlePause = () => {
    // Sync effect will call pauseSession when it detects this state change
    setAppIsActive(false);
  };

  const handleEnd = () => {
    // END directly calls endSession to complete the session
    endSession();
    setAppIsActive(false);
    if (currentSession) {
      logActivity('gaze', {
        duration: currentSession.duration / 60000, // Convert ms to minutes
        targetDuration: currentSession.targetDuration / 60000, // Convert ms to minutes
      });
    }
  };

  const handleResume = () => {
    // Sync effect will call resumeSession when it detects this state change
    setAppIsActive(true);
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get current visual settings
  const visualId = useGazeStore((state) => state.settings.visualId);
  const VisualComponent = getVisualComponent(visualId);

  return (
    <View style={styles.container}>
      {/* Visual Section: Dynamic rendering based on user selection */}
      <View style={styles.visualSection}>
        {VisualComponent ? (
          <VisualComponent isActive={isActive && !isPaused} size={320} />
        ) : null}
      </View>

      {/* Breathing Guide: Below candle (only when actively running) */}
      {isActive && !isPaused && (
        <View style={styles.breathingSection}>
          <GazeBreathingGuide isActive={true} elapsedMs={elapsedMs} />
        </View>
      )}

      {/* Spacer for layout balance */}
      <View style={styles.spacer} />

      {/* Timer: Above buttons (when session exists) */}
      {currentSession && (
        <View style={styles.timerSection}>
          <Text style={styles.timerText}>{formatTime(remainingMs)}</Text>
        </View>
      )}

      {/* Control Buttons Section */}
      <View style={styles.buttonSection}>
        {!currentSession || currentSession.status === 'completed' ? (
          // START button (visible when no session or session is completed)
          <Pressable style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>START</Text>
          </Pressable>
        ) : (
          // PAUSE/RESUME and END buttons (visible when session exists)
          <View style={styles.controlRow}>
            <Pressable
              style={styles.controlButton}
              onPress={isPaused ? handleResume : handlePause}
            >
              <Text style={styles.controlButtonText}>
                {isPaused ? 'RESUME' : 'PAUSE'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.controlButton, styles.controlButtonDanger]}
              onPress={handleEnd}
            >
              <Text style={[styles.controlButtonText, styles.controlButtonDangerText]}>
                END
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },

  // Visual section positioned above center line, below SOUND button
  visualSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '35%',
    paddingTop: 30,
  },

  // Breathing guide below candle (only when running)
  breathingSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    minHeight: 50,
    marginTop: 40,
  },

  // Spacer to push buttons down (reduced flex to bring breathing guide closer to buttons)
  spacer: {
    flex: 0.3,
  },

  // Timer above buttons (same style as breathing guide)
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginBottom: 15,
  },

  timerText: {
    fontSize: 22,
    fontWeight: '200',
    color: colors.textDark,
    fontVariant: ['tabular-nums'],
    letterSpacing: 8,
    textAlign: 'center',
  },

  // Button section at bottom (above tab bar which is 92px tall: 64px + 28px padding)
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 110,
    marginBottom: 0,
  },

  // START button
  startButton: {
    paddingHorizontal: 80,
    paddingVertical: 18,
    borderRadius: 50,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 240,
  },

  startButtonText: {
    color: colors.buttonPrimaryText,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },

  // Control buttons (PAUSE/RESUME + END)
  controlRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    width: '100%',
  },

  controlButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },

  controlButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  controlButtonDanger: {
    backgroundColor: '#3a2a2a',
    borderColor: '#cc5555',
  },

  controlButtonDangerText: {
    color: '#ff6b6b',
  },
});

export default GazeModule;
