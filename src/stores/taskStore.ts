/**
 * Mezr App - Task Store
 * Zustand store for quick-entry task tracking + timeline data
 * Persists to AsyncStorage. On-device only.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Vibration } from 'react-native';
import type { TaskEntry, SavedTask } from '../types/task';
import { getTaskColor } from '../types/task';

const TASKS_KEY = '@mezr_tasks_v1';
const SAVED_TASKS_KEY = '@mezr_saved_tasks_v1';
const MAX_SAVED_TASKS = 20;

// ============================================
// HELPER UTILS
// ============================================

const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const todayKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getDateKey = (isoString: string): string => isoString.slice(0, 10);

/** Net elapsed ms (excludes paused time) */
export const getElapsedMs = (task: TaskEntry): number => {
  const end = task.endTime ? new Date(task.endTime).getTime() : Date.now();
  const pausedExtra =
    task.status === 'paused' && task.pausedAt
      ? Date.now() - new Date(task.pausedAt).getTime()
      : 0;
  return end - new Date(task.startTime).getTime() - task.totalPausedMs - pausedExtra;
};

/** Format elapsed ms to HH:MM:SS */
export const formatElapsed = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ============================================
// STORE INTERFACE
// ============================================

interface TaskStore {
  // Active task (null = idle)
  activeTask: TaskEntry | null;

  // All completed + historical tasks
  tasks: TaskEntry[];

  // Saved task names for quick re-entry
  savedTasks: SavedTask[];

  // Input bar state
  taskInput: string;
  notifyAfterMin: number;        // configurable, default 10
  showSavedSuggestions: boolean;

  // Notification timer ref (stores timeout id)
  _notifyTimerId: ReturnType<typeof setTimeout> | null;

  // ---- Actions ----
  setTaskInput: (val: string) => void;
  setNotifyAfterMin: (min: number) => void;
  setShowSavedSuggestions: (show: boolean) => void;

  startTask: (name: string, location?: string) => Promise<void>;
  pauseTask: () => Promise<void>;
  resumeTask: () => Promise<void>;
  stopTask: () => Promise<void>;

  loadTasks: () => Promise<void>;

  // Delete a completed task from history
  deleteTask: (id: string) => Promise<void>;

  // Helpers
  getFilteredSavedTasks: (input: string) => SavedTask[];
  getTasksByDay: () => Array<{ dateKey: string; label: string; tasks: TaskEntry[] }>;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useTaskStore = create<TaskStore>((set, get) => ({
  activeTask: null,
  tasks: [],
  savedTasks: [],
  taskInput: '',
  notifyAfterMin: 10,
  showSavedSuggestions: false,
  _notifyTimerId: null,

  // ---- Setters ----

  setTaskInput: (val) => set({ taskInput: val }),
  setNotifyAfterMin: (min) => set({ notifyAfterMin: min }),
  setShowSavedSuggestions: (show) => set({ showSavedSuggestions: show }),

  // ---- Start Task ----

  startTask: async (name, location) => {
    const { activeTask, notifyAfterMin, tasks, savedTasks, _notifyTimerId } = get();

    // Auto-complete any running task first
    if (activeTask && activeTask.status !== 'completed') {
      const completed: TaskEntry = {
        ...activeTask,
        endTime: new Date().toISOString(),
        status: 'completed',
        pausedAt: undefined,
      };
      const updatedTasks = [completed, ...tasks];
      set({ tasks: updatedTasks });
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
    }

    // Clear any existing notify timer
    if (_notifyTimerId) clearTimeout(_notifyTimerId);

    const colorIndex = tasks.filter(
      (t) => getDateKey(t.startTime) === todayKey()
    ).length;

    const newTask: TaskEntry = {
      id: generateId(),
      name: name.trim(),
      startTime: new Date().toISOString(),
      totalPausedMs: 0,
      status: 'running',
      notifyAfterMin,
      location,
      color: getTaskColor(colorIndex),
      dateKey: todayKey(),
    };

    // Schedule in-app reminder
    const timerId = setTimeout(() => {
      Vibration.vibrate([0, 300, 100, 300]);
      Alert.alert(
        'MEZR Reminder',
        `"${newTask.name}" has been running for ${notifyAfterMin} min. Still going?`,
        [
          { text: 'Still going', style: 'cancel' },
          { text: 'Stop', onPress: () => get().stopTask() },
        ]
      );
    }, notifyAfterMin * 60 * 1000);

    // Update saved tasks
    const existing = savedTasks.find(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase()
    );
    const updatedSaved: SavedTask[] = existing
      ? savedTasks.map((s) =>
          s.name.toLowerCase() === name.trim().toLowerCase()
            ? { ...s, count: s.count + 1, lastUsed: new Date().toISOString() }
            : s
        )
      : [{ name: name.trim(), lastUsed: new Date().toISOString(), count: 1 }, ...savedTasks];

    // Keep top MAX_SAVED_TASKS sorted by count
    const trimmedSaved = updatedSaved
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_SAVED_TASKS);

    set({
      activeTask: newTask,
      taskInput: '',
      showSavedSuggestions: false,
      savedTasks: trimmedSaved,
      _notifyTimerId: timerId,
    });

    await AsyncStorage.setItem(SAVED_TASKS_KEY, JSON.stringify(trimmedSaved));
  },

  // ---- Pause Task ----

  pauseTask: async () => {
    const { activeTask, _notifyTimerId } = get();
    if (!activeTask || activeTask.status !== 'running') return;

    if (_notifyTimerId) clearTimeout(_notifyTimerId);

    const paused: TaskEntry = {
      ...activeTask,
      status: 'paused',
      pausedAt: new Date().toISOString(),
    };
    set({ activeTask: paused, _notifyTimerId: null });
  },

  // ---- Resume Task ----

  resumeTask: async () => {
    const { activeTask, notifyAfterMin } = get();
    if (!activeTask || activeTask.status !== 'paused') return;

    const pausedDuration = activeTask.pausedAt
      ? Date.now() - new Date(activeTask.pausedAt).getTime()
      : 0;

    const resumed: TaskEntry = {
      ...activeTask,
      status: 'running',
      pausedAt: undefined,
      totalPausedMs: activeTask.totalPausedMs + pausedDuration,
    };

    // Reschedule notify timer
    const timerId = setTimeout(() => {
      Vibration.vibrate([0, 300, 100, 300]);
      Alert.alert(
        'MEZR Reminder',
        `"${resumed.name}" — ${notifyAfterMin} min check-in. Still going?`,
        [
          { text: 'Still going', style: 'cancel' },
          { text: 'Stop', onPress: () => get().stopTask() },
        ]
      );
    }, notifyAfterMin * 60 * 1000);

    set({ activeTask: resumed, _notifyTimerId: timerId });
  },

  // ---- Stop Task ----

  stopTask: async () => {
    const { activeTask, tasks, _notifyTimerId } = get();
    if (!activeTask) return;

    if (_notifyTimerId) clearTimeout(_notifyTimerId);

    const now = new Date().toISOString();
    const pausedExtra =
      activeTask.status === 'paused' && activeTask.pausedAt
        ? Date.now() - new Date(activeTask.pausedAt).getTime()
        : 0;

    const completed: TaskEntry = {
      ...activeTask,
      endTime: now,
      status: 'completed',
      pausedAt: undefined,
      totalPausedMs: activeTask.totalPausedMs + pausedExtra,
    };

    const updatedTasks = [completed, ...tasks];
    set({ activeTask: null, tasks: updatedTasks, _notifyTimerId: null });
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  },

  // ---- Load from storage ----

  loadTasks: async () => {
    try {
      const [rawTasks, rawSaved] = await Promise.all([
        AsyncStorage.getItem(TASKS_KEY),
        AsyncStorage.getItem(SAVED_TASKS_KEY),
      ]);
      const tasks: TaskEntry[] = rawTasks ? JSON.parse(rawTasks) : [];
      const savedTasks: SavedTask[] = rawSaved ? JSON.parse(rawSaved) : [];

      // Recover any task that was 'running' when app closed → mark completed
      const recovered = tasks.map((t) =>
        t.status !== 'completed'
          ? { ...t, status: 'completed' as const, endTime: t.endTime ?? t.startTime }
          : t
      );

      set({ tasks: recovered, savedTasks });
      if (rawTasks) await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(recovered));
    } catch (e) {
      console.error('TaskStore load error:', e);
    }
  },

  // ---- Delete task ----

  deleteTask: async (id) => {
    const { tasks } = get();
    const updated = tasks.filter((t) => t.id !== id);
    set({ tasks: updated });
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
  },

  // ---- Helpers ----

  getFilteredSavedTasks: (input) => {
    const { savedTasks } = get();
    if (!input.trim()) return savedTasks.slice(0, 8);
    const q = input.toLowerCase();
    return savedTasks
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 6);
  },

  getTasksByDay: () => {
    const { tasks, activeTask } = get();
    const all: TaskEntry[] = activeTask
      ? [activeTask, ...tasks]
      : [...tasks];

    // Group by dateKey
    const dayMap = new Map<string, TaskEntry[]>();
    for (const t of all) {
      const key = t.dateKey;
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key)!.push(t);
    }

    // Sort days descending (today first)
    const sortedKeys = Array.from(dayMap.keys()).sort((a, b) =>
      b.localeCompare(a)
    );

    const today = todayKey();
    const yesterday = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    })();

    return sortedKeys.map((key) => {
      let label: string;
      if (key === today) label = 'Today';
      else if (key === yesterday) label = 'Yesterday';
      else {
        const d = new Date(key + 'T12:00:00');
        label = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
      // Sort tasks within the day by startTime ascending
      const sorted = (dayMap.get(key) ?? []).sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      return { dateKey: key, label, tasks: sorted };
    });
  },
}));
