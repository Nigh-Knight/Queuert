import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { SessionStorage } from '@/utils/session-storage';
import { Colors } from '@/constants/theme';

/**
 * Entry point for service users
 * Checks for existing session and redirects appropriately
 *
 * Flow:
 * - No session → registration (collect info first)
 * - Has session + active → status (show queue position)
 * - Has session + ended → registration (start new session)
 */
export default function UserIndex() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [shouldCheckSession, setShouldCheckSession] = useState(false);

  // Query session only if we have sessionData and want to check it
  const session = useQuery(
    api.sessions.getSessionById,
    shouldCheckSession && sessionData?.sessionId ? { sessionId: sessionData.sessionId } : 'skip'
  );

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    // Add timeout to prevent infinite loading - fallback to registration after 3 seconds
    if (shouldCheckSession) {
      const timeout = setTimeout(() => {
        console.log('Session check timeout, redirecting to registration');
        router.replace('/(user)/registration');
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [shouldCheckSession, router]);

  useEffect(() => {
    // If we're checking session and query resolved, handle navigation
    if (shouldCheckSession && session !== undefined) {
      if (session && session.isActive && sessionData?.role === 'service_user') {
        // Active session exists, go to status screen
        router.replace('/(user)/status');
      } else {
        // Session ended or invalid, start over with registration
        router.replace('/(user)/registration');
      }
    }
  }, [session, shouldCheckSession, sessionData, router]);

  const checkSession = async () => {
    try {
      const data = await SessionStorage.load();

      if (!data || data.role !== 'service_user') {
        // No session or wrong role, go directly to registration
        router.replace('/(user)/registration');
        return;
      }

      // Has service user session data, check if session is still active
      setSessionData(data);
      setShouldCheckSession(true);
    } catch (error) {
      console.error('Error checking session:', error);
      router.replace('/(user)/registration');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
