/**
 * Mezr App - Module Picker Component
 * Modal for selecting modules within a category
 */

import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Modal } from './ui/Modal';
import { useAppStore, useFilteredModules } from '../stores/appStore';
import { useBreathStore } from '../stores/breathStore';
import { CATEGORIES } from '../constants/modules';
import type { ModuleId } from '../types';

export const ModulePicker: React.FC = () => {
  const showModulePicker = useAppStore((state) => state.showModulePicker);
  const setShowModulePicker = useAppStore((state) => state.setShowModulePicker);
  const currentCategory = useAppStore((state) => state.currentCategory);
  const currentModule = useAppStore((state) => state.currentModule);
  const setModule = useAppStore((state) => state.setModule);
  const setIsActive = useAppStore((state) => state.setIsActive);
  
  const resetBreathSession = useBreathStore((state) => state.resetSession);
  
  const filteredModules = useFilteredModules();
  const categoryLabel = CATEGORIES.find((c) => c.id === currentCategory)?.label;

  const handleSelectModule = (moduleId: ModuleId) => {
    setModule(moduleId);
    setShowModulePicker(false);
    resetBreathSession();
    setIsActive(false);
  };

  const handleClose = () => {
    setShowModulePicker(false);
  };

  return (
    <Modal visible={showModulePicker} onClose={handleClose} animationType="fade">
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerTitle}>{categoryLabel}</Text>
        
        <FlatList
          data={filteredModules}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => handleSelectModule(item.id)}
            >
              <Text
                style={[
                  styles.pickerText,
                  currentModule === item.id && styles.activePickerText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Coming soon...</Text>
          }
        />
        
        <TouchableOpacity onPress={handleClose} style={styles.closePicker}>
          <Text style={styles.closePickerText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    width: '80%',
    height: '70%',
    alignItems: 'center',
  },
  pickerTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 5,
    marginBottom: 40,
    fontWeight: '600',
  },
  pickerItem: {
    paddingVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  pickerText: {
    color: colors.textDarker,
    fontSize: 28,
    fontWeight: '200',
    letterSpacing: 4,
  },
  activePickerText: {
    color: colors.textPrimary,
  },
  emptyText: {
    color: colors.textDark,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
  closePicker: {
    marginTop: 40,
    padding: 20,
  },
  closePickerText: {
    color: colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
  },
});

export default ModulePicker;
