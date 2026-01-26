import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { SessionStorage } from '@/utils/session-storage';
import { Colors, Typography, Spacing } from '@/constants/theme';

/**
 * Placeholder queue status screen for service users
 * Full implementation in Phase 5 (Queue Management)
 */
export default function QueueStatusScreen() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Query session info
  const session = useQuery(
    api.sessions.getSessionById,
    sessionData?.sessionId ? { sessionId: sessionData.sessionId } : 'skip'
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
        // No session, redirect to scan
        router.replace('/(user)/scan-session');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      router.replace('/(user)/scan-session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await SessionStorage.clear();
      router.replace('/(user)/scan-session');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  if (isLoading || !session) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Your Queue Status" />

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.locationLabel}>You're in the queue at</Text>
          <Text style={styles.locationName}>{session.location}</Text>

          <View style={styles.positionContainer}>
            <Text style={styles.positionLabel}>Position</Text>
            <Text style={styles.positionValue}>--</Text>
            <Text style={styles.positionNote}>
              Queue position tracking coming soon
            </Text>
          </View>
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
  positionNote: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.xl,
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
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
