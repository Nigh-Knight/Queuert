import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, ComponentSize, Spacing } from '@/constants/theme';

export interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'alert';
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
}

export function CustomButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  isLoading = false,
  style,
}: CustomButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const variantStyle = styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
    const disabledStyle = disabled && styles.buttonDisabled;
    return [baseStyle, variantStyle, disabledStyle, style];
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = styles.buttonText;
    const variantStyle = styles[`buttonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
    const disabledStyle = disabled && styles.buttonTextDisabled;
    return [baseStyle, variantStyle, disabledStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'secondary' ? Colors.text.primary : '#FFFFFF'} />
      ) : (
        <Text style={getTextStyle()}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: ComponentSize.buttonHeight,
    borderRadius: ComponentSize.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonAlert: {
    backgroundColor: Colors.alert,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: Colors.text.primary,
  },
  buttonTextAlert: {
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: Colors.text.disabled,
  },
});
