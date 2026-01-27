import { useRef, useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CreateSessionBottomSheet } from '@/components/admin/CreateSessionBottomSheet';
import { SessionStorage } from '@/utils/session-storage';
import { SessionCard, EmptyState } from '@/components/admin';

export default function AdminHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createSessionSheetRef = useRef<BottomSheet>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const session = await SessionStorage.load();

      if (!session || session.role !== 'service_provider') {
        // No admin session - redirect to verify
        router.replace('/(admin)/verify');
        return;
      }

      // Valid admin session exists
      setIsCheckingSession(false);
    };

    checkSession();
  }, [router]);

  // Query all active sessions (only if verified)
  // Note: Queries will return undefined when not verified, which is fine
  const activeSessions = useQuery(
    api.sessions.getAllActiveSessions,
    isCheckingSession ? 'skip' : {}
  );

  const handleOpenCreateSession = useCallback(() => {
    createSessionSheetRef.current?.expand();
  }, []);

  const handleCloseCreateSession = useCallback(() => {
    createSessionSheetRef.current?.close();
  }, []);

  const handleSessionCreated = useCallback((sessionId: string) => {
    handleCloseCreateSession();
    // Navigate to QR codes screen
    router.push({
      pathname: '/(admin)/session-qr-codes',
      params: { sessionId },
    });
  }, [router, handleCloseCreateSession]);

  const handleViewSession = useCallback((sessionId: string) => {
    router.push({
      pathname: '/(admin)/session-qr-codes',
      params: { sessionId },
    });
  }, [router]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  // Show loading state while checking session
  if (isCheckingSession) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="👨‍💼 Admin Dashboard" />

        {/* Session list */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {!activeSessions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : activeSessions.length === 0 ? (
            <EmptyState
              title="No Active Sessions"
              message="Create a new session to get started with queue management"
            />
          ) : (
            activeSessions.map((session) => (
              <SessionCard
                key={session._id}
                location={session.location}
                scheduledDate={session.scheduledDate}
                volunteerCount={session.volunteerCount}
                isActive={session.isActive}
                onPress={() => handleViewSession(session._id)}
              />
            ))
          )}
        </ScrollView>

        {/* FAB for creating sessions */}
        <TouchableOpacity
          style={[styles.fab, { bottom: Math.max(insets.bottom, 20) + 16 + Spacing.lg }]}
          onPress={handleOpenCreateSession}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>

        {/* Create Session Sheet */}
        <BottomSheet
          ref={createSessionSheetRef}
          index={-1}
          snapPoints={['75%']}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={styles.sheetIndicator}
          backgroundStyle={styles.sheetBackground}
        >
          <CreateSessionBottomSheet
            onClose={handleCloseCreateSession}
            onSessionCreated={handleSessionCreated}
          />
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 100, // Extra padding for FAB
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 32,
  },
  sheetIndicator: {
    backgroundColor: Colors.text.tertiary,
    width: 40,
    height: 4,
  },
  sheetBackground: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
