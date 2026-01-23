import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  ReactNode,
} from 'react-native';
import { Colors, Typography, ComponentSize, Spacing } from '@/constants/theme';

export interface RoleCardProps {
  icon: ReactNode | string;
  title: string;
  description: string;
  onPress: () => void;
  isSelected?: boolean;
  containerStyle?: ViewStyle;
}

export function RoleCard({
  icon,
  title,
  description,
  onPress,
  isSelected = false,
  containerStyle,
}: RoleCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        containerStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {typeof icon === 'string' ? (
          <Text style={styles.iconText}>{icon}</Text>
        ) : (
          icon
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: ComponentSize.cardRadius,
    marginBottom: Spacing.lg,
  },
  containerSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  iconText: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    lineHeight: Typography.body.lineHeight,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.lg,
  },
  checkmarkText: {
    color: Colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
});
