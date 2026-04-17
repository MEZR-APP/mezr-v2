/**
 * Mezr App - TypeScript Type Definitions
 */

// ============================================
// CATEGORY & MODULE TYPES
// ============================================

export interface Category {
  id: string;
  label: string;
  emoji: string;
}

export interface Module {
  id: ModuleId;
  label: string;
  category: string;
}

export type ModuleId = 'breath' | 'swim' | 'run' | 'cycle' | 'meditate';

export type CategoryId = 'health' | 'wellness' | 'productivity' | 'finance';

// ============================================
// BREATHING PATTERN TYPES
// ============================================

export interface BreathPattern {
  id: string;
  name: string;
  inhaleDuration: number;    // milliseconds
  exhaleDuration: number;    // milliseconds
  breathCycles: number;      // number of inhale/exhale cycles
  hold1Duration: number;     // seconds - hold after cycles
  hold2Duration: number;     // seconds - hold after inhale
  restDuration: number;      // seconds - rest between sessions
  sessions: number;          // number of sessions
  isDefault: boolean;
}

export interface PatternBuilderFormState {
  patternName: string;
  inhaleSec: string;
  exhaleSec: string;
  cycles: string;
  hold1Sec: string;
  hold2Sec: string;
  restSec: string;
  sessionCount: string;
}

export type BreathPhase = 'ready' | 'inhale' | 'exhale' | 'hold' | 'rest' | 'complete';

export type BreathSubPhase = '' | 'cycles' | 'hold1' | 'singleInhale' | 'hold2' | 'singleExhale' | 'rest';

export interface BreathSessionState {
  phase: BreathPhase;
  subPhase: BreathSubPhase;
  breathCount: number;
  currentSessionNum: number;
  timer: number;
}

// ============================================
// AUDIO TYPES
// ============================================

export interface SoundConfig {
  url: string;
  pitch: number;
}

export interface BreathSounds {
  inhale: SoundConfig;
  exhale: SoundConfig;
  hold: SoundConfig;
  rest: SoundConfig;
}

export interface SwimSounds {
  stroke: SoundConfig;
}

export interface MeditateSounds {
  bell: SoundConfig;
}

export interface RunSounds {
  footstep: SoundConfig;
}

export interface CycleSounds {
  pedal: SoundConfig;
}

export interface ModuleSounds {
  breath: BreathSounds;
  swim: SwimSounds;
  meditate: MeditateSounds;
  run: RunSounds;
  cycle: CycleSounds;
}

// ============================================
// ACTIVITY & HISTORY TYPES
// ============================================

export interface BaseActivityEntry {
  type: ModuleId;
  date: string; // ISO string
}

export interface BreathActivityEntry extends BaseActivityEntry {
  type: 'breath';
  pattern: string;
}

export interface SwimActivityEntry extends BaseActivityEntry {
  type: 'swim';
  distance?: number;
  time?: number;
  laps?: number;
  manual?: boolean;
}

export interface MeditateActivityEntry extends BaseActivityEntry {
  type: 'meditate';
}

export interface RunActivityEntry extends BaseActivityEntry {
  type: 'run';
  distance?: number;
  duration?: number;
}

export interface CycleActivityEntry extends BaseActivityEntry {
  type: 'cycle';
  distance?: number;
  duration?: number;
}

export type ActivityEntry =
  | BreathActivityEntry
  | SwimActivityEntry
  | MeditateActivityEntry
  | RunActivityEntry
  | CycleActivityEntry;

// ============================================
// STATS / HABIT STACK TYPES
// ============================================

export interface DayModules {
  dateKey: string; // YYYY-MM-DD
  modules: ModuleId[];
  count: number;
}

export interface SynergyScoreResult {
  score: number;
  maxScore: number;
  daysWithAny: number;
  daysWith2Plus: number;
  daysWith3Plus: number;
  daysWithAll4: number;
  bestDays: { dateKey: string; label: string; moduleCount: number; stars: number }[];
}

export interface HabitStackBlock {
  module: ModuleId;
  label: string;
  count: number;
  color: string;
}

export interface ModuleDetailResult {
  totalSessions: number;
  totalDurationSec: number;
  streak: number;
  last30Days: { dateKey: string; count: number }[];
  bestHour: number; // 0-23
  bestDayOfWeek: number; // 0=Sun, 1=Mon, ...
}

// ============================================
// STORE STATE TYPES
// ============================================

export interface ToastState {
  show: boolean;
  message: string;
}

export interface AppState {
  // Navigation
  currentCategory: CategoryId;
  currentModule: ModuleId;
  
  // UI State
  showSettings: boolean;
  showModulePicker: boolean;
  isMuted: boolean;
  isActive: boolean;
  
  // Toast
  toast: ToastState;
}

export interface BreathStoreState {
  // Patterns
  patterns: BreathPattern[];
  selectedPatternId: string;
  
  // Pattern Builder
  editingPattern: BreathPattern | null;
  showPatternBuilder: boolean;
  showDeleteConfirm: boolean;
  patternToDelete: BreathPattern | null;
  formState: PatternBuilderFormState;
  
  // Session State
  sessionState: BreathSessionState;
}

export interface SwimStoreState {
  laps: number;
  swimTime: number;
  targetLaps: string;
  manualDistance: string;
  manualTime: string;
  manualLaps: string;
}

export interface MeditateStoreState {
  medTime: number;
  medInput: string;
}

export interface RunStoreState {
  targetDistance: string;
  targetDuration: string;
}

export interface CycleStoreState {
  cycleDistance: string;
  cycleDuration: string;
}

export interface ActivityStoreState {
  history: ActivityEntry[];
}

// ============================================
// COMPONENT PROP TYPES
// ============================================

export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: object;
}

export interface ModalWrapperProps {
  visible: boolean;
  onClose: () => void;
  animationType?: 'none' | 'slide' | 'fade';
  children: React.ReactNode;
}

export interface ToastProps {
  visible: boolean;
  message: string;
}
