/**
 * Mezr App - QuickEntryBar
 * Always-visible notification-bar-style task entry strip.
 * Sits at the top of every screen — user pulls phone down and enters task immediately.
 *
 * States:
 *   IDLE   → text input + saved suggestions + ▶ play button
 *   RUNNING → task name + live timer + ⏸ pause + ■ stop
 *   PAUSED  → task name + "PAUSED" label + ▶ resume + ■ stop
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useTaskStore, getElapsedMs, formatElapsed } from '../stores/taskStore';
import type { SavedTask } from '../types/task';
import { colors } from '../theme/colors';

// ============================================
// CONSTANTS
// ============================================

const BAR_BG = '#0D0D0D';
const BAR_BORDER = '#1E1E1E';
const ACCENT = '#4A90E2';
const RUNNING_DOT = '#50E3C2';
const PAUSED_DOT = '#F5A623';
const STOP_COLOR = '#FF6B6B';

// ============================================
// LIVE TIMER HOOK
// ============================================

const useLiveTimer = (running: boolean): number => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  return tick;
};

// ============================================
// NOTIFY AFTER PICKER
// ============================================

const NOTIFY_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

function NotifyPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.notifyRow}
      contentContainerStyle={styles.notifyRowContent}
    >
      {NOTIFY_OPTIONS.map((min) => (
        <TouchableOpacity
          key={min}
          onPress={() => onChange(min)}
          style={[styles.notifyChip, value === min && styles.notifyChipActive]}
        >
          <Text style={[styles.notifyChipText, value === min && styles.notifyChipTextActive]}>
            {min}m
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ============================================
// SAVED TASK SUGGESTION CHIPS
// ============================================

function SavedChips({
  suggestions,
  onSelect,
}: {
  suggestions: SavedTask[];
  onSelect: (name: string) => void;
}) {
  if (!suggestions.length) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipsRow}
      contentContainerStyle={styles.chipsRowContent}
      keyboardShouldPersistTaps="handled"
    >
      {suggestions.map((s) => (
        <TouchableOpacity
          key={s.name}
          onPress={() => onSelect(s.name)}
          style={styles.chip}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText} numberOfLines={1}>
            {s.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function QuickEntryBar() {
  const activeTask = useTaskStore((s) => s.activeTask);
  const taskInput = useTaskStore((s) => s.taskInput);
  const notifyAfterMin = useTaskStore((s) => s.notifyAfterMin);
  const showSavedSuggestions = useTaskStore((s) => s.showSavedSuggestions);
  const setTaskInput = useTaskStore((s) => s.setTaskInput);
  const setNotifyAfterMin = useTaskStore((s) => s.setNotifyAfterMin);
  const setShowSavedSuggestions = useTaskStore((s) => s.setShowSavedSuggestions);
  const startTask = useTaskStore((s) => s.startTask);
  const pauseTask = useTaskStore((s) => s.pauseTask);
  const resumeTask = useTaskStore((s) => s.resumeTask);
  const stopTask = useTaskStore((s) => s.stopTask);
  const getFilteredSavedTasks = useTaskStore((s) => s.getFilteredSavedTasks);

  const inputRef = useRef<TextInput>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Live tick for the running timer
  useLiveTimer(activeTask?.status === 'running');

  // Pulse animation for running dot
  useEffect(() => {
    if (activeTask?.status === 'running') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
    pulseAnim.setValue(1);
  }, [activeTask?.status, pulseAnim]);

  const suggestions = getFilteredSavedTasks(taskInput);
  const showChips = showSavedSuggestions && suggestions.length > 0;
  const isExpanded = showChips || (showSavedSuggestions && !activeTask);

  const handlePlay = () => {
    const name = taskInput.trim();
    if (!name) {
      inputRef.current?.focus();
      return;
    }
    startTask(name);
  };

  const handleSelectSuggestion = (name: string) => {
    setTaskInput(name);
    setShowSavedSuggestions(false);
    // Auto-start
    startTask(name);
  };

  // ---- ACTIVE TASK VIEW ----
  if (activeTask) {
    const isRunning = activeTask.status === 'running';
    const elapsed = formatElapsed(getElapsedMs(activeTask));
    const dotColor = isRunning ? RUNNING_DOT : PAUSED_DOT;

    return (
      <View style={styles.container}>
        <View style={styles.activeRow}>
          {/* Status dot */}
          <Animated.View
            style={[styles.statusDot, { backgroundColor: dotColor, opacity: isRunning ? pulseAnim : 1 }]}
          />

          {/* Task name + timer */}
          <View style={styles.activeInfo}>
            <Text style={styles.activeTaskName} numberOfLines={1}>
              {activeTask.name.toUpperCase()}
            </Text>
            <Text style={styles.activeTimer}>{elapsed}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {isRunning ? (
              <TouchableOpacity onPress={pauseTask} style={styles.controlBtn} activeOpacity={0.7}>
                <Text style={styles.controlBtnText}>⏸</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={resumeTask} style={styles.controlBtn} activeOpacity={0.7}>
                <Text style={styles.controlBtnText}>▶</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={stopTask}
              style={[styles.controlBtn, styles.stopBtn]}
              activeOpacity={0.7}
            >
              <Text style={[styles.controlBtnText, styles.stopBtnText]}>■</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notify time strip when active */}
        <View style={styles.notifyStripActive}>
          <Text style={styles.notifyLabel}>Remind in:</Text>
          <NotifyPicker value={notifyAfterMin} onChange={setNotifyAfterMin} />
        </View>
      </View>
    );
  }

  // ---- IDLE INPUT VIEW ----
  return (
    <View style={styles.container}>
      {/* Main input row */}
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.mezrTag}
          onPress={() => {
            inputRef.current?.focus();
            setShowSavedSuggestions(true);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.mezrTagText}>M</Text>
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={taskInput}
          onChangeText={(v) => {
            setTaskInput(v);
            setShowSavedSuggestions(true);
          }}
          onFocus={() => setShowSavedSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSavedSuggestions(false), 200)}
          placeholder="what are you doing?"
          placeholderTextColor="#333"
          returnKeyType="done"
          onSubmitEditing={handlePlay}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.playBtn, taskInput.trim() ? styles.playBtnActive : null]}
          onPress={handlePlay}
          activeOpacity={0.7}
        >
          <Text style={[styles.playBtnText, taskInput.trim() ? styles.playBtnTextActive : null]}>
            ▶
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notify time picker strip */}
      <View style={styles.notifyStrip}>
        <Text style={styles.notifyLabel}>Remind after:</Text>
        <NotifyPicker value={notifyAfterMin} onChange={setNotifyAfterMin} />
      </View>

      {/* Saved task suggestion chips */}
      {showChips && (
        <SavedChips suggestions={suggestions} onSelect={handleSelectSuggestion} />
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: BAR_BG,
    borderBottomWidth: 1,
    borderBottomColor: BAR_BORDER,
    paddingTop: Platform.OS === 'ios' ? 54 : 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  // ---- Active task ----
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  activeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  activeTaskName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    flexShrink: 1,
    maxWidth: '55%',
  },
  activeTimer: {
    color: '#888',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  stopBtn: {
    borderColor: STOP_COLOR + '44',
  },
  controlBtnText: {
    color: '#FFF',
    fontSize: 14,
  },
  stopBtnText: {
    color: STOP_COLOR,
    fontSize: 12,
  },
  notifyStripActive: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  // ---- Idle input ----
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    gap: 10,
  },
  mezrTag: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mezrTagText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    letterSpacing: 0.5,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  playBtnActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  playBtnText: {
    color: '#444',
    fontSize: 14,
  },
  playBtnTextActive: {
    color: '#FFF',
  },

  // ---- Notify strip ----
  notifyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  notifyLabel: {
    color: '#444',
    fontSize: 10,
    letterSpacing: 1,
    marginRight: 8,
    width: 72,
  },
  notifyRow: {
    flex: 1,
  },
  notifyRowContent: {
    gap: 6,
    paddingRight: 4,
  },
  notifyChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
  },
  notifyChipActive: {
    backgroundColor: ACCENT + '22',
    borderColor: ACCENT + '88',
  },
  notifyChipText: {
    color: '#444',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  notifyChipTextActive: {
    color: ACCENT,
  },

  // ---- Chips ----
  chipsRow: {
    marginTop: 8,
  },
  chipsRowContent: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    maxWidth: 160,
  },
  chipText: {
    color: '#AAA',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
