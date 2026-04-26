/**
 * Mezr App - TimelineScreen
 * Infinity scroll visualization of every task across your wake hours.
 *
 * Layout:
 *   - Vertical scroll, days stacked newest-first
 *   - Each day: header (Today / Yesterday / date) then a 24h ruler
 *   - The ruler is broken into 10-minute slots (144 slots per day)
 *   - Each task is drawn as a colored bar spanning its start→end
 *   - A "NOW" cursor line shows the current time
 *   - Scroll auto-jumps to NOW on first load
 *
 * 1 minute  = PIXELS_PER_MIN px
 * 10 minutes = SLOT_HEIGHT px  (visual granularity)
 * 1 hour    = PIXELS_PER_MIN * 60 px
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useTaskStore, getElapsedMs, formatElapsed } from '../stores/taskStore';
import type { TaskEntry } from '../types/task';
import { colors } from '../theme/colors';

// ============================================
// CONSTANTS
// ============================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PIXELS_PER_MIN = 2.5;         // px per minute
const SLOT_HEIGHT = PIXELS_PER_MIN * 10;  // 25px per 10-min slot
const HOUR_HEIGHT = PIXELS_PER_MIN * 60;  // 150px per hour

const TIME_AXIS_WIDTH = 52;          // left column for time labels
const DAY_HEADER_HEIGHT = 44;        // height of the day header row
const DAY_PADDING_BOTTOM = 24;       // space after each day block

const HOUR_START = 4;               // 4 AM — start of the ruler
const HOUR_END = 24;                // midnight — end of the ruler
const VISIBLE_HOURS = HOUR_END - HOUR_START; // 20 hours per day ruler

const DAY_RULER_HEIGHT = VISIBLE_HOURS * HOUR_HEIGHT;
const DAY_BLOCK_HEIGHT = DAY_HEADER_HEIGHT + DAY_RULER_HEIGHT + DAY_PADDING_BOTTOM;

const NOW_LINE_COLOR = '#4A90E2';

// ============================================
// HELPERS
// ============================================

/** Clamp a value between min and max */
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Convert a Date/ISO string to Y offset within a day ruler */
const timeToY = (isoOrDate: string | Date): number => {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  const minutesSinceRulerStart = (d.getHours() - HOUR_START) * 60 + d.getMinutes();
  return clamp(minutesSinceRulerStart * PIXELS_PER_MIN, 0, DAY_RULER_HEIGHT);
};

/** Format hour to "5 AM" / "12 PM" / "8 PM" */
const formatHour = (h: number): string => {
  if (h === 0 || h === 24) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

/** Given a dateKey YYYY-MM-DD, return the index from today (0 = today, 1 = yesterday, etc.) */
const dayIndex = (dateKey: string, sortedKeys: string[]): number =>
  sortedKeys.indexOf(dateKey);

// ============================================
// LIVE CLOCK HOOK
// ============================================

const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10000); // update every 10s
    return () => clearInterval(id);
  }, []);
  return now;
};

// ============================================
// HOUR RULER BACKGROUND
// Draws faint horizontal lines + time labels for every hour
// ============================================

function HourRuler() {
  const hours = Array.from({ length: VISIBLE_HOURS + 1 }, (_, i) => HOUR_START + i);
  return (
    <View style={styles.rulerContainer} pointerEvents="none">
      {hours.map((h) => (
        <View key={h} style={[styles.hourRow, { top: (h - HOUR_START) * HOUR_HEIGHT }]}>
          <Text style={styles.hourLabel}>{formatHour(h)}</Text>
          <View style={styles.hourLine} />
        </View>
      ))}
    </View>
  );
}

// ============================================
// TASK BAR
// ============================================

interface TaskBarProps {
  task: TaskEntry;
  now: Date;
  onPress: (t: TaskEntry) => void;
}

function TaskBar({ task, now, onPress }: TaskBarProps) {
  const startY = timeToY(task.startTime);

  let endY: number;
  if (task.status === 'completed' && task.endTime) {
    endY = timeToY(task.endTime);
  } else {
    // Still running — extend to now
    endY = timeToY(now);
  }

  const barHeight = Math.max(endY - startY, SLOT_HEIGHT); // min 1 slot tall
  const isRunning = task.status === 'running';
  const isPaused = task.status === 'paused';

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      activeOpacity={0.8}
      style={[
        styles.taskBar,
        {
          top: startY,
          height: barHeight,
          backgroundColor: task.color + (isRunning ? 'CC' : isPaused ? '88' : '55'),
          borderLeftColor: task.color,
        },
      ]}
    >
      <Text style={[styles.taskBarLabel, { color: task.color }]} numberOfLines={1}>
        {task.name}
      </Text>
      {barHeight > 36 && (
        <Text style={[styles.taskBarTime, { color: task.color + 'AA' }]}>
          {formatElapsed(getElapsedMs(task))}
        </Text>
      )}
      {isRunning && <View style={[styles.runningStripe, { backgroundColor: task.color }]} />}
    </TouchableOpacity>
  );
}

// ============================================
// TASK DETAIL MODAL (bottom sheet style)
// ============================================

interface TaskDetailProps {
  task: TaskEntry | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function TaskDetail({ task, onClose, onDelete }: TaskDetailProps) {
  if (!task) return null;

  const startStr = new Date(task.startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const endStr = task.endTime
    ? new Date(task.endTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : task.status === 'paused'
    ? 'Paused'
    : 'Running…';

  const elapsed = formatElapsed(getElapsedMs(task));

  return (
    <View style={styles.detailOverlay}>
      <TouchableOpacity style={styles.detailBackdrop} onPress={onClose} />
      <View style={styles.detailSheet}>
        <View style={[styles.detailAccentBar, { backgroundColor: task.color }]} />
        <Text style={styles.detailTitle}>{task.name}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Started</Text>
          <Text style={styles.detailVal}>{startStr}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Ended</Text>
          <Text style={styles.detailVal}>{endStr}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Duration</Text>
          <Text style={styles.detailVal}>{elapsed}</Text>
        </View>
        {task.location && (
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Location</Text>
            <Text style={styles.detailVal}>{task.location}</Text>
          </View>
        )}
        <View style={styles.detailActions}>
          {task.status === 'completed' && (
            <TouchableOpacity
              onPress={() => { onDelete(task.id); onClose(); }}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ============================================
// DAY BLOCK
// ============================================

interface DayBlockProps {
  dateKey: string;
  label: string;
  tasks: TaskEntry[];
  now: Date;
  isToday: boolean;
  onTaskPress: (t: TaskEntry) => void;
}

function DayBlock({ dateKey, label, tasks, now, isToday, onTaskPress }: DayBlockProps) {
  const todayNowY = isToday ? timeToY(now) : -1;

  // Compute stats for the day header
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const totalTrackedMs = completedTasks.reduce(
    (acc, t) => acc + getElapsedMs(t),
    0
  );
  const trackedHours = (totalTrackedMs / 3600000).toFixed(1);

  return (
    <View style={styles.dayBlock}>
      {/* Day header */}
      <View style={styles.dayHeader}>
        <Text style={styles.dayHeaderLabel}>{label}</Text>
        <Text style={styles.dayHeaderStats}>
          {completedTasks.length} tasks · {trackedHours}h tracked
        </Text>
      </View>

      {/* Ruler + tasks layer */}
      <View style={[styles.rulerWrapper, { height: DAY_RULER_HEIGHT }]}>
        <HourRuler />

        {/* Task bars */}
        <View style={styles.taskLayer} pointerEvents="box-none">
          {tasks.map((t) => (
            <TaskBar key={t.id} task={t} now={now} onPress={onTaskPress} />
          ))}
        </View>

        {/* NOW line (only for today) */}
        {isToday && todayNowY >= 0 && todayNowY <= DAY_RULER_HEIGHT && (
          <View
            style={[styles.nowLine, { top: todayNowY }]}
            pointerEvents="none"
          >
            <View style={styles.nowDot} />
            <View style={styles.nowLineBar} />
            <Text style={styles.nowLabel}>
              {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom padding */}
      <View style={{ height: DAY_PADDING_BOTTOM }} />
    </View>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function TimelineScreen() {
  const now = useClock();
  const getTasksByDay = useTaskStore((s) => s.getTasksByDay);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [selectedTask, setSelectedTask] = useState<TaskEntry | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const dayGroups = getTasksByDay();
  const todayKey = now.toISOString().slice(0, 10);

  // Auto-scroll to NOW on first render
  useEffect(() => {
    if (hasScrolled || !scrollRef.current || dayGroups.length === 0) return;

    // Today is at index 0 (newest first).
    // Scroll offset = DAY_HEADER_HEIGHT + Y_of_now - half-screen
    const screenH = Dimensions.get('window').height;
    const nowY = DAY_HEADER_HEIGHT + timeToY(now);
    const target = Math.max(0, nowY - screenH * 0.35);

    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: target, animated: true });
      setHasScrolled(true);
    }, 400);
  }, [dayGroups.length, hasScrolled, now]);

  const handleTaskPress = useCallback((t: TaskEntry) => {
    setSelectedTask(t);
  }, []);

  if (dayGroups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No tasks yet</Text>
        <Text style={styles.emptyBody}>
          Enter your first task above — your day will appear here as a visual timeline.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {dayGroups.map(({ dateKey, label, tasks }) => (
          <DayBlock
            key={dateKey}
            dateKey={dateKey}
            label={label}
            tasks={tasks}
            now={now}
            isToday={dateKey === todayKey}
            onTaskPress={handleTaskPress}
          />
        ))}

        {/* Infinite "future" indicator */}
        <View style={styles.bottomBuffer}>
          <Text style={styles.bottomBufferText}>↓ more days below</Text>
        </View>
      </ScrollView>

      {/* Task detail overlay */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onDelete={deleteTask}
        />
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },

  // ---- Day block ----
  dayBlock: {
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  dayHeader: {
    height: DAY_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#050505',
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  dayHeaderLabel: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  dayHeaderStats: {
    color: '#444',
    fontSize: 11,
    letterSpacing: 1,
  },

  // ---- Ruler ----
  rulerWrapper: {
    position: 'relative',
    marginLeft: TIME_AXIS_WIDTH,
    marginRight: 0,
  },
  rulerContainer: {
    position: 'absolute',
    top: 0,
    left: -TIME_AXIS_WIDTH,
    right: 0,
    height: DAY_RULER_HEIGHT,
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: HOUR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hourLabel: {
    width: TIME_AXIS_WIDTH - 8,
    textAlign: 'right',
    color: '#2A2A2A',
    fontSize: 9,
    letterSpacing: 0.5,
    paddingTop: 2,
    paddingRight: 8,
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#141414',
    marginTop: 6,
  },

  // ---- Task layer ----
  taskLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: DAY_RULER_HEIGHT,
  },
  taskBar: {
    position: 'absolute',
    left: 4,
    right: 4,
    borderRadius: 4,
    borderLeftWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  taskBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  taskBarTime: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  runningStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
  },

  // ---- NOW line ----
  nowLine: {
    position: 'absolute',
    left: -TIME_AXIS_WIDTH,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NOW_LINE_COLOR,
    marginLeft: 2,
    marginRight: 0,
  },
  nowLineBar: {
    flex: 1,
    height: 1,
    backgroundColor: NOW_LINE_COLOR,
  },
  nowLabel: {
    color: NOW_LINE_COLOR,
    fontSize: 9,
    letterSpacing: 0.5,
    paddingHorizontal: 4,
  },

  // ---- Empty state ----
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '200',
    letterSpacing: 4,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  emptyBody: {
    color: '#222',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.3,
  },

  // ---- Bottom buffer ----
  bottomBuffer: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBufferText: {
    color: '#1A1A1A',
    fontSize: 11,
    letterSpacing: 1,
  },

  // ---- Task detail sheet ----
  detailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  detailBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  detailSheet: {
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderTopColor: '#1E1E1E',
  },
  detailAccentBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  detailKey: {
    color: '#444',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailVal: {
    color: '#DDD',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1A0000',
    borderWidth: 1,
    borderColor: '#FF6B6B44',
  },
  deleteBtnText: {
    color: '#FF6B6B',
    fontSize: 13,
    letterSpacing: 1,
  },
  closeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
  },
  closeBtnText: {
    color: '#888',
    fontSize: 13,
    letterSpacing: 1,
  },
});
