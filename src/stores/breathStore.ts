/**
 * Mezr App - Breath Store
 * Breathing patterns, session state, and pattern builder using Zustand
 */

import { create } from 'zustand';
import type {
  BreathPattern,
  BreathPhase,
  BreathSubPhase,
  BreathSessionState,
  PatternBuilderFormState,
} from '../types';
import { DEFAULT_PATTERNS, DEFAULT_PATTERN_ID } from '../constants/modules';
import {
  loadBreathPatternsFromStorage,
  saveBreathPatternsToStorage,
} from '../services/storageService';

// ============================================
// DEFAULT FORM STATE
// ============================================

const DEFAULT_FORM_STATE: PatternBuilderFormState = {
  patternName: '',
  inhaleSec: '2.5',
  exhaleSec: '3',
  cycles: '5',
  hold1Sec: '10',
  hold2Sec: '0',
  restSec: '5',
  sessionCount: '3',
};

const DEFAULT_SESSION_STATE: BreathSessionState = {
  phase: 'ready',
  subPhase: '',
  breathCount: 0,
  currentSessionNum: 0,
  timer: 0,
};

// ============================================
// STORE INTERFACE
// ============================================

interface BreathStore {
  // Patterns
  patterns: BreathPattern[];
  selectedPatternId: string;
  
  // Pattern Builder Modal
  editingPattern: BreathPattern | null;
  showPatternBuilder: boolean;
  
  // Delete Confirm Modal
  showDeleteConfirm: boolean;
  patternToDelete: BreathPattern | null;
  
  // Form State
  formState: PatternBuilderFormState;
  
  // Session State
  sessionState: BreathSessionState;
  
  // Pattern Actions
  loadPatterns: () => Promise<void>;
  setSelectedPattern: (id: string) => void;
  
  // Pattern Builder Actions
  openNewPatternBuilder: () => void;
  openEditPatternBuilder: (pattern: BreathPattern) => void;
  closePatternBuilder: () => void;
  updateFormField: <K extends keyof PatternBuilderFormState>(
    field: K,
    value: PatternBuilderFormState[K]
  ) => void;
  savePattern: () => Promise<{ success: boolean; message: string }>;
  
  // Delete Actions
  openDeleteConfirm: (pattern: BreathPattern) => void;
  closeDeleteConfirm: () => void;
  executeDelete: () => Promise<void>;
  
  // Session Actions
  setPhase: (phase: BreathPhase) => void;
  setSubPhase: (subPhase: BreathSubPhase) => void;
  setBreathCount: (count: number) => void;
  setCurrentSessionNum: (num: number) => void;
  setTimer: (timer: number) => void;
  decrementTimer: () => number;
  incrementBreathCount: () => number;
  incrementSessionNum: () => number;
  resetSession: () => void;
  
  // Computed
  getCurrentPattern: () => BreathPattern;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useBreathStore = create<BreathStore>((set, get) => ({
  // Initial State
  patterns: DEFAULT_PATTERNS,
  selectedPatternId: DEFAULT_PATTERN_ID,
  editingPattern: null,
  showPatternBuilder: false,
  showDeleteConfirm: false,
  patternToDelete: null,
  formState: { ...DEFAULT_FORM_STATE },
  sessionState: { ...DEFAULT_SESSION_STATE },
  
  // Pattern Actions
  loadPatterns: async () => {
    const customPatterns = await loadBreathPatternsFromStorage();
    set({ patterns: [...DEFAULT_PATTERNS, ...customPatterns] });
  },
  
  setSelectedPattern: (id) => set({ selectedPatternId: id }),
  
  // Pattern Builder Actions
  openNewPatternBuilder: () => {
    set({
      editingPattern: null,
      formState: { ...DEFAULT_FORM_STATE },
      showPatternBuilder: true,
    });
  },
  
  openEditPatternBuilder: (pattern) => {
    if (pattern.isDefault) {
      return; // Can't edit default patterns
    }
    
    set({
      editingPattern: pattern,
      formState: {
        patternName: pattern.name,
        inhaleSec: (pattern.inhaleDuration / 1000).toString(),
        exhaleSec: (pattern.exhaleDuration / 1000).toString(),
        cycles: pattern.breathCycles.toString(),
        hold1Sec: pattern.hold1Duration.toString(),
        hold2Sec: pattern.hold2Duration.toString(),
        restSec: pattern.restDuration.toString(),
        sessionCount: pattern.sessions.toString(),
      },
      showPatternBuilder: true,
    });
  },
  
  closePatternBuilder: () => {
    set({ showPatternBuilder: false });
  },
  
  updateFormField: (field, value) => {
    set((state) => ({
      formState: { ...state.formState, [field]: value },
    }));
  },
  
  savePattern: async () => {
    const { editingPattern, formState, patterns, selectedPatternId } = get();
    
    if (!formState.patternName.trim()) {
      return { success: false, message: 'Please enter a pattern name' };
    }
    
    const newPattern: BreathPattern = {
      id: editingPattern?.id || `custom-${Date.now()}`,
      name: formState.patternName.trim(),
      inhaleDuration: parseFloat(formState.inhaleSec) * 1000 || 2500,
      exhaleDuration: parseFloat(formState.exhaleSec) * 1000 || 3000,
      breathCycles: parseInt(formState.cycles) || 5,
      hold1Duration: parseInt(formState.hold1Sec) || 0,
      hold2Duration: parseInt(formState.hold2Sec) || 0,
      restDuration: parseInt(formState.restSec) || 0,
      sessions: parseInt(formState.sessionCount) || 3,
      isDefault: false,
    };
    
    let updatedPatterns: BreathPattern[];
    let newSelectedId = selectedPatternId;
    
    if (editingPattern) {
      updatedPatterns = patterns.map((p) =>
        p.id === editingPattern.id ? newPattern : p
      );
    } else {
      updatedPatterns = [...patterns, newPattern];
      newSelectedId = newPattern.id;
    }
    
    await saveBreathPatternsToStorage(updatedPatterns);
    
    set({
      patterns: updatedPatterns,
      selectedPatternId: newSelectedId,
      showPatternBuilder: false,
    });
    
    return {
      success: true,
      message: `Pattern ${editingPattern ? 'updated' : 'created'}! ✓`,
    };
  },
  
  // Delete Actions
  openDeleteConfirm: (pattern) => {
    if (pattern.isDefault) {
      return; // Can't delete default patterns
    }
    set({
      patternToDelete: pattern,
      showDeleteConfirm: true,
    });
  },
  
  closeDeleteConfirm: () => {
    set({
      showDeleteConfirm: false,
      patternToDelete: null,
    });
  },
  
  executeDelete: async () => {
    const { patternToDelete, patterns, selectedPatternId } = get();
    
    if (!patternToDelete) return;
    
    const updatedPatterns = patterns.filter((p) => p.id !== patternToDelete.id);
    await saveBreathPatternsToStorage(updatedPatterns);
    
    // If deleted pattern was selected, switch to basic
    const newSelectedId =
      selectedPatternId === patternToDelete.id
        ? DEFAULT_PATTERN_ID
        : selectedPatternId;
    
    set({
      patterns: updatedPatterns,
      selectedPatternId: newSelectedId,
      showDeleteConfirm: false,
      patternToDelete: null,
    });
  },
  
  // Session Actions
  setPhase: (phase) => {
    set((state) => ({
      sessionState: { ...state.sessionState, phase },
    }));
  },
  
  setSubPhase: (subPhase) => {
    set((state) => ({
      sessionState: { ...state.sessionState, subPhase },
    }));
  },
  
  setBreathCount: (breathCount) => {
    set((state) => ({
      sessionState: { ...state.sessionState, breathCount },
    }));
  },
  
  setCurrentSessionNum: (currentSessionNum) => {
    set((state) => ({
      sessionState: { ...state.sessionState, currentSessionNum },
    }));
  },
  
  setTimer: (timer) => {
    set((state) => ({
      sessionState: { ...state.sessionState, timer },
    }));
  },
  
  decrementTimer: () => {
    const currentTimer = get().sessionState.timer;
    const newTimer = Math.max(0, currentTimer - 1);
    set((state) => ({
      sessionState: { ...state.sessionState, timer: newTimer },
    }));
    return newTimer;
  },
  
  incrementBreathCount: () => {
    const newCount = get().sessionState.breathCount + 1;
    set((state) => ({
      sessionState: { ...state.sessionState, breathCount: newCount },
    }));
    return newCount;
  },
  
  incrementSessionNum: () => {
    const newNum = get().sessionState.currentSessionNum + 1;
    set((state) => ({
      sessionState: { ...state.sessionState, currentSessionNum: newNum },
    }));
    return newNum;
  },
  
  resetSession: () => {
    set({ sessionState: { ...DEFAULT_SESSION_STATE } });
  },
  
  // Computed
  getCurrentPattern: () => {
    const { patterns, selectedPatternId } = get();
    return patterns.find((p) => p.id === selectedPatternId) || patterns[0];
  },
}));

// ============================================
// SELECTORS
// ============================================

export const useCurrentPattern = () => {
  const patterns = useBreathStore((state) => state.patterns);
  const selectedPatternId = useBreathStore((state) => state.selectedPatternId);
  return patterns.find((p) => p.id === selectedPatternId) || patterns[0];
};

export const useSessionState = () => {
  return useBreathStore((state) => state.sessionState);
};

export const useFormState = () => {
  return useBreathStore((state) => state.formState);
};
