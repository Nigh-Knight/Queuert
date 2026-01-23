import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ReactNode,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

export interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  rightElement?: ReactNode;
  containerStyle?: ViewStyle;
}

export function Header({
  title,
  onBackPress,
  rightElement,
  containerStyle,
}: HeaderProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.leftArea}>
        {onBackPress ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
      </View>

      <View style={styles.centerArea}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightArea}>
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leftArea: {
    flex: 1,
    justifyContent: 'center',
  },
  centerArea: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightArea: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: Spacing.sm,
  },
  backIcon: {
    fontSize: Typography.body.fontSize,
    color: Colors.primary,
    fontWeight: '500',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});
