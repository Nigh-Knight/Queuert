import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';

interface SessionCardProps {
  location: string;
  scheduledDate: number;
  volunteerCount: number;
  isActive: boolean;
  onPress: () => void;
}

export function SessionCard({
  location,
  scheduledDate,
  volunteerCount,
  isActive,
  onPress,
}: SessionCardProps) {
  const locationName = location === 'kams' ? 'KAMS' : 'STAR';
  const date = new Date(scheduledDate);
  const dateString = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Text style={styles.locationName}>{locationName}</Text>
          <View style={[styles.statusBadge, isActive && styles.statusBadgeActive]}>
            <Text style={[styles.statusText, isActive && styles.statusTextActive]}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Scheduled</Text>
          <Text style={styles.value}>{dateString} at {timeString}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Volunteers</Text>
          <Text style={styles.value}>{volunteerCount} QR codes</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.actionText}>View Details</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: ComponentSize.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  header: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationName: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
  },
  statusBadgeActive: {
    backgroundColor: Colors.success,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#fff',
  },
  content: {
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  value: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  actionText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});
