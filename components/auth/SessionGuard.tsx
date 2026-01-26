import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Alert } from 'react-native';
import { useSessionValidation } from '@/hooks/useSessionValidation';
import { Colors, Typography, Spacing } from '@/constants/theme';

export interface SessionGuardProps {
  children: React.ReactNode;
  onSessionEnd?: () => void;
}

/**
 * Wrapper component that monitors session state
 *
 * Responsibilities:
 * - Show loading spinner while checking for session
 * - Monitor session state in real-time
 * - Show alert when session is ended by admin
 * - Provide session context to children
 */
export function SessionGuard({ children, onSessionEnd }: SessionGuardProps) {
  const { sessionData, isLoading, sessionEnded } = useSessionValidation();

  // Track if we've already shown the session ended alert
  const hasShownAlertRef = useRef(false);

  // Show session ended alert
  useEffect(() => {
    if (sessionEnded && !hasShownAlertRef.current) {
      hasShownAlertRef.current = true;

      Alert.alert(
        "Session Ended",
        "This session has been ended by the admin.",
        [
          {
            text: "OK",
            onPress: () => {
              hasShownAlertRef.current = false;
              onSessionEnd?.();
            }
          }
        ],
        { cancelable: false }
      );
    }
  }, [sessionEnded, onSessionEnd]);

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Render children - they can use useSessionValidation directly if needed
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.body.fontWeight as any,
    lineHeight: Typography.body.lineHeight,
    color: Colors.text.secondary,
  },
});
