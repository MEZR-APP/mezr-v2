/**
 * Mezr App - Date Selector
 * Simple date navigation strip: ← Prev | Today / Date | Next →
 * @since v1.1.0
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

// ============================================
// HELPERS
// ============================================

function formatYMD(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function todayStr(): string {
  return formatYMD(new Date());
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return formatYMD(d);
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

function displayDate(dateStr: string): string {
  if (dateStr === todayStr()) return 'Today';
  const d = new Date(dateStr + 'T12:00:00');
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// ============================================
// PROPS
// ============================================

interface DateSelectorProps {
  /** Currently selected date in YYYY-MM-DD format. */
  selectedDate: string;
  /** Callback fired when the user navigates to a different date. */
  onDateChange: (date: string) => void;
}

// ============================================
// COMPONENT
// ============================================

/** Horizontal date navigation bar with prev / today / next controls. */
export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const isToday = selectedDate === todayStr();

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.navButton,
          pressed && styles.navButtonPressed,
        ]}
        onPress={() => onDateChange(addDays(selectedDate, -1))}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.navText}>‹</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.dateButton,
          pressed && !isToday && styles.dateButtonPressed,
        ]}
        onPress={() => {
          if (!isToday) onDateChange(todayStr());
        }}
      >
        <Text style={[styles.dateText, isToday && styles.dateTextToday]}>
          {displayDate(selectedDate)}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.navButton,
          pressed && !isToday && styles.navButtonPressed,
          isToday && styles.navButtonDisabled,
        ]}
        onPress={() => {
          if (!isToday) onDateChange(addDays(selectedDate, 1));
        }}
        disabled={isToday}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.navText, isToday && styles.navTextDisabled]}>
          ›
        </Text>
      </Pressable>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonPressed: {
    backgroundColor: '#2A2A2A',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
  },
  navTextDisabled: {
    color: '#333333',
  },
  dateButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dateButtonPressed: {
    backgroundColor: '#1A1A1A',
  },
  dateText: {
    color: '#AAAAAA',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  dateTextToday: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default DateSelector;
