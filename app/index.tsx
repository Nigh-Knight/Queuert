import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSessionValidation } from '@/hooks/useSessionValidation';
import { Colors } from '@/constants/theme';

export default function Index() {
  const { sessionData, isLoading } = useSessionValidation();
  const [hasRouted, setHasRouted] = useState(false);

  useEffect(() => {
    if (isLoading || hasRouted) return;

    setHasRouted(true);

    if (sessionData) {
      // Route based on role
      switch (sessionData.role) {
        case 'service_provider':
          router.replace('/(admin)');
          break;
        case 'volunteer':
          router.replace('/(volunteer)');
          break;
        case 'service_user':
          router.replace('/(user)');
          break;
        default:
          router.replace('/provider');
      }
    } else {
      // No session, go to role selection
      router.replace('/provider');
    }
  }, [isLoading, sessionData, hasRouted]);

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
