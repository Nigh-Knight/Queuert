/**
 * Volunteer Entry Point
 *
 * Checks for existing session in AsyncStorage:
 * - If session exists and role is "volunteer", redirect to dashboard
 * - If no session, redirect to scan-qr screen
 * - Shows loading spinner while checking
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SessionStorage } from '@/utils/session-storage';
import { Colors } from '@/constants/theme';

export default function VolunteerIndex() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await SessionStorage.load();

      if (session && session.role === 'volunteer') {
        // Redirect to dashboard if volunteer session exists
        router.replace('./dashboard');
      } else {
        // No session or not volunteer, go to QR scanner
        router.replace('./scan-qr');
      }
    } catch (error) {
      console.error('Failed to check session:', error);
      // On error, default to scan-qr screen
      router.replace('./scan-qr');
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading spinner while checking session
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
