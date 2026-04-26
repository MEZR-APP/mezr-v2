/**
 * Mezr App - Breathing Session Hook
 * Complex state machine for breathing exercises
 */

import { useEffect, useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { useBreathStore, useCurrentPattern } from '../stores/breathStore';
import { useActivityStore } from '../stores/activityStore';
import { playPreloadedSound } from '../services/audioService';
import type { BreathSoundName } from '../services/audioService';

export const useBreathingSession = () => {
  const mainAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<number>(0);
  
  // App Store
  const currentModule = useAppStore((state) => state.currentModule);
  const isActive = useAppStore((state) => state.isActive);
  const isMuted = useAppStore((state) => state.isMuted);
  const setIsActive = useAppStore((state) => state.setIsActive);
  const showToast = useAppStore((state) => state.showToast);
  
  // Breath Store
  const sessionState = useBreathStore((state) => state.sessionState);
  const setPhase = useBreathStore((state) => state.setPhase);
  const setSubPhase = useBreathStore((state) => state.setSubPhase);
  const setBreathCount = useBreathStore((state) => state.setBreathCount);
  const setCurrentSessionNum = useBreathStore((state) => state.setCurrentSessionNum);
  const setTimer = useBreathStore((state) => state.setTimer);
  const resetSession = useBreathStore((state) => state.resetSession);
  
  // Activity Store
  const logActivity = useActivityStore((state) => state.logActivity);
  
  // Current Pattern
  const pattern = useCurrentPattern();
  
  const { phase, subPhase, breathCount, currentSessionNum, timer } = sessionState;
  
  // Keep timerRef in sync with store timer
  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);

  // Reset animation and timerRef when session stops
  useEffect(() => {
    if (!isActive) {
      mainAnim.setValue(1);
      timerRef.current = 0;
    }
  }, [isActive, mainAnim]);
  
  // Play sound helper
  const playSoundIfNotMuted = useCallback(
    (name: BreathSoundName) => {
      playPreloadedSound(name, isMuted);
    },
    [isMuted]
  );
  
  // Complete a session (move to next or finish)
  const completeSession = useCallback(() => {
    const nextSession = currentSessionNum + 1;
    
    if (nextSession >= pattern.sessions) {
      // All sessions complete
      setPhase('complete');
      setIsActive(false);
      logActivity('breath', { pattern: pattern.name });
      showToast(`${pattern.name} complete! 💨`);
    } else {
      // Move to next session
      setCurrentSessionNum(nextSession);
      
      if (pattern.restDuration > 0) {
        setSubPhase('rest');
        setPhase('rest');
        timerRef.current = pattern.restDuration;
        setTimer(pattern.restDuration);
      } else {
        setSubPhase('cycles');
        setPhase('inhale');
        setBreathCount(0);
      }
    }
  }, [
    currentSessionNum,
    pattern,
    setPhase,
    setIsActive,
    logActivity,
    playSoundIfNotMuted,
    showToast,
    setCurrentSessionNum,
    setSubPhase,
    setTimer,
    setBreathCount,
  ]);
  
  // Main breathing effect
  useEffect(() => {
    if (currentModule !== 'breath' || !isActive || !pattern) return;
    
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;
    
    // Start the session
    if (phase === 'ready') {
      setSubPhase('cycles');
      setPhase('inhale');
    }
    
    // CYCLES subphase: inhale/exhale cycles
    if (subPhase === 'cycles') {
      if (phase === 'inhale') {
        playSoundIfNotMuted('inhale');
        Animated.timing(mainAnim, {
          toValue: 1.6,
          duration: pattern.inhaleDuration,
          useNativeDriver: true,
        }).start();
        
        timeout = setTimeout(() => setPhase('exhale'), pattern.inhaleDuration);
      } else if (phase === 'exhale') {
        playSoundIfNotMuted('exhale');
        Animated.timing(mainAnim, {
          toValue: 1,
          duration: pattern.exhaleDuration,
          useNativeDriver: true,
        }).start();
        
        timeout = setTimeout(() => {
          const nextBreath = breathCount + 1;
          
          if (nextBreath >= pattern.breathCycles) {
            // Cycles complete, check for holds
            if (pattern.hold1Duration > 0) {
              setSubPhase('hold1');
              setPhase('hold');
              timerRef.current = pattern.hold1Duration;
              setTimer(pattern.hold1Duration);
            } else if (pattern.hold2Duration > 0) {
              setSubPhase('singleInhale');
              setPhase('inhale');
            } else {
              completeSession();
            }
            setBreathCount(0);
          } else {
            setBreathCount(nextBreath);
            setPhase('inhale');
          }
        }, pattern.exhaleDuration);
      }
    }
    
    // HOLD1 subphase: hold after cycles
    else if (subPhase === 'hold1' && phase === 'hold') {
      interval = setInterval(() => {
        timerRef.current -= 1;
        if (timerRef.current <= 0) {
          clearInterval(interval);
          setTimer(0);
          if (pattern.hold2Duration > 0) {
            setSubPhase('singleInhale');
            setPhase('inhale');
          } else {
            completeSession();
          }
        } else {
          setTimer(timerRef.current);
        }
      }, 1000);
    }
    
    // SINGLE INHALE subphase: one inhale before hold2
    else if (subPhase === 'singleInhale' && phase === 'inhale') {
      playSoundIfNotMuted('inhale');
      Animated.timing(mainAnim, {
        toValue: 1.6,
        duration: pattern.inhaleDuration,
        useNativeDriver: true,
      }).start();
      
      timeout = setTimeout(() => {
        setSubPhase('hold2');
        setPhase('hold');
        timerRef.current = pattern.hold2Duration;
        setTimer(pattern.hold2Duration);
      }, pattern.inhaleDuration);
    }
    
    // HOLD2 subphase: hold after single inhale
    else if (subPhase === 'hold2' && phase === 'hold') {
      interval = setInterval(() => {
        timerRef.current -= 1;
        if (timerRef.current <= 0) {
          clearInterval(interval);
          setTimer(0);
          setSubPhase('singleExhale');
          setPhase('exhale');
        } else {
          setTimer(timerRef.current);
        }
      }, 1000);
    }
    
    // SINGLE EXHALE subphase: final exhale
    else if (subPhase === 'singleExhale' && phase === 'exhale') {
      playSoundIfNotMuted('exhale');
      Animated.timing(mainAnim, {
        toValue: 1,
        duration: pattern.exhaleDuration,
        useNativeDriver: true,
      }).start();
      
      timeout = setTimeout(() => {
        completeSession();
      }, pattern.exhaleDuration);
    }
    
    // REST subphase: rest between sessions
    else if (subPhase === 'rest' && phase === 'rest') {
      interval = setInterval(() => {
        timerRef.current -= 1;
        if (timerRef.current <= 0) {
          clearInterval(interval);
          setTimer(0);
          setSubPhase('cycles');
          setPhase('inhale');
          setBreathCount(0);
        } else {
          setTimer(timerRef.current);
        }
      }, 1000);
    }
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [
    isActive,
    phase,
    subPhase,
    currentModule,
    breathCount,
    currentSessionNum,
    pattern,
    mainAnim,
    playSoundIfNotMuted,
    setPhase,
    setSubPhase,
    setBreathCount,
    setTimer,
    completeSession,
  ]);
  
  // Reset function
  const reset = useCallback(() => {
    resetSession();
    mainAnim.setValue(1);
    timerRef.current = 0;
    setIsActive(false);
  }, [resetSession, mainAnim, setIsActive]);
  
  // Get phase display text
  const getPhaseDisplay = useCallback((): string => {
    if (subPhase === 'hold1' || subPhase === 'hold2') return `HOLD ${timer}`;
    if (subPhase === 'rest') return `REST ${timer}`;
    if (subPhase === 'singleInhale') return 'INHALE';
    if (subPhase === 'singleExhale') return 'EXHALE';
    return phase.toUpperCase();
  }, [subPhase, timer, phase]);
  
  // Get progress display text
  const getProgressDisplay = useCallback((): string => {
    if (subPhase === 'cycles') {
      return `BREATH ${breathCount + 1}/${pattern.breathCycles} • SESSION ${currentSessionNum + 1}/${pattern.sessions}`;
    }
    return `SESSION ${currentSessionNum + 1}/${pattern.sessions}`;
  }, [subPhase, breathCount, currentSessionNum, pattern]);
  
  return {
    mainAnim,
    phase,
    subPhase,
    breathCount,
    currentSessionNum,
    timer,
    pattern,
    reset,
    getPhaseDisplay,
    getProgressDisplay,
  };
};
