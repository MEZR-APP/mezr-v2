/**
 * Mezr App - Stats Screen
 * Habit stacking visualization: Synergy Score, Habit Stack Blocks, Module Detail + Chart
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Rect, Text as SvgText } from 'react-native-svg';
import { useAppStore } from '../stores/appStore';
import { useActivityStore } from '../stores/activityStore';
import {
  calculateSynergyScore,
  getHabitStacks,
  getModulesWithData,
  getModuleLabel,
  getWeekRange,
  getYearRange,
  getModuleStatsForRange,
  getWeekChartData,
  getYearChartData,
  MODULE_COLORS,
  formatDuration,
} from '../utils/statsHelpers';
import type { ModuleId } from '../types';

const RING_SIZE = 100;
const RING_STROKE = 8;

function getLayout(screenWidth: number) {
  if (screenWidth < 380) {
    return { paddingH: 12, sectionGap: 20, cardPadding: 16 };
  }
  if (screenWidth <= 440) {
    return { paddingH: 16, sectionGap: 32, cardPadding: 20 };
  }
  return { paddingH: 24, sectionGap: 40, cardPadding: 24 };
}

export default function StatsScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const layout = useMemo(() => getLayout(screenWidth), [screenWidth]);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);
  const history = useActivityStore((state) => state.history);

  const [modulePickerOpen, setModulePickerOpen] = useState(false);
  const [synergyInfoOpen, setSynergyInfoOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleId>('breath');
  const [periodType, setPeriodType] = useState<'week' | 'year'>('week');
  const [periodOffset, setPeriodOffset] = useState(0);

  const synergy = useMemo(() => calculateSynergyScore(history), [history]);
  const stacks = useMemo(() => getHabitStacks(history), [history]);
  const modulesWithData = useMemo(() => getModulesWithData(history), [history]);
  useEffect(() => {
    if (modulesWithData.length > 0 && !modulesWithData.includes(selectedModule)) {
      setSelectedModule(modulesWithData[0]);
    }
  }, [modulesWithData, selectedModule]);

  const periodRange = useMemo(
    () => (periodType === 'week' ? getWeekRange(periodOffset) : getYearRange(periodOffset)),
    [periodType, periodOffset],
  );
  const periodStats = useMemo(
    () => getModuleStatsForRange(history, selectedModule, periodRange.start, periodRange.end),
    [history, selectedModule, periodRange],
  );
  const chartData = useMemo(() => {
    if (periodType === 'week') {
      return getWeekChartData(history, selectedModule, periodRange.start);
    }
    return getYearChartData(history, selectedModule, periodRange.start.getFullYear());
  }, [history, selectedModule, periodType, periodRange]);

  const canGoForward = periodOffset < 0;

  const hasAnyThisWeek = stacks.length > 0;
  const chartWidth = Math.min(screenWidth - layout.paddingH * 2 - 32, 320);
  const chartHeight = 200;

  const selectModule = (m: ModuleId) => {
    setSelectedModule(m);
    setModulePickerOpen(false);
  };

  const switchPeriod = (type: 'week' | 'year') => {
    setPeriodType(type);
    setPeriodOffset(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentTab('main')} style={styles.backButton}>
          <Text style={styles.backLabel}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>STATS</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: layout.paddingH,
            paddingVertical: 24,
            paddingBottom: 100,
            backgroundColor: '#000000',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Synergy Score */}
        <View style={[styles.sectionWrap, { marginBottom: layout.sectionGap }]}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>SYNERGY SCORE</Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setSynergyInfoOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.infoButtonText}>?</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, { padding: layout.cardPadding }]}>
            <View style={styles.synergyRow}>
              <View style={styles.ringWrap}>
                <Svg width={RING_SIZE + RING_STROKE * 2} height={RING_SIZE + RING_STROKE * 2}>
                  <Circle
                    cx={RING_SIZE / 2 + RING_STROKE}
                    cy={RING_SIZE / 2 + RING_STROKE}
                    r={RING_SIZE / 2}
                    stroke="#333"
                    strokeWidth={RING_STROKE}
                    fill="none"
                  />
                  <Circle
                    cx={RING_SIZE / 2 + RING_STROKE}
                    cy={RING_SIZE / 2 + RING_STROKE}
                    r={RING_SIZE / 2}
                    stroke="#FFFFFF"
                    strokeWidth={RING_STROKE}
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * (RING_SIZE / 2)}`}
                    strokeDashoffset={
                      2 * Math.PI * (RING_SIZE / 2) * (1 - synergy.score / synergy.maxScore)
                    }
                    transform={`rotate(-90 ${RING_SIZE / 2 + RING_STROKE} ${RING_SIZE / 2 + RING_STROKE})`}
                  />
                </Svg>
              </View>
              <View style={styles.synergyTextWrap}>
                <Text style={styles.synergyScore}>
                  {synergy.score} / {synergy.maxScore}
                </Text>
                <Text style={styles.synergyLabel}>points</Text>
              </View>
            </View>
            {synergy.bestDays.length > 0 ? (
              <>
                <Text style={styles.thisWeekBest}>This Week&apos;s Best:</Text>
                {synergy.bestDays.slice(0, 3).map((day) => (
                  <Text key={day.dateKey} style={styles.bestDayRow}>
                    • {day.label}: {day.moduleCount} module{day.moduleCount !== 1 ? 's' : ''}{' '}
                    {'⭐'.repeat(day.stars)}
                  </Text>
                ))}
                <Text style={styles.nextGoal}>
                  Next Goal: Complete 5 days with 3+ modules
                </Text>
              </>
            ) : (
              <Text style={styles.emptyHint}>Complete sessions this week to build your score.</Text>
            )}
          </View>
        </View>

        {/* Section 2: Habit Stack Blocks */}
        <View style={[styles.sectionWrap, { marginBottom: layout.sectionGap }]}>
          <Text style={styles.sectionTitle}>THIS WEEK&apos;S ACTIVITY BLOCKS</Text>
          <View style={[styles.card, { padding: layout.cardPadding }]}>
            {hasAnyThisWeek ? (
              <View style={styles.stackContainer}>
                {[...stacks].reverse().map((block) => (
                  <TouchableOpacity
                    key={block.module}
                    style={[
                      styles.block,
                      { backgroundColor: block.color },
                    ]}
                    onPress={() => {
                      if (modulesWithData.includes(block.module)) {
                        setSelectedModule(block.module);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.blockLabel,
                        { color: block.module === 'breath' ? '#000000' : '#FFFFFF' },
                      ]}
                    >
                      {block.label}
                    </Text>
                    <Text
                      style={[
                        styles.blockCount,
                        { color: block.module === 'breath' ? '#000000' : '#FFFFFF' },
                      ]}
                    >
                      {block.count} session{block.count !== 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyHint}>
                Start your habit stack! Complete a session to begin.
              </Text>
            )}
          </View>
        </View>

        {/* Section 3: Module Detail + Dropdown */}
        <View style={[styles.sectionWrap, { marginBottom: layout.sectionGap }]}>
          <Text style={styles.sectionTitle}>MODULE DETAIL</Text>
          <View style={[styles.card, { padding: layout.cardPadding }]}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setModulePickerOpen(true)}
            >
              <Text style={styles.dropdownText}>{getModuleLabel(selectedModule)}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {!modulesWithData.includes(selectedModule) ? (
              <Text style={styles.emptyHint}>
                No sessions yet. Begin your {getModuleLabel(selectedModule)} journey!
              </Text>
            ) : (
              <>
                {/* Period toggle */}
                <View style={styles.periodToggleRow}>
                  <TouchableOpacity
                    style={[styles.periodToggle, periodType === 'week' && styles.periodToggleActive]}
                    onPress={() => switchPeriod('week')}
                  >
                    <Text
                      style={[
                        styles.periodToggleText,
                        periodType === 'week' && styles.periodToggleTextActive,
                      ]}
                    >
                      WEEK
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.periodToggle, periodType === 'year' && styles.periodToggleActive]}
                    onPress={() => switchPeriod('year')}
                  >
                    <Text
                      style={[
                        styles.periodToggleText,
                        periodType === 'year' && styles.periodToggleTextActive,
                      ]}
                    >
                      YEAR
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Period navigation */}
                <View style={styles.periodNavRow}>
                  <TouchableOpacity
                    onPress={() => setPeriodOffset((o) => o - 1)}
                    style={styles.navArrow}
                    hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                  >
                    <Text style={styles.navArrowText}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.periodLabel}>{periodRange.label}</Text>
                  <TouchableOpacity
                    onPress={() => canGoForward && setPeriodOffset((o) => o + 1)}
                    style={styles.navArrow}
                    disabled={!canGoForward}
                    hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                  >
                    <Text
                      style={[styles.navArrowText, !canGoForward && styles.navArrowTextDisabled]}
                    >
                      ›
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Stats cards */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{periodStats.totalSessions}</Text>
                    <Text style={styles.metricLabel}>Sessions</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>
                      {periodStats.totalDurationSec > 0
                        ? formatDuration(periodStats.totalDurationSec)
                        : '—'}
                    </Text>
                    <Text style={styles.metricLabel}>Duration</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{periodStats.streak}</Text>
                    <Text style={styles.metricLabel}>Streak</Text>
                  </View>
                </View>

                {/* Chart */}
                <View style={[styles.chartWrap, { width: chartWidth }]}>
                  <LabeledBarChart
                    data={chartData.counts}
                    labels={chartData.labels}
                    color={MODULE_COLORS[selectedModule]}
                    width={chartWidth}
                    height={chartHeight}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Synergy Info Modal */}
      <Modal
        visible={synergyInfoOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSynergyInfoOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSynergyInfoOpen(false)}
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>HOW SYNERGY SCORE WORKS</Text>
            <Text style={styles.infoBody}>
              Synergy rewards using different modules on the same day — the more
              variety, the higher your score.
            </Text>
            <View style={styles.infoTable}>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Any session in a day</Text>
                <Text style={styles.infoRowValue}>+10 pts</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>2+ modules in a day</Text>
                <Text style={styles.infoRowValue}>+5 bonus</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>3+ modules in a day</Text>
                <Text style={styles.infoRowValue}>+10 bonus</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>All 4 modules in a day</Text>
                <Text style={styles.infoRowValue}>+15 bonus</Text>
              </View>
            </View>
            <Text style={styles.infoFooter}>
              Max score is 100 per week. Stars reflect daily variety.
            </Text>
            <TouchableOpacity
              style={styles.infoCloseButton}
              onPress={() => setSynergyInfoOpen(false)}
            >
              <Text style={styles.infoCloseText}>GOT IT</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Module Picker Modal */}
      <Modal
        visible={modulePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModulePickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModulePickerOpen(false)}
        >
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Select module</Text>
            {modulesWithData.length === 0 ? (
              <Text style={styles.emptyHint}>No data yet. Start with Breathing.</Text>
            ) : (
              modulesWithData.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={styles.pickerItem}
                  onPress={() => selectModule(m)}
                >
                  <Text style={styles.pickerItemText}>{getModuleLabel(m)}</Text>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={styles.pickerClose}
              onPress={() => setModulePickerOpen(false)}
            >
              <Text style={styles.pickerCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function LabeledBarChart({
  data,
  labels,
  color,
  width,
  height,
}: {
  data: number[];
  labels: string[];
  color: string;
  width: number;
  height: number;
}) {
  const max = Math.max(1, ...data);
  const padding = { top: 12, right: 8, bottom: 28, left: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const gap = data.length <= 7 ? 12 : 6;
  const barW = (chartW - (data.length - 1) * gap) / data.length;

  return (
    <Svg width={width} height={height}>
      {data.map((value, i) => {
        const x = padding.left + i * (barW + gap);
        const barHeight = value > 0 ? Math.max(4, (value / max) * chartH) : 0;
        const y = padding.top + chartH - barHeight;
        return (
          <React.Fragment key={i}>
            {value > 0 && (
              <Rect
                x={x}
                y={y}
                width={barW}
                height={barHeight}
                rx={3}
                fill={color}
                opacity={0.9}
              />
            )}
            <SvgText
              x={x + barW / 2}
              y={height - 6}
              fontSize={10}
              fill="#555555"
              textAnchor="middle"
            >
              {labels[i]}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: { padding: 8 },
  backLabel: {
    color: '#666666',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 3,
    fontWeight: '700',
    marginLeft: 16,
  },
  scroll: { flex: 1 },
  scrollContent: {},
  sectionWrap: {},
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  infoButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
  },
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  synergyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringWrap: {
    marginRight: 16,
  },
  synergyTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  synergyScore: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '300',
  },
  synergyLabel: {
    color: '#666666',
    fontSize: 14,
    marginTop: 2,
  },
  thisWeekBest: {
    color: '#999999',
    fontSize: 13,
    marginTop: 16,
    marginBottom: 4,
  },
  bestDayRow: {
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 8,
  },
  nextGoal: {
    color: '#999999',
    fontSize: 13,
    marginTop: 12,
  },
  emptyHint: {
    color: '#999999',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 8,
  },
  stackContainer: {},
  block: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  blockCount: {
    fontSize: 14,
  },
  dropdown: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111111',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownArrow: { color: '#666666', fontSize: 10 },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  metricLabel: {
    color: '#666666',
    fontSize: 12,
    marginTop: 4,
  },
  periodToggleRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
  },
  periodToggle: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  periodToggleActive: {
    backgroundColor: '#2A2A2A',
  },
  periodToggleText: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  periodToggleTextActive: {
    color: '#FFFFFF',
  },
  periodNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  navArrow: {
    padding: 4,
  },
  navArrowText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 24,
  },
  navArrowTextDisabled: {
    color: '#333333',
  },
  periodLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 140,
    textAlign: 'center',
  },
  chartWrap: {
    marginTop: 16,
    height: 200,
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCard: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: 16,
  },
  pickerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  pickerItemText: { color: '#FFFFFF', fontSize: 14 },
  pickerClose: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pickerCloseText: { color: '#666', fontSize: 12 },
  infoCard: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  infoBody: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoTable: {
    gap: 10,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRowLabel: {
    color: '#CCCCCC',
    fontSize: 13,
  },
  infoRowValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  infoFooter: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  infoCloseButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444444',
  },
  infoCloseText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
