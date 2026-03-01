/**
 * Mezr App - Audio Service
 * Sound playback using Expo AV with preloaded local assets
 */

import { Audio, AVPlaybackSource } from 'expo-av';
import type { SoundConfig } from '../types';

// ============================================
// TYPES
// ============================================

export type BreathSoundName = 'inhale' | 'exhale';

// ============================================
// LOCAL SOUND ASSETS
// ============================================

const soundFiles: Record<BreathSoundName, AVPlaybackSource> = {
  inhale: require('../assets/sounds/inhale.mp3'),
  exhale: require('../assets/sounds/exhale.mp3'),
};

const soundVolumes: Record<BreathSoundName, number> = {
  inhale: 0.7,
  exhale: 0.7,
};

const preloadedSounds: Partial<Record<BreathSoundName, Audio.Sound>> = {};

// ============================================
// AUDIO CONFIGURATION
// ============================================

/**
 * Initialize audio mode for the app.
 * Call this once when the app starts.
 */
export const initializeAudio = async (): Promise<void> => {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
    });
  } catch (error) {
    console.log('Audio init error:', error);
  }
};

/**
 * Preload all local sound files into memory for instant playback.
 * Call after initializeAudio().
 */
export const preloadSounds = async (): Promise<void> => {
  for (const [name, source] of Object.entries(soundFiles)) {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        volume: soundVolumes[name as BreathSoundName] ?? 0.6,
      });
      preloadedSounds[name as BreathSoundName] = sound;
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }
};

/**
 * Unload all preloaded sounds (call on cleanup).
 */
export const unloadSounds = async (): Promise<void> => {
  for (const [name, sound] of Object.entries(preloadedSounds)) {
    try {
      await sound?.unloadAsync();
      delete preloadedSounds[name as BreathSoundName];
    } catch {
      // Ignore unload errors
    }
  }
};

// ============================================
// PRELOADED SOUND PLAYBACK (local assets)
// ============================================

/**
 * Play a preloaded breathing sound by name.
 * Falls back silently if the sound isn't loaded.
 */
export const playPreloadedSound = async (
  name: BreathSoundName,
  isMuted: boolean = false
): Promise<void> => {
  if (isMuted) return;

  const sound = preloadedSounds[name];
  if (!sound) return;

  try {
    await sound.setVolumeAsync(soundVolumes[name]);
    await sound.replayAsync();
  } catch (error) {
    console.log(`Sound playback error (${name}):`, error);
  }
};

// ============================================
// URL-BASED SOUND PLAYBACK (remote assets)
// ============================================

/**
 * Play a sound from a remote URL with the given configuration.
 * Used by non-breathing modules (swim, run, cycle, meditate).
 */
export const playSound = async (
  soundConfig: SoundConfig | undefined,
  isMuted: boolean = false
): Promise<Audio.Sound | null> => {
  if (isMuted || !soundConfig) {
    return null;
  }

  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: soundConfig.url },
      {
        shouldPlay: true,
        volume: 0.6,
        rate: soundConfig.pitch || 1.0,
        shouldCorrectPitch: true,
      }
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });

    return sound;
  } catch (error) {
    console.log('Sound error:', error);
    return null;
  }
};

// ============================================
// SOUND HELPERS
// ============================================

export const createPlaySoundCallback = (isMuted: boolean) => {
  return async (soundConfig: SoundConfig | undefined): Promise<void> => {
    await playSound(soundConfig, isMuted);
  };
};

export const stopSound = async (sound: Audio.Sound | null): Promise<void> => {
  if (!sound) return;

  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch (error) {
    console.log('Stop sound error:', error);
  }
};

export const pauseSound = async (sound: Audio.Sound | null): Promise<void> => {
  if (!sound) return;

  try {
    await sound.pauseAsync();
  } catch (error) {
    console.log('Pause sound error:', error);
  }
};

export const resumeSound = async (sound: Audio.Sound | null): Promise<void> => {
  if (!sound) return;

  try {
    await sound.playAsync();
  } catch (error) {
    console.log('Resume sound error:', error);
  }
};
