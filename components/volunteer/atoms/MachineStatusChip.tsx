import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

export interface MachineStatusChipProps {
  machineNumber: string;
  machineType: 'washer' | 'dryer';
  userName: string;
  timeRemaining: string;
  containerStyle?: ViewStyle;
}

export function MachineStatusChip({
  machineNumber,
  machineType,
  userName,
  timeRemaining,
  containerStyle,
}: MachineStatusChipProps) {
  const machineIcon = machineType === 'washer' ? '🧺' : '🌀';

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.content}>
        {/* Machine icon placeholder */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{machineIcon}</Text>
        </View>
        <Text style={styles.text}>
          {machineNumber}
        </Text>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.text}>
          {userName}
        </Text>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.text}>
          {timeRemaining}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 6,
    paddingHorizontal: 13,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 16,
    height: 16,
    marginRight: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.primary,
    fontWeight: '400',
  },
  separator: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    marginHorizontal: Spacing.xs,
  },
});
