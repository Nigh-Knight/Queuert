/**
 * Volunteer Dashboard (Placeholder)
 *
 * Minimal placeholder for volunteer dashboard.
 * Full implementation comes in Phase 6 (Queue Management).
 *
 * Features:
 * - Display session info (location, status)
 * - Logout functionality
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SessionStorage } from '@/utils/session-storage';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import type { Id } from '@/convex/_generated/dataModel';

export default function VolunteerDashboard() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<Id<'sessions'> | null>(null);

  // Load session on mount
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const session = await SessionStorage.load();
    if (!session || session.role !== 'volunteer') {
      // No valid session, redirect to scan
      router.replace('./scan-qr');
      return;
    }
    setSessionId(session.sessionId as Id<'sessions'>);
  };

  // Get session details from Convex
  const session = useQuery(
    api.sessions.getSessionById,
    sessionId ? { sessionId } : 'skip'
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await SessionStorage.clear();
            router.replace('./scan-qr');
          },
        },
      ]
    );
  };

  // Loading state
  if (!sessionId || session === undefined) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Session not found or ended
  if (session === null || !session.isActive) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {session === null ? 'Session not found' : 'Session has ended'}
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>Scan New QR Code</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Volunteer Dashboard</Text>
      </View>

      {/* Session Info Card */}
      <View style={styles.content}>
        <View style={styles.sessionCard}>
          <Text style={styles.cardTitle}>Current Session</Text>

          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Location:</Text>
            <Text style={styles.sessionValue}>{session.location}</Text>
          </View>

          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Status:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          <View style={styles.sessionRow}>
            <Text style={styles.sessionLabel}>Access Code:</Text>
            <Text style={styles.sessionValue}>{session.accessCode}</Text>
          </View>
        </View>

        {/* Placeholder text */}
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Coming in Phase 6</Text>
          <Text style={styles.placeholderText}>
            Queue management, timer controls, and service user registration will be available here.
          </Text>
        </View>
      </View>

      {/* Logout button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
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
    padding: Spacing.xl,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl + Spacing.lg, // Account for status bar
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.background,
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  sessionCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sessionLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
    width: 120,
  },
  sessionValue: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: ComponentSize.buttonRadius,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
  },
  placeholderCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.xl,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  placeholderTitle: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  placeholderText: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + Spacing.lg, // Account for navigation bar
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: ComponentSize.buttonHeight,
    borderRadius: ComponentSize.buttonRadius,
    paddingHorizontal: Spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: Colors.alert,
    height: ComponentSize.buttonHeight,
    borderRadius: ComponentSize.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  errorText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
});
