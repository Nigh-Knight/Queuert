import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { SessionStorage } from '@/utils/session-storage';
import { Colors, Typography, Spacing } from '@/constants/theme';

/**
 * Queue status screen for service users
 * Shows current position and wash status
 *
 * Flow: Registration → QR Scan → Status
 */
export default function StatusScreen() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Query session info
  const session = useQuery(
    api.sessions.getSessionById,
    sessionData?.sessionId ? { sessionId: sessionData.sessionId } : 'skip'
  );

  // Query user's queue position
  const queueEntry = useQuery(
    api.queue.getUserQueuePosition,
    sessionData?.userId ? { serviceUserId: sessionData.userId } : 'skip'
  );

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const data = await SessionStorage.load();
      if (data) {
        setSessionData(data);
      } else {
        // No session, redirect to registration
        router.replace('/(user)/registration');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      router.replace('/(user)/registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    Alert.alert(
      'Leave Queue',
      'Are you sure you want to leave the queue? You will need to register again to rejoin.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await SessionStorage.clear();
              router.replace('/(user)/registration');
            } catch (error) {
              console.error('Error clearing session:', error);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !session || queueEntry === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // User is not in queue
  if (queueEntry === null) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header title="Queue Status" />
        <View style={styles.content}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Not in Queue</Text>
            <Text style={styles.emptyText}>
              You are not currently in the queue. Please check with a volunteer if you need assistance.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Helper to show user-friendly status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Waiting in line';
      case 'washing': return 'Wash cycle in progress';
      case 'drying': return 'Drying in progress';
      case 'ready_to_remove': return 'Ready for pickup!';
      default: return status;
    }
  };

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return Colors.secondary;
      case 'washing': return Colors.primary;
      case 'drying': return Colors.primary;
      case 'ready_to_remove': return Colors.success;
      default: return Colors.secondary;
    }
  };

  // Helper to get contextual message based on position and status
  const getContextMessage = (position: number, status: string) => {
    if (status === 'ready_to_remove') {
      return "Your laundry is ready! Please come pick it up.";
    }
    if (status === 'washing' || status === 'drying') {
      return "Your laundry is being processed.";
    }
    if (position === 1) {
      return "You're next! Please be ready.";
    }
    if (position <= 3) {
      return "Almost there! Just a few more ahead of you.";
    }
    return "Please wait, we'll let you know when it's your turn.";
  };

  // Helper to calculate estimated wait time
  const getEstimatedWait = (position: number, status: string) => {
    if (status !== 'waiting' || position <= 1) return null;
    const minutes = (position - 1) * 25;
    return `Estimated wait: ~${minutes} minutes`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header title="Your Queue Status" />

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.locationLabel}>You're in the queue at</Text>
          <Text style={styles.locationName}>{session.location}</Text>

          <View style={styles.positionContainer}>
            <Text style={styles.positionLabel}>Your Position</Text>
            <Text style={styles.positionValue}>#{queueEntry.position}</Text>
          </View>

          <View style={styles.statusBadgeContainer}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(queueEntry.status) }]}>
              <Text style={styles.statusText}>{getStatusText(queueEntry.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            {getContextMessage(queueEntry.position, queueEntry.status)}
          </Text>
          {getEstimatedWait(queueEntry.position, queueEntry.status) && (
            <Text style={styles.estimatedWaitText}>
              {getEstimatedWait(queueEntry.position, queueEntry.status)}
            </Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What's Next?</Text>
          <Text style={styles.infoText}>
            • A volunteer will call your name when it's your turn{'\n'}
            • You'll be assigned a washing machine{'\n'}
            • We'll track your wash cycle time{'\n'}
            • You'll be notified when it's done
          </Text>
        </View>

        <View style={styles.sessionInfoCard}>
          <Text style={styles.sessionInfoTitle}>Session Details</Text>
          <Text style={styles.sessionInfoText}>
            Location: {session.location}{'\n'}
            Date: {new Date(session.scheduledDate).toLocaleDateString()}{'\n'}
            Status: {session.isActive ? 'Active' : 'Ended'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <CustomButton
          label="Leave Queue"
          onPress={handleLeaveQueue}
          variant="alert"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  statusCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.xxl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  locationLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  locationName: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xxl,
    textAlign: 'center',
  },
  positionContainer: {
    alignItems: 'center',
  },
  positionLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  positionValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  statusBadgeContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  statusLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: Typography.body.fontSize,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  messageText: {
    ...Typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  estimatedWaitText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  infoTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  infoText: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  sessionInfoCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.xl,
  },
  sessionInfoTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  sessionInfoText: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
