/**
 * Mezr App - Toast Notification Component
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../stores/appStore';

interface ToastProps {
  visible?: boolean;
  message?: string;
}

export const Toast: React.FC<ToastProps> = ({ visible, message }) => {
  // If props not provided, use store
  const storeToast = useAppStore((state) => state.toast);
  
  const isVisible = visible ?? storeToast.show;
  const displayMessage = message ?? storeToast.message;

  if (!isVisible) return null;

  return (
    <View style={styles.toast}>
      <Text style={styles.toastText}>{displayMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 100,
    left: '10%',
    right: '10%',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 20,
    borderRadius: 15,
    zIndex: 1000,
    alignItems: 'center',
  },
  toastText: {
    color: colors.textPrimary,
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default Toast;
