import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { StatCard } from '../atoms/StatCard';

export interface EventDashboardScreenProps {
  eventName: string;
  eventDate: string;
  totalInQueue: number;
  activeWashes: number;
  availableMachines: number;
  onViewQueue: () => void;
  onAddNewUser: () => void;
  onGenerateQRCode: () => void;
}

export function EventDashboardScreen({
  eventName,
  eventDate,
  totalInQueue,
  activeWashes,
  availableMachines,
  onViewQueue,
  onAddNewUser,
  onGenerateQRCode,
}: EventDashboardScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Event Info Card */}
      <View style={styles.eventCard}>
        <Text style={styles.eventName}>{eventName}</Text>
        <Text style={styles.eventDate}>{eventDate}</Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard
            icon={<Text style={styles.statIcon}>👥</Text>}
            value={totalInQueue}
            label="Total in Queue"
            containerStyle={styles.statCard}
          />
          <StatCard
            icon={<Text style={styles.statIcon}>🧺</Text>}
            value={activeWashes}
            label="Active Washes"
            containerStyle={styles.statCard}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon={<Text style={styles.statIcon}>✓</Text>}
            value={availableMachines}
            label="Available Machines"
            containerStyle={[styles.statCard, styles.statCardSingle]}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <CustomButton
          label="View Queue"
          onPress={onViewQueue}
          variant="primary"
          style={styles.actionButton}
        />
        <CustomButton
          label="Add New User"
          onPress={onAddNewUser}
          variant="secondary"
          style={styles.actionButton}
        />
        <CustomButton
          label="Generate QR Code"
          onPress={onGenerateQRCode}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  eventCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  eventName: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  eventDate: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
  },
  statsContainer: {
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  statCardSingle: {
    maxWidth: '48%',
    marginLeft: Spacing.xs,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
});
