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
        // Active session exists, go to queue status
        router.replace('/(user)/queue-status');
      } else {
        // Session ended or invalid, go to scan
        router.replace('/(user)/scan-session');
      }
    }
  }, [session, sessionData]);

  const checkSession = async () => {
    try {
      const data = await SessionStorage.load();
      if (data) {
        setSessionData(data);
      } else {
        // No session, go to scan
        router.replace('/(user)/scan-session');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      router.replace('/(user)/scan-session');
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
