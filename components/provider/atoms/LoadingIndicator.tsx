import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Modal,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

export interface LoadingIndicatorProps {
  visible: boolean;
  message?: string;
  containerStyle?: ViewStyle;
}

export function LoadingIndicator({
  visible,
  message,
  containerStyle,
}: LoadingIndicatorProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.container, containerStyle]}>
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.spinner}
          />
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    minWidth: 200,
  },
  spinner: {
    marginBottom: Spacing.lg,
  },
  message: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
});
