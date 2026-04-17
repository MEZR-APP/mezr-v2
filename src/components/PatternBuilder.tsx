/**
 * Mezr App - Pattern Builder Component
 * Modal for creating and editing breathing patterns
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme/colors';
import { Modal } from './ui/Modal';
import { useAppStore } from '../stores/appStore';
import { useBreathStore, useFormState } from '../stores/breathStore';

export const PatternBuilder: React.FC = () => {
  const showToast = useAppStore((state) => state.showToast);
  
  const showPatternBuilder = useBreathStore((state) => state.showPatternBuilder);
  const editingPattern = useBreathStore((state) => state.editingPattern);
  const closePatternBuilder = useBreathStore((state) => state.closePatternBuilder);
  const updateFormField = useBreathStore((state) => state.updateFormField);
  const savePattern = useBreathStore((state) => state.savePattern);
  
  const formState = useFormState();

  const handleSave = async () => {
    const result = await savePattern();
    showToast(result.message);
  };

  return (
    <Modal visible={showPatternBuilder} onClose={closePatternBuilder} animationType="slide">
      <View style={styles.builderContainer}>
        <ScrollView
          contentContainerStyle={styles.builderScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.builderTitle}>
            {editingPattern ? 'EDIT PATTERN' : 'NEW PATTERN'}
          </Text>

          {/* Pattern Name */}
          <View style={styles.builderItem}>
            <Text style={styles.builderLabel}>Pattern Name</Text>
            <TextInput
              style={styles.builderInput}
              value={formState.patternName}
              onChangeText={(value) => updateFormField('patternName', value)}
              placeholder="Morning Breath"
              placeholderTextColor={colors.textDarker}
            />
          </View>

          <Text style={styles.builderSection}>TIMING</Text>

          {/* Inhale Duration */}
          <View style={styles.builderItem}>
            <Text style={styles.builderLabel}>Inhale (seconds)</Text>
            <TextInput
              style={styles.builderInput}
              value={formState.inhaleSec}
              onChangeText={(value) => updateFormField('inhaleSec', value)}
              keyboardType="decimal-pad"
              placeholder="2.5"
              placeholderTextColor={colors.textDarker}
            />
          </View>

          {/* Exhale Duration */}
          <View style={styles.builderItem}>
            <Text style={styles.builderLabel}>Exhale (seconds)</Text>
            <TextInput
              style={styles.builderInput}
              value={formState.exhaleSec}
              onChangeText={(value) => updateFormField('exhaleSec', value)}
              keyboardType="decimal-pad"
              placeholder="3"
              placeholderTextColor={colors.textDarker}
            />
          </View>

          <Text style={styles.builderSection}>CIRCUIT</Text>

          {/* Breath Cycles */}
          <View style={styles.builderItem}>
            <Text style={styles.builderLabel}>Breath Cycles</Text>
            <TextInput
              style={styles.builderInput}
              value={formState.cycles}
              onChangeText={(value) => updateFormField('cycles', value)}
              keyboardType="numeric"
              placeholder="25"
              placeholderTextColor={colors.textDarker}
            />
          </View>

          {/* Hold After Cycles */}
          <View style={styles.builderItem}>
            <Text style={styles.builderLabel}>Hold After Cycles (seconds, 0 to skip)</Text>
            <TextInput
              style={styles.builderInput}
              value={formState.hold1Sec}
              onChangeText={(value) => updateFormField('hold1Sec', value)}
              keyboardType="numeric"
              placeholder="90"
              placeholderTextColor={colors.textDarker}
            />
          </View>

          {/* Hold After Inhale */}
          <View style={styles.builderItem}>
            <Text style={styles.builderLabel}>Hold After Inhale (seconds, 0 to skip)</Text>
            <TextInput
              style={styles.builderInput}
              value={formState.hold2Sec}
              onChangeText={(value) => updateFormField('hold2Sec', value)}
              keyboardType="numeric"
              placeholder="15"
              placeholderTextColor={colors.textDarker}
            />
          </View>

          {/* Rest Duration */}
          <View style={styles.builderItem}>
            <Text style={styles.builderLabel}>Rest Between Sessions (seconds, 0 to skip)</Text>
            <TextInput
              style={styles.builderInput}
              value={formState.restSec}
              onChangeText={(value) => updateFormField('restSec', value)}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor={colors.textDarker}
            />
          </View>

          {/* Session Count */}
          <View style={styles.builderItem}>
            <Text style={styles.builderLabel}>Number of Sessions</Text>
            <TextInput
              style={styles.builderInput}
              value={formState.sessionCount}
              onChangeText={(value) => updateFormField('sessionCount', value)}
              keyboardType="numeric"
              placeholder="3"
              placeholderTextColor={colors.textDarker}
            />
          </View>

          {/* Buttons */}
          <View style={styles.builderButtons}>
            <TouchableOpacity
              style={styles.builderBtnSecondary}
              onPress={closePatternBuilder}
            >
              <Text style={styles.builderBtnSecondaryText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.builderBtnPrimary}
              onPress={handleSave}
            >
              <Text style={styles.builderBtnPrimaryText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  builderContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: colors.backgroundDark,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  builderScroll: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  builderTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '700',
    marginBottom: 30,
  },
  builderSection: {
    color: colors.textMuted,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 15,
  },
  builderItem: {
    width: '100%',
    marginBottom: 18,
  },
  builderLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 1,
  },
  builderInput: {
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    fontSize: 18,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  builderButtons: {
    flexDirection: 'row',
    marginTop: 30,
    width: '100%',
    justifyContent: 'space-between',
  },
  builderBtnSecondary: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 16,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  builderBtnSecondaryText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  builderBtnPrimary: {
    flex: 1,
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  builderBtnPrimaryText: {
    color: colors.buttonPrimaryText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default PatternBuilder;
