import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

export interface TimerDisplayProps {
  timeRemaining: string;
  label?: string;
  containerStyle?: ViewStyle;
}

export function TimerDisplay({
  timeRemaining,
  label,
  containerStyle,
}: TimerDisplayProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Timer icon placeholder - will be replaced with actual icon */}
      <View style={styles.iconPlaceholder}>
        <Text style={styles.iconText}>⏱</Text>
      </View>
      <Text style={styles.time}>{timeRemaining}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 16,
    height: 16,
    marginRight: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  time: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  label: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
});
