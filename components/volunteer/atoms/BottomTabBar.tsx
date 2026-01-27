import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/constants/theme';

export type TabKey = 'dashboard' | 'queue' | 'qrcode';

export interface TabItem {
  key: TabKey;
  label: string;
  icon: string;
}

export interface BottomTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
}

const tabs: TabItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'queue', label: 'Queue', icon: '📋' },
  { key: 'qrcode', label: 'QR Code', icon: '📱' },
];

export function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || Spacing.sm }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            <Text style={[styles.key, isActive && styles.keyActive]}>
              {tab.key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  icon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  key: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontSize: 10,
    opacity: 0.6,
  },
  keyActive: {
    color: Colors.primary,
    opacity: 1,
  },
});
