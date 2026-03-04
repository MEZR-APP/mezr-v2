/**
 * Mezr App - Timeline Screen
 * Infinite-scroll daily timeline with activity cards, date navigation,
 * quick-add modal, and detail view.
 * @since v1.1.0
 * @see DECISIONS.md#D008
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal as RNModal,
  StyleSheet,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import useTimelineStore from '../stores/timelineStore';
import type { TimelineActivity } from '../types/timeline';
import { getCategoryLabel, getCategoryIcon } from '../constants/timeline';
import { colors } from '../theme/colors';

import { DateSelector } from './DateSelector';
import { TimelineEntry } from './TimelineEntry';
import { QuickAddModal } from './QuickAddModal';

// ============================================
// HELPERS
// ============================================

function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function durationLabel(startMs: number, endMs: number): string {
  const mins = Math.round((endMs - startMs) / 60_000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ============================================
// COMPONENT
// ============================================

/** Main timeline view rendered when the timeline tab is active. */
export default function TimelineScreen() {
  // ---- Store ----
  const activities = useTimelineStore((s) => s.activities);
  const selectedDate = useTimelineStore((s) => s.selectedDate);
  const isLoading = useTimelineStore((s) => s.isLoading);
  const error = useTimelineStore((s) => s.error);
  const setSelectedDate = useTimelineStore((s) => s.setSelectedDate);
  const addActivity = useTimelineStore((s) => s.addActivity);
  const editActivity = useTimelineStore((s) => s.editActivity);
  const deleteActivity = useTimelineStore((s) => s.deleteActivity);
  const loadActivitiesForDate = useTimelineStore((s) => s.loadActivitiesForDate);
  const clearError = useTimelineStore((s) => s.clearError);

  // ---- Derived ----
  const sortedActivities = useMemo(
    () =>
      activities
        .filter((a) => a.date === selectedDate)
        .sort((a, b) => a.startTime - b.startTime),
    [activities, selectedDate],
  );

  // ---- Local state ----
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TimelineActivity | null>(null);
  const [detailActivity, setDetailActivity] = useState<TimelineActivity | null>(null);

  // Ensure store state is fresh when the screen mounts
  useEffect(() => {
    loadActivitiesForDate(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss errors after 4 seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(clearError, 4_000);
    return () => clearTimeout(t);
  }, [error, clearError]);

  // ---- Handlers ----
  const handleDateChange = useCallback(
    (date: string) => setSelectedDate(date),
    [setSelectedDate],
  );

  const handleRefresh = useCallback(
    () => loadActivitiesForDate(selectedDate),
    [loadActivitiesForDate, selectedDate],
  );

  const handleTap = useCallback((activity: TimelineActivity) => {
    setDetailActivity(activity);
  }, []);

  const handleEdit = useCallback((activity: TimelineActivity) => {
    setEditingActivity(activity);
    setQuickAddVisible(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Activity', 'Remove this activity from your timeline?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteActivity(id);
            if (detailActivity?.id === id) setDetailActivity(null);
          },
        },
      ]);
    },
    [deleteActivity, detailActivity],
  );

  const handleSave = useCallback(
    async (data: Omit<TimelineActivity, 'id' | 'createdAt'>) => {
      if (editingActivity) {
        await editActivity(editingActivity.id, data);
      } else {
        await addActivity(data);
      }
      setQuickAddVisible(false);
      setEditingActivity(null);
    },
    [editingActivity, editActivity, addActivity],
  );

  const handleQuickAddClose = useCallback(() => {
    setQuickAddVisible(false);
    setEditingActivity(null);
  }, []);

  // ---- Render helpers ----
  const renderItem = useCallback(
    ({ item }: { item: TimelineActivity }) => (
      <TimelineEntry
        activity={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTap={handleTap}
      />
    ),
    [handleEdit, handleDelete, handleTap],
  );

  const keyExtractor = useCallback((item: TimelineActivity) => item.id, []);

  // ---- JSX ----
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TIMELINE</Text>
      </View>

      {/* Date navigation */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Error banner */}
      {error && (
        <Pressable style={styles.errorBanner} onPress={clearError}>
          <Text style={styles.errorText}>{error}</Text>
        </Pressable>
      )}

      {/* Activity list */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <FlatList
          data={sortedActivities}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={
            sortedActivities.length === 0
              ? styles.emptyContainer
              : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No activities today</Text>
              <Text style={styles.emptyHint}>
                Start breathing, or tap + to log manually.
              </Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={handleRefresh}
          onEndReached={() => {}}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB — Add Activity */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => {
          setEditingActivity(null);
          setQuickAddVisible(true);
        }}
      >
        <Plus size={24} color="#000000" />
      </Pressable>

      {/* Quick-add / edit modal */}
      <QuickAddModal
        isVisible={quickAddVisible}
        onClose={handleQuickAddClose}
        onSave={handleSave}
        selectedDate={selectedDate}
        initialActivity={editingActivity ?? undefined}
      />

      {/* Detail modal */}
      <DetailModal
        activity={detailActivity}
        onClose={() => setDetailActivity(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </View>
  );
}

// ============================================
// DETAIL MODAL (inline — only used here)
// ============================================

function DetailModal({
  activity,
  onClose,
  onEdit,
  onDelete,
}: {
  activity: TimelineActivity | null;
  onClose: () => void;
  onEdit: (a: TimelineActivity) => void;
  onDelete: (id: string) => void;
}) {
  if (!activity) return null;

  return (
    <RNModal
      visible={Boolean(activity)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.detailOverlay} onPress={onClose}>
        <View
          style={styles.detailCard}
          onStartShouldSetResponder={() => true}
        >
          {/* Color accent */}
          <View
            style={[styles.detailAccent, { backgroundColor: activity.color }]}
          />

          <Text style={styles.detailTitle}>{activity.title}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>
              {getCategoryIcon(activity.category)}{' '}
              {getCategoryLabel(activity.category)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>
              {formatTime(activity.startTime)} – {formatTime(activity.endTime)}{' '}
              ({durationLabel(activity.startTime, activity.endTime)})
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Source</Text>
            <Text style={styles.detailValue}>
              {activity.isManual ? 'Manual entry' : 'Auto-logged'}
            </Text>
          </View>

          {activity.notes ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailNotes}>{activity.notes}</Text>
            </View>
          ) : null}

          {/* Actions */}
          <View style={styles.detailActions}>
            <Pressable
              style={({ pressed }) => [
                styles.detailBtn,
                pressed && styles.detailBtnPressed,
              ]}
              onPress={() => {
                onClose();
                onEdit(activity);
              }}
            >
              <Text style={styles.detailBtnText}>EDIT</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.detailBtn,
                styles.detailBtnDanger,
                pressed && styles.detailBtnDangerPressed,
              ]}
              onPress={() => {
                onClose();
                onDelete(activity.id);
              }}
            >
              <Text style={styles.detailBtnDangerText}>DELETE</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.detailClose,
              pressed && { opacity: 0.6 },
            ]}
            onPress={onClose}
          >
            <Text style={styles.detailCloseText}>CLOSE</Text>
          </Pressable>
        </View>
      </Pressable>
    </RNModal>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
  },

  // Error banner
  errorBanner: {
    backgroundColor: colors.dangerBackground,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 12,
    textAlign: 'center',
  },

  // List
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyWrap: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyHint: {
    color: '#666666',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabPressed: {
    backgroundColor: '#DDDDDD',
    transform: [{ scale: 0.95 }],
  },

  // Detail modal
  detailOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCard: {
    width: '88%',
    maxWidth: 380,
    backgroundColor: colors.backgroundDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 24,
    overflow: 'hidden',
  },
  detailAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  detailTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 4,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 3,
  },
  detailValue: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  detailNotes: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
  },
  detailActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  detailBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
  },
  detailBtnPressed: {
    backgroundColor: '#2A2A2A',
  },
  detailBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  detailBtnDanger: {
    backgroundColor: colors.dangerBackground,
  },
  detailBtnDangerPressed: {
    backgroundColor: '#2A0000',
  },
  detailBtnDangerText: {
    color: colors.dangerText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  detailClose: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  detailCloseText: {
    color: '#666666',
    fontSize: 11,
    letterSpacing: 1,
  },
});
