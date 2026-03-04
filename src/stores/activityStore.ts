/**
 * Mezr App - Activity Store
 * Activity history and logging using Zustand
 * PR-007: Default local (AsyncStorage), cloud sync opt-in only
 */

import { create } from 'zustand';
import { addDoc, collection } from 'firebase/firestore';
import type { ActivityEntry, ModuleId } from '../types';
import {
  loadHistoryFromStorage,
  saveHistoryToStorage,
} from '../services/storageService';
import { db } from '../services/firebase';
import { useAppStore } from './appStore';
import { useAuthStore } from './authStore';
import useTimelineStore from './timelineStore';

// ============================================
// STORE INTERFACE
// ============================================

interface ActivityStore {
  // State
  history: ActivityEntry[];
  
  // Actions
  loadHistory: () => Promise<void>;
  logActivity: (type: ModuleId, metadata?: Record<string, unknown>) => Promise<void>;
  clearHistory: () => Promise<void>;
  /** PR-007/PR-021: Sync existing local history to Firestore when user enables cloud backup */
  syncExistingHistoryToCloud: () => Promise<void>;
  
  // Stats
  getStats: () => {
    breath: number;
    swim: number;
    meditate: number;
    run: number;
    cycle: number;
  };
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useActivityStore = create<ActivityStore>((set, get) => ({
  // Initial State
  history: [],
  
  // Actions
  loadHistory: async () => {
    const history = await loadHistoryFromStorage();
    set({ history });
  },
  
  logActivity: async (type, metadata = {}) => {
    const { history } = get();
    
    const newEntry = {
      type,
      date: new Date().toISOString(),
      ...metadata,
    } as ActivityEntry;
    
    const updatedHistory = [...history, newEntry];
    
    set({ history: updatedHistory });
    await saveHistoryToStorage(updatedHistory);

    // PR-007: Sync to Firestore only when user opted in
    const cloudBackupEnabled = useAppStore.getState().cloudBackupEnabled;
    const user = useAuthStore.getState().user;
    if (cloudBackupEnabled && user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'activity'), newEntry);
      } catch (err) {
        console.error('Cloud sync error:', err);
      }
    }

    /** D008: Auto-log completed session to the timeline. Fire-and-forget so
     *  a timeline failure never breaks the core activity logging flow. */
    try {
      useTimelineStore.getState().autoLogActivity(newEntry).catch(() => {});
    } catch {
      // Timeline integration failure is silently ignored
    }
  },
  
  clearHistory: async () => {
    set({ history: [] });
    await saveHistoryToStorage([]);
  },

  syncExistingHistoryToCloud: async () => {
    const { history } = get();
    const user = useAuthStore.getState().user;
    if (!user || history.length === 0) return;
    const activityRef = collection(db, 'users', user.uid, 'activity');
    for (const entry of history) {
      try {
        await addDoc(activityRef, entry);
      } catch (err) {
        console.error('Cloud sync existing error:', err);
      }
    }
  },
  
  // Stats
  getStats: () => {
    const { history } = get();
    
    return {
      breath: history.filter((i) => i.type === 'breath').length,
      swim: history.filter((i) => i.type === 'swim').length,
      meditate: history.filter((i) => i.type === 'meditate').length,
      run: history.filter((i) => i.type === 'run').length,
      cycle: history.filter((i) => i.type === 'cycle').length,
    };
  },
}));

// ============================================
// SELECTORS
// ============================================

export const useActivityStats = () => {
  const history = useActivityStore((state) => state.history);
  
  return {
    breath: history.filter((i) => i.type === 'breath').length,
    swim: history.filter((i) => i.type === 'swim').length,
    meditate: history.filter((i) => i.type === 'meditate').length,
    run: history.filter((i) => i.type === 'run').length,
    cycle: history.filter((i) => i.type === 'cycle').length,
  };
};

export const useRecentActivities = (limit: number = 10) => {
  const history = useActivityStore((state) => state.history);
  return [...history].reverse().slice(0, limit);
};

export const useActivitiesByType = (type: ModuleId) => {
  const history = useActivityStore((state) => state.history);
  return history.filter((i) => i.type === type);
};
