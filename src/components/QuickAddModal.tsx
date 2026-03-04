/**
 * Mezr App - Quick Add / Edit Activity Modal
 * Pressable-overlay modal for creating or editing a manual timeline entry.
 * @since v1.1.0
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal as RNModal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { TimelineActivity, TimelineCategory } from '../types/timeline';
import {
  getCategoryColor,
  getCategoryLabel,
  CATEGORY_COLORS,
} from '../constants/timeline';
import { colors } from '../theme/colors';

// ============================================
// CONSTANTS
// ============================================

const ALL_CATEGORIES: TimelineCategory[] = [
  'breathwork',
  'movement',
  'mindfulness',
  'work',
  'gym',
  'other',
];

// ============================================
// HELPERS
// ============================================

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function plusOneHourHHMM(): string {
  const d = new Date(Date.now() + 3_600_000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatTimeFromMs(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function parseTimeToMs(dateStr: string, timeStr: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  const d = new Date(dateStr + 'T00:00:00');
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

// ============================================
// PROPS
// ============================================

interface QuickAddModalProps {
  /** Controls modal visibility. */
  isVisible: boolean;
  /** Close the modal. */
  onClose: () => void;
  /** Called with the composed activity data (id/createdAt omitted). */
  onSave: (activity: Omit<TimelineActivity, 'id' | 'createdAt'>) => void;
  /** The date the activity will be assigned to (YYYY-MM-DD). */
  selectedDate: string;
  /** When provided, the modal opens in edit mode with pre-filled values. */
  initialActivity?: TimelineActivity;
}

// ============================================
// COMPONENT
// ============================================

/** Full-screen overlay modal for adding or editing a timeline activity. */
export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isVisible,
  onClose,
  onSave,
  selectedDate,
  initialActivity,
}) => {
  const isEditing = Boolean(initialActivity);

  const [category, setCategory] = useState<TimelineCategory>('other');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(nowHHMM());
  const [endTime, setEndTime] = useState(plusOneHourHHMM());
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isVisible) return;
    if (initialActivity) {
      setCategory(initialActivity.category);
      setTitle(initialActivity.title);
      setStartTime(formatTimeFromMs(initialActivity.startTime));
      setEndTime(formatTimeFromMs(initialActivity.endTime));
      setNotes(initialActivity.notes ?? '');
    } else {
      setCategory('other');
      setTitle('');
      setStartTime(nowHHMM());
      setEndTime(plusOneHourHHMM());
      setNotes('');
    }
    setFormError('');
  }, [isVisible, initialActivity]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Title is required');
      return;
    }

    const startMs = parseTimeToMs(selectedDate, startTime);
    const endMs = parseTimeToMs(selectedDate, endTime);

    if (startMs === null || endMs === null) {
      setFormError('Invalid time format (use HH:MM)');
      return;
    }
    if (endMs <= startMs) {
      setFormError('End time must be after start time');
      return;
    }

    setFormError('');
    onSave({
      date: selectedDate,
      startTime: startMs,
      endTime: endMs,
      category,
      module: null,
      title: trimmedTitle,
      notes: notes.trim() || undefined,
      color: getCategoryColor(category),
      isManual: true,
    });
  };

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Inner View claims the responder so taps inside don't close */}
        <View
          style={styles.card}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <Text style={styles.modalTitle}>
            {isEditing ? 'EDIT ACTIVITY' : 'ADD ACTIVITY'}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Category picker */}
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.categoryRow}>
              {ALL_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryChip,
                      active && { backgroundColor: getCategoryColor(cat), borderColor: getCategoryColor(cat) },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        active && styles.categoryChipTextActive,
                      ]}
                    >
                      {getCategoryLabel(cat)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Title */}
            <Text style={styles.fieldLabel}>TITLE</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Gym session"
              placeholderTextColor={colors.inputPlaceholder}
              maxLength={80}
            />

            {/* Time inputs */}
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>START (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
              <View style={styles.timeSpacer} />
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>END (HH:MM)</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="10:00"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            </View>

            {/* Notes */}
            <Text style={styles.fieldLabel}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes…"
              placeholderTextColor={colors.inputPlaceholder}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </ScrollView>

          {/* Error */}
          {formError !== '' && (
            <Text style={styles.errorText}>{formError}</Text>
          )}

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnCancel,
                pressed && styles.btnCancelPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.btnCancelText}>CANCEL</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnSave,
                pressed && styles.btnSavePressed,
              ]}
              onPress={handleSave}
            >
              <Text style={styles.btnSaveText}>
                {isEditing ? 'UPDATE' : 'SAVE'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </RNModal>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: colors.backgroundDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 24,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundElevated,
  },
  categoryChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  timeField: {
    flex: 1,
  },
  timeSpacer: {
    width: 12,
  },
  notesInput: {
    height: 80,
    paddingTop: 12,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: colors.backgroundElevated,
  },
  btnCancelPressed: {
    backgroundColor: '#2A2A2A',
  },
  btnCancelText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  btnSave: {
    backgroundColor: colors.buttonPrimary,
  },
  btnSavePressed: {
    backgroundColor: '#DDDDDD',
  },
  btnSaveText: {
    color: colors.buttonPrimaryText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default QuickAddModal;
