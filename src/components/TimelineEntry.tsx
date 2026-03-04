/**
 * Mezr App - Timeline Entry Card
 * Single activity block rendered inside the timeline FlatList.
 * @since v1.1.0
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import type { TimelineActivity } from '../types/timeline';
import { getCategoryLabel, getCategoryIcon } from '../constants/timeline';

// ============================================
// HELPERS
// ============================================

function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ============================================
// PROPS
// ============================================

interface TimelineEntryProps {
  /** The activity to render. */
  activity: TimelineActivity;
  /** Called when the user taps the edit icon (manual entries only). */
  onEdit: (activity: TimelineActivity) => void;
  /** Called when the user taps the delete icon. */
  onDelete: (id: string) => void;
  /** Called when the user taps the card body to view details. */
  onTap: (activity: TimelineActivity) => void;
}

// ============================================
// COMPONENT
// ============================================

/** Renders a single time-block card with a colored left bar. */
export const TimelineEntry: React.FC<TimelineEntryProps> = ({
  activity,
  onEdit,
  onDelete,
  onTap,
}) => {
  const timeRange = `${formatTime(activity.startTime)} – ${formatTime(activity.endTime)}`;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onTap(activity)}
    >
      <View style={[styles.colorBar, { backgroundColor: activity.color }]} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={styles.timeRange}>{timeRange}</Text>
        <Text style={[styles.categoryLabel, { color: activity.color }]}>
          {getCategoryLabel(activity.category)}
        </Text>
      </View>

      <View style={styles.actions}>
        {activity.isManual ? (
          <>
            <Pressable
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && styles.iconBtnPressed,
              ]}
              onPress={() => onEdit(activity)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Pencil size={15} color="#666666" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && styles.iconBtnPressed,
              ]}
              onPress={() => onDelete(activity.id)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Trash2 size={15} color="#666666" />
            </Pressable>
          </>
        ) : (
          <Text style={styles.moduleIcon}>
            {getCategoryIcon(activity.category)}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardPressed: {
    backgroundColor: '#111111',
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  info: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  timeRange: {
    color: '#999999',
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  actions: {
    paddingRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  iconBtnPressed: {
    backgroundColor: '#1A1A1A',
  },
  moduleIcon: {
    fontSize: 18,
  },
});

export default TimelineEntry;
