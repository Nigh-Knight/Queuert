import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

export interface CycleDurationControlProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  label: string;
  containerStyle?: ViewStyle;
}

export function CycleDurationControl({
  value,
  onIncrement,
  onDecrement,
  label,
  containerStyle,
}: CycleDurationControlProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={onDecrement}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>
        
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>min</Text>
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={onIncrement}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 95,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.background,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    marginRight: Spacing.xs,
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
  },
});
