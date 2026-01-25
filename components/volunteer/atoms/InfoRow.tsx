import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

export interface InfoRowProps {
  label: string;
  value: string | ReactNode;
  showDivider?: boolean;
  containerStyle?: ViewStyle;
}

export function InfoRow({
  label,
  value,
  showDivider = true,
  containerStyle,
}: InfoRowProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {typeof value === 'string' ? (
          <Text style={styles.value}>{value}</Text>
        ) : (
          value
        )}
      </View>
      {showDivider && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    fontWeight: '400',
  },
  value: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
});
