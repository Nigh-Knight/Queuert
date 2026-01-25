import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, ComponentSize } from '@/constants/theme';

export interface MachineTypeCardProps {
  type: 'washer' | 'dryer';
  label: string;
  icon: ReactNode;
  isSelected: boolean;
  onPress: () => void;
  containerStyle?: ViewStyle;
}

export function MachineTypeCard({
  type,
  label,
  icon,
  isSelected,
  onPress,
  containerStyle,
}: MachineTypeCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected ? styles.containerSelected : styles.containerUnselected,
        containerStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon}
      <Text
        style={[
          styles.label,
          isSelected ? styles.labelSelected : styles.labelUnselected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 173,
    height: 92,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSelected: {
    backgroundColor: Colors.primary,
  },
  containerUnselected: {
    backgroundColor: Colors.surfaceLight,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  labelUnselected: {
    color: Colors.text.primary,
  },
});
