/**
 * Mezr App - Reusable Button Component
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'large',
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.button_disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.text_disabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
  },
  
  // Variants
  button_primary: {
    backgroundColor: colors.buttonPrimary,
  },
  button_secondary: {
    backgroundColor: colors.backgroundElevated,
  },
  button_danger: {
    backgroundColor: colors.dangerBackground,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  button_small: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  button_medium: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
  },
  button_large: {
    paddingHorizontal: 60,
    paddingVertical: 20,
    borderRadius: 40,
    minWidth: 220,
  },
  
  // Disabled
  button_disabled: {
    opacity: 0.5,
  },
  
  // Text base
  text: {
    fontWeight: '700',
    letterSpacing: 2,
  },
  
  // Text variants
  text_primary: {
    color: colors.buttonPrimaryText,
  },
  text_secondary: {
    color: colors.textMuted,
  },
  text_danger: {
    color: colors.dangerText,
  },
  text_ghost: {
    color: colors.textMuted,
  },
  
  // Text sizes
  text_small: {
    fontSize: 10,
    letterSpacing: 1.5,
  },
  text_medium: {
    fontSize: 12,
  },
  text_large: {
    fontSize: 13,
    fontWeight: '800',
  },
  
  // Text disabled
  text_disabled: {
    opacity: 0.7,
  },
});

export default Button;
