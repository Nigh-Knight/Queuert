/**
 * User Details Screen (Volunteer Flow)
 *
 * Shows detailed information about a user in the queue
 * and allows volunteers to update laundry status.
 */

import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import type { Id } from '@/convex/_generated/dataModel';

// Components
import { Header } from '@/components/provider/atoms/Header';
import { InputField } from '@/components/provider/atoms/InputField';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { InfoRow } from '@/components/volunteer/atoms/InfoRow';
import { StatusBadge } from '@/components/volunteer/atoms/StatusBadge';
import { TimerDisplay } from '@/components/volunteer/atoms/TimerDisplay';

export default function UserDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ queueId: string; sessionId: string }>();

  const [serviceNotes, setServiceNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get queue data
  const queueData = useQuery(
    api.queue.getActiveQueue,
    params.sessionId ? { sessionId: params.sessionId as Id<'sessions'> } : 'skip'
  );

  // Find the specific queue item
  const queueItem = useMemo(() => {
    if (!queueData || !params.queueId) return null;
    return queueData.find((item: any) => item._id === params.queueId);
  }, [queueData, params.queueId]);

  // Mutations
  const endCycleMutation = useMutation(api.queue.endCycle);
  const removeFromQueueMutation = useMutation(api.queue.removeFromQueue);

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!queueItem?.timerStartedAt || !queueItem?.timerDuration) return null;
    const elapsed = Date.now() - queueItem.timerStartedAt;
    const remaining = queueItem.timerDuration - elapsed;
    if (remaining <= 0) return '0:00';
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [queueItem]);

  const handleEndCycle = async () => {
    if (!params.queueId) return;
    setIsLoading(true);
    try {
      await endCycleMutation({ queueId: params.queueId as Id<'queue'> });
      Alert.alert('Success', 'Cycle ended successfully');
    } catch {
      Alert.alert('Error', 'Failed to end cycle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!params.queueId) return;

    Alert.alert(
      'Remove User',
      'Are you sure you want to remove this user from the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await removeFromQueueMutation({ queueId: params.queueId as Id<'queue'> });
              Alert.alert('Success', 'User removed from queue', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert('Error', 'Failed to remove user');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (!queueItem) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const user = queueItem.user;
  const intake = queueItem.intake;
  const displayStatus = queueItem.status === 'ready_to_remove' ? 'done' : queueItem.status;

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <Header title="User Details" />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Registration Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Data</Text>
          <View style={styles.card}>
            <InfoRow
              label="Name"
              value={`${user?.firstName || ''} ${user?.lastName || ''}`}
            />
            <InfoRow
              label="Living Condition"
              value={intake?.livingCondition || 'Not specified'}
            />
            <InfoRow
              label="Estimated Loads"
              value={String(intake?.estimatedLaundryLoads || 0)}
            />
            <InfoRow
              label="Weight"
              value={
                intake?.estimatedLaundryWeightLbs
                  ? `${intake.estimatedLaundryWeightLbs} lbs`
                  : 'Not provided'
              }
              showDivider={false}
            />
          </View>
        </View>

        {/* Current Laundry Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Laundry Status</Text>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Status</Text>
              <StatusBadge
                status={displayStatus as 'waiting' | 'washing' | 'drying' | 'done'}
              />
            </View>

            {timeRemaining && (
              <>
                <View style={styles.divider} />
                <View style={styles.statusRow}>
                  <Text style={styles.label}>Time Remaining</Text>
                  <TimerDisplay timeRemaining={timeRemaining} />
                </View>
              </>
            )}

            {queueItem.machineNumber && (
              <>
                <View style={styles.divider} />
                <View style={styles.statusRow}>
                  <Text style={styles.label}>Machine</Text>
                  <Text style={styles.value}>
                    {queueItem.machineType === 'washer' ? 'Washer' : 'Dryer'} #
                    {queueItem.machineNumber}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <Text style={styles.label}>Queue Position</Text>
              <Text style={styles.value}>#{queueItem.position}</Text>
            </View>
          </View>
        </View>

        {/* Service Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Notes</Text>
          <InputField
            placeholder="Add any notes about this service"
            value={serviceNotes}
            onChangeText={setServiceNotes}
            multiline
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {(queueItem.status === 'washing' || queueItem.status === 'drying') && (
            <CustomButton
              label="End Cycle"
              onPress={handleEndCycle}
              variant="primary"
              isLoading={isLoading}
              style={styles.actionButton}
            />
          )}

          <CustomButton
            label="Remove from Queue"
            onPress={handleRemove}
            variant="alert"
            isLoading={isLoading}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: ComponentSize.cardRadius,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  label: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  value: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
    marginVertical: Spacing.sm,
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
});
