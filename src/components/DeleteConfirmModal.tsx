/**
 * Mezr App - Delete Confirmation Modal Component
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Modal } from './ui/Modal';
import { useAppStore } from '../stores/appStore';
import { useBreathStore } from '../stores/breathStore';

export const DeleteConfirmModal: React.FC = () => {
  const showToast = useAppStore((state) => state.showToast);
  
  const showDeleteConfirm = useBreathStore((state) => state.showDeleteConfirm);
  const patternToDelete = useBreathStore((state) => state.patternToDelete);
  const closeDeleteConfirm = useBreathStore((state) => state.closeDeleteConfirm);
  const executeDelete = useBreathStore((state) => state.executeDelete);

  const handleDelete = async () => {
    await executeDelete();
    showToast('Pattern deleted');
  };

  const handleCancel = () => {
    closeDeleteConfirm();
  };

  return (
    <Modal visible={showDeleteConfirm} onClose={handleCancel} animationType="fade">
      <View style={styles.deleteConfirmContainer}>
        <Text style={styles.deleteConfirmTitle}>DELETE PATTERN</Text>
        <Text style={styles.deleteConfirmMessage}>
          Delete "{patternToDelete?.name}"?
        </Text>
        <View style={styles.deleteConfirmButtons}>
          <TouchableOpacity
            style={styles.deleteConfirmBtnCancel}
            onPress={handleCancel}
          >
            <Text style={styles.deleteConfirmBtnCancelText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteConfirmBtnDelete}
            onPress={handleDelete}
          >
            <Text style={styles.deleteConfirmBtnDeleteText}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  deleteConfirmContainer: {
    width: '85%',
    backgroundColor: colors.backgroundDark,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 30,
    alignItems: 'center',
  },
  deleteConfirmTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 20,
  },
  deleteConfirmMessage: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  deleteConfirmBtnCancel: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 16,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteConfirmBtnCancelText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  deleteConfirmBtnDelete: {
    flex: 1,
    backgroundColor: colors.dangerBackground,
    paddingVertical: 16,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  deleteConfirmBtnDeleteText: {
    color: colors.dangerText,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});

export default DeleteConfirmModal;
