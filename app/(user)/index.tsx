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
  const [isChecking, setIsChecking] = useState(true);

  // Query session if we have sessionData
  const session = useQuery(
    api.sessions.getSessionById,
    sessionData?.sessionId ? { sessionId: sessionData.sessionId } : 'skip'
  );

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    // Once we have session data, wait for query result
    if (sessionData && session !== undefined) {
      if (session && session.isActive && sessionData.role === 'service_user') {
        // Active session exists, go to status screen
        router.replace('/(user)/status');
      } else {
        // Session ended or invalid, start over with registration
        router.replace('/(user)/registration');
      }
    }
  }, [session, sessionData]);

  const checkSession = async () => {
    try {
      const data = await SessionStorage.load();
      if (data) {
        setSessionData(data);
      } else {
        // No session, start with registration
        router.replace('/(user)/registration');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      router.replace('/(user)/registration');
    } finally {
      setIsChecking(false);
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
