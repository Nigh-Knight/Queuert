import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import { Header } from '../atoms/Header';
import { StatusCard } from '../atoms/StatusCard';
import { CustomButton } from '../atoms/CustomButton';

export interface LaundryStatusScreenProps {
  placeInLine: number;
  estimatedWaitTime: string;
  machineNumber: number;
  machineStatus: string;
  machineTimeRemaining: string;
  onEndWash?: () => void;
  onBack?: () => void;
}

export function LaundryStatusScreen({
  placeInLine,
  estimatedWaitTime,
  machineNumber,
  machineStatus,
  machineTimeRemaining,
  onEndWash,
  onBack,
}: LaundryStatusScreenProps) {
  const [timeRemaining, setTimeRemaining] = useState(machineTimeRemaining);
  const [isEndingWash, setIsEndingWash] = useState(false);

  // Simulate countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const [minutes, seconds] = prev.split(':').map(Number);
        const totalSeconds = minutes * 60 + seconds - 1;

        if (totalSeconds <= 0) {
          clearInterval(interval);
          return '0:00';
        }

        const newMinutes = Math.floor(totalSeconds / 60);
        const newSeconds = totalSeconds % 60;
        return `${newMinutes}:${newSeconds.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleEndWash = async () => {
    setIsEndingWash(true);
    // Simulate API call
    setTimeout(() => {
      setIsEndingWash(false);
      onEndWash?.();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Queue Status" onBackPress={onBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.headerIcon}>📍</Text>
          <Text style={styles.headerText}>Your laundry is being processed</Text>
        </View>

        <View style={styles.statusCardsContainer}>
          <StatusCard
            status="Queued"
            label="Your Place in Line"
            value={`#${placeInLine}`}
            icon="🎟️"
          />

          <StatusCard
            status="Waiting"
            label="Estimated Wait Time"
            value={estimatedWaitTime}
            icon="⏱️"
          />
        </View>

        <Text style={styles.sectionTitle}>Machine Details</Text>

        <View style={styles.machineCard}>
          <View style={styles.machineHeader}>
            <Text style={styles.machineIcon}>🧺</Text>
            <Text style={styles.machineName}>Machine #{machineNumber}</Text>
          </View>

          <View style={styles.machineStatusRow}>
            <View style={styles.statusBadgeContainer}>
              <View
                style={[
                  styles.statusDot,
                  machineStatus === 'Washing' && styles.statusDotActive,
                ]}
              />
              <Text style={styles.statusLabel}>{machineStatus}</Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Time Remaining</Text>
            <Text style={styles.timerValue}>{timeRemaining}</Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((Number(machineTimeRemaining.split(':')[0]) * 60 +
                      Number(machineTimeRemaining.split(':')[1]) -
                      (Number(timeRemaining.split(':')[0]) * 60 +
                        Number(timeRemaining.split(':')[1]))) /
                      (Number(machineTimeRemaining.split(':')[0]) * 60 +
                        Number(machineTimeRemaining.split(':')[1]))) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            A service provider has been assigned and will help you when your load is ready. You'll receive a notification when it's time to transfer to the dryer.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          label="End Wash Early"
          onPress={handleEndWash}
          variant="alert"
          isLoading={isEndingWash}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  headerText: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: Typography.h2.lineHeight,
  },
  statusCardsContainer: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  machineCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  machineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  machineIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  machineName: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  machineStatusRow: {
    marginBottom: Spacing.lg,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
  },
  statusDotActive: {
    backgroundColor: Colors.primary,
  },
  statusLabel: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  timerContainer: {
    marginBottom: Spacing.lg,
  },
  timerLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  timerValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  infoContainer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
    borderRadius: ComponentSize.cardRadius,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    lineHeight: Typography.caption.lineHeight,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
