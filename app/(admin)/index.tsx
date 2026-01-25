import { View, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';

export default function AdminHome() {
  const router = useRouter();

  // Query active sessions for both locations
  const kamsSession = useQuery(api.sessions.getActiveSession, { location: 'kams' });
  const starSession = useQuery(api.sessions.getActiveSession, { location: 'star' });

  return (
    <View style={styles.container}>
      <Header title="Admin Dashboard" />

      {/* Session status cards will go here */}
      <View style={styles.content}>
        {/* Show active session info for each location */}
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(admin)/create-session')}
      />
    </View>
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
