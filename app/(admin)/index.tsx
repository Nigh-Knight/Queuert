import { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CreateSessionBottomSheet } from '@/components/admin/CreateSessionBottomSheet';

export default function AdminHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createSessionSheetRef = useRef<BottomSheet>(null);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);

  // Query active sessions for both locations (only if verified)
  // Note: Queries will return undefined when not verified, which is fine
  const kamsSession = useQuery(
    api.sessions.getActiveSession,
    { location: 'kams' }
  );
  const starSession = useQuery(
    api.sessions.getActiveSession,
    { location: 'star' }
  );


  const handleOpenCreateSession = useCallback(() => {
    setIsCreateSessionOpen(true);
    createSessionSheetRef.current?.expand();
  }, []);

  const handleCloseCreateSession = useCallback(() => {
    setIsCreateSessionOpen(false);
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="👨‍💼 Admin Dashboard" />

        {/* Session status cards will go here */}
        <View style={styles.content}>
          {/* Show active session info for each location */}
        </View>

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
          onChange={(index) => setIsCreateSessionOpen(index >= 0)}
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
  content: { flex: 1, padding: Spacing.md },
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
