import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { Colors, Typography, ComponentSize, Spacing } from '@/constants/theme';

export interface InputFieldProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  multiline?: boolean;
  errorMessage?: string;
  containerStyle?: ViewStyle;
}

export function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  editable = true,
  multiline = false,
  errorMessage,
  containerStyle,
  ...rest
}: InputFieldProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          !editable && styles.inputDisabled,
          errorMessage && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.text.disabled}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        multiline={multiline}
        {...rest}
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  input: {
    height: ComponentSize.inputHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: ComponentSize.buttonRadius,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
    color: Colors.text.primary,
    backgroundColor: Colors.background,
  },
  inputMultiline: {
    height: 'auto',
    minHeight: ComponentSize.inputHeight * 1.5,
    paddingVertical: Spacing.md,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    backgroundColor: Colors.surfaceLight,
    color: Colors.text.disabled,
  },
  inputError: {
    borderColor: Colors.alert,
  },
  errorText: {
    color: Colors.alert,
    fontSize: Typography.caption.fontSize,
    marginTop: Spacing.sm,
  },
});
