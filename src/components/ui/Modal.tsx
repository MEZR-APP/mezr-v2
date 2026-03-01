/**
 * Mezr App - Reusable Modal Wrapper Component
 */

import React from 'react';
import { Modal as RNModal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../../theme/colors';

interface ModalProps {
  visible: boolean;
  onClose?: () => void;
  animationType?: 'none' | 'slide' | 'fade';
  children: React.ReactNode;
  closeOnOverlayPress?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  animationType = 'fade',
  children,
  closeOnOverlayPress = false,
}) => {
  const handleOverlayPress = () => {
    if (closeOnOverlayPress && onClose) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View>{children}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Modal;
