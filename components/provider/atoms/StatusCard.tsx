import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  ReactNode,
} from 'react-native';
import { Colors, Typography, ComponentSize, Spacing } from '@/constants/theme';

export interface StatusCardProps {
  status: string;
  label: string;
  value: string | ReactNode;
  icon?: ReactNode | string;
  containerStyle?: ViewStyle;
}

export function StatusCard({
  status,
  label,
  value,
  icon,
  containerStyle,
}: StatusCardProps) {
  const getStatusColor = (statusValue: string) => {
    const lowerStatus = statusValue.toLowerCase();
    if (lowerStatus.includes('washing') || lowerStatus.includes('running')) {
      return Colors.primary;
    }
    if (lowerStatus.includes('waiting') || lowerStatus.includes('pending')) {
      return Colors.secondary;
    }
    if (lowerStatus.includes('complete') || lowerStatus.includes('done')) {
      return Colors.success;
    }
    return Colors.secondary;
  };

  const statusColor = getStatusColor(status);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
        {icon && (
          <View style={styles.iconArea}>
            {typeof icon === 'string' ? (
              <Text style={styles.iconText}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {typeof value === 'string' ? (
          <Text style={styles.value}>{value}</Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: Typography.caption.fontSize,
  },
  iconArea: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  content: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: Typography.h1.fontSize,
    fontWeight: '700',
    color: Colors.text.primary,
  },
});
