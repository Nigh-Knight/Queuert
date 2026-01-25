import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';

export interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  iconBackgroundColor?: string;
  containerStyle?: ViewStyle;
}

export function StatCard({
  icon,
  value,
  label,
  iconBackgroundColor,
  containerStyle,
}: StatCardProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.iconContainer,
          iconBackgroundColor && { backgroundColor: iconBackgroundColor },
        ]}
      >
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 124,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
