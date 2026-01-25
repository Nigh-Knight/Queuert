import { View, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';

export default function AdminHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Query active sessions for both locations
  const kamsSession = useQuery(api.sessions.getActiveSession, { location: 'kams' });
  const starSession = useQuery(api.sessions.getActiveSession, { location: 'star' });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Admin Dashboard" />

      {/* Session status cards will go here */}
      <View style={styles.content}>
        {/* Show active session info for each location */}
      </View>

      <FAB
        icon="plus"
        style={[styles.fab, { bottom: Math.max(insets.bottom, Spacing.lg) }]}
        onPress={() => router.push('/(admin)/create-session')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.md },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    backgroundColor: Colors.primary,
  },
});
