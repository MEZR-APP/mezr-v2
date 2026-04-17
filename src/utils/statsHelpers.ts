/**
 * Stats & Habit Stack calculations
 * Synergy score, weekly stacks, module detail, streaks
 */

import type { ActivityEntry, ModuleId } from '../types';
import type { SynergyScoreResult, HabitStackBlock, ModuleDetailResult } from '../types';

const MODULE_LABELS: Record<ModuleId, string> = {
  breath: 'Breathing',
  swim: 'Swim',
  meditate: 'Zen',
  run: 'Run',
  cycle: 'Cycle',
};

export const MODULE_COLORS: Record<ModuleId, string> = {
  breath: '#FFFFFF',
  meditate: '#10B981',
  swim: '#3B82F6',
  run: '#EF4444',
  cycle: '#F59E0B',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function toDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateKeyToLocal(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getStartOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday = 1
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getEndOfWeek(d: Date): Date {
  const start = getStartOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getSessionsThisWeek(history: ActivityEntry[]): Map<string, ModuleId[]> {
  const now = new Date();
  const start = getStartOfWeek(now);
  const end = getEndOfWeek(now);
  const map = new Map<string, ModuleId[]>();

  for (const entry of history) {
    const d = new Date(entry.date);
    if (d < start || d > end) continue;
    const key = toDateKey(entry.date);
    const list = map.get(key) ?? [];
    if (!list.includes(entry.type)) list.push(entry.type);
    map.set(key, list);
  }

  return map;
}

export function calculateSynergyScore(history: ActivityEntry[]): SynergyScoreResult {
  const weekSessions = getSessionsThisWeek(history);
  let score = 0;
  let daysWithAny = 0;
  let daysWith2Plus = 0;
  let daysWith3Plus = 0;
  let daysWithAll4 = 0;
  const bestDays: SynergyScoreResult['bestDays'] = [];

  weekSessions.forEach((modules, dateKey) => {
    const count = modules.length;
    if (count === 0) return;
    daysWithAny += 1;
    score += 10;
    if (count >= 2) {
      score += 5;
      daysWith2Plus += 1;
    }
    if (count >= 3) {
      score += 10;
      daysWith3Plus += 1;
    }
    if (count >= 4) {
      score += 15;
      daysWithAll4 += 1;
    }

    const d = dateKeyToLocal(dateKey);
    const dayName = DAY_LABELS[d.getDay()];
    let stars = 0;
    if (count >= 4) stars = 3;
    else if (count >= 3) stars = 2;
    else if (count >= 2) stars = 1;
    bestDays.push({
      dateKey,
      label: dayName,
      moduleCount: count,
      stars,
    });
  });

  score = Math.min(100, score);
  bestDays.sort((a, b) => b.moduleCount - a.moduleCount);

  return {
    score,
    maxScore: 100,
    daysWithAny,
    daysWith2Plus,
    daysWith3Plus,
    daysWithAll4,
    bestDays: bestDays.slice(0, 5),
  };
}

export function getHabitStacks(history: ActivityEntry[]): HabitStackBlock[] {
  const weekSessions = getSessionsThisWeek(history);
  const counts: Record<ModuleId, number> = {
    breath: 0,
    swim: 0,
    meditate: 0,
    run: 0,
    cycle: 0,
  };
  weekSessions.forEach((modules) => {
    modules.forEach((m) => {
      counts[m] = (counts[m] ?? 0) + 1;
    });
  });
  // Count actual session count per module this week (each day can have 1+ sessions)
  const byModule = new Map<ModuleId, number>();
  for (const entry of history) {
    const d = new Date(entry.date);
    const start = getStartOfWeek(new Date());
    const end = getEndOfWeek(new Date());
    if (d >= start && d <= end) {
      byModule.set(entry.type, (byModule.get(entry.type) ?? 0) + 1);
    }
  }
  const blocks: HabitStackBlock[] = [];
  const order: ModuleId[] = ['breath', 'swim', 'meditate', 'run', 'cycle'];
  const withSessions = order.filter((m) => (byModule.get(m) ?? 0) > 0);
  // Breathing always at bottom (base); then by session count descending
  const breathCount = byModule.get('breath') ?? 0;
  const others = withSessions.filter((m) => m !== 'breath')
    .map((m) => ({ module: m, count: byModule.get(m) ?? 0 }))
    .sort((a, b) => b.count - a.count);
  if (breathCount > 0) {
    blocks.push({
      module: 'breath',
      label: MODULE_LABELS.breath,
      count: breathCount,
      color: MODULE_COLORS.breath,
    });
  }
  others.forEach(({ module, count }) => {
    blocks.push({
      module,
      label: MODULE_LABELS[module],
      count,
      color: MODULE_COLORS[module],
    });
  });
  return blocks;
}

export function getModuleDetail(history: ActivityEntry[], module: ModuleId): ModuleDetailResult {
  const filtered = history.filter((e) => e.type === module);
  const totalSessions = filtered.length;

  let totalDurationSec = 0;
  filtered.forEach((e) => {
    if ('time' in e && typeof e.time === 'number') totalDurationSec += e.time * 60; // time in minutes
    if ('duration' in e && typeof e.duration === 'number') totalDurationSec += e.duration * 60;
  });

  const dateKeys = [...new Set(filtered.map((e) => toDateKey(e.date)))].sort();
  let streak = 0;
  if (dateKeys.length > 0) {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let cur = today;
    const set = new Set(dateKeys);
    while (set.has(cur)) {
      streak += 1;
      const prev = dateKeyToLocal(cur);
      prev.setDate(prev.getDate() - 1);
      cur = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
    }
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30: { dateKey: string; count: number }[] = [];
  const byDay = new Map<string, number>();
  filtered.forEach((e) => {
    const key = toDateKey(e.date);
    if (new Date(e.date) >= thirtyDaysAgo) {
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
  });
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    last30.push({ dateKey: key, count: byDay.get(key) ?? 0 });
  }

  const byHour = new Map<number, number>();
  const byDayOfWeek = new Map<number, number>();
  filtered.forEach((e) => {
    const d = new Date(e.date);
    byHour.set(d.getHours(), (byHour.get(d.getHours()) ?? 0) + 1);
    byDayOfWeek.set(d.getDay(), (byDayOfWeek.get(d.getDay()) ?? 0) + 1);
  });
  let bestHour = 0;
  let bestHourCount = 0;
  byHour.forEach((c, h) => {
    if (c > bestHourCount) {
      bestHourCount = c;
      bestHour = h;
    }
  });
  let bestDayOfWeek = 0;
  let bestDayCount = 0;
  byDayOfWeek.forEach((c, day) => {
    if (c > bestDayCount) {
      bestDayCount = c;
      bestDayOfWeek = day;
    }
  });

  return {
    totalSessions,
    totalDurationSec,
    streak,
    last30Days: last30,
    bestHour,
    bestDayOfWeek,
  };
}

export function getModulesWithData(history: ActivityEntry[]): ModuleId[] {
  const set = new Set<ModuleId>();
  history.forEach((e) => set.add(e.type));
  const order: ModuleId[] = ['breath', 'swim', 'meditate', 'run', 'cycle'];
  return order.filter((m) => set.has(m));
}

// ── Period-aware stats (week / year navigation) ──

export interface PeriodRange {
  start: Date;
  end: Date;
  label: string;
}

export interface PeriodStats {
  totalSessions: number;
  totalDurationSec: number;
  streak: number;
}

export interface ChartData {
  labels: string[];
  counts: number[];
}

export function getWeekRange(offset: number): PeriodRange {
  const now = new Date();
  const start = getStartOfWeek(now);
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const sMonth = MONTH_SHORT[start.getMonth()];
  const eMonth = MONTH_SHORT[end.getMonth()];
  let label: string;
  if (start.getMonth() === end.getMonth()) {
    label = `${sMonth} ${start.getDate()} – ${end.getDate()}`;
  } else {
    label = `${sMonth} ${start.getDate()} – ${eMonth} ${end.getDate()}`;
  }

  return { start, end, label };
}

export function getYearRange(offset: number): PeriodRange {
  const year = new Date().getFullYear() + offset;
  const start = new Date(year, 0, 1, 0, 0, 0, 0);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end, label: `${year}` };
}

export function getModuleStatsForRange(
  history: ActivityEntry[],
  module: ModuleId,
  start: Date,
  end: Date,
): PeriodStats {
  const filtered = history.filter((e) => {
    if (e.type !== module) return false;
    const d = new Date(e.date);
    return d >= start && d <= end;
  });

  const totalSessions = filtered.length;
  let totalDurationSec = 0;
  filtered.forEach((e) => {
    if ('time' in e && typeof e.time === 'number') totalDurationSec += e.time * 60;
    if ('duration' in e && typeof e.duration === 'number') totalDurationSec += e.duration * 60;
  });

  const dateKeys = [...new Set(filtered.map((e) => toDateKey(e.date)))].sort();
  let streak = 0;
  let run = 0;
  for (let i = 0; i < dateKeys.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = dateKeyToLocal(dateKeys[i - 1]);
      const curr = dateKeyToLocal(dateKeys[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
      run = diffDays === 1 ? run + 1 : 1;
    }
    streak = Math.max(streak, run);
  }

  return { totalSessions, totalDurationSec, streak };
}

export function getWeekChartData(
  history: ActivityEntry[],
  module: ModuleId,
  weekStart: Date,
): ChartData {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const counts: number[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const count = history.filter((e) => e.type === module && toDateKey(e.date) === key).length;
    counts.push(count);
  }

  return { labels, counts };
}

export function getYearChartData(
  history: ActivityEntry[],
  module: ModuleId,
  year: number,
): ChartData {
  const labels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const counts: number[] = [];

  for (let m = 0; m < 12; m++) {
    const count = history.filter((e) => {
      if (e.type !== module) return false;
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === m;
    }).length;
    counts.push(count);
  }

  return { labels, counts };
}

export function getModuleLabel(module: ModuleId): string {
  return MODULE_LABELS[module];
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
}
