import { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAB } from 'react-native-paper';
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Query active sessions for both locations
  const kamsSession = useQuery(api.sessions.getActiveSession, { location: 'kams' });
  const starSession = useQuery(api.sessions.getActiveSession, { location: 'star' });

  const handleOpenSheet = useCallback(() => {
    setIsSheetOpen(true);
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
    bottomSheetRef.current?.close();
  }, []);

  const handleSessionCreated = useCallback((sessionId: string) => {
    handleCloseSheet();
    // Navigate to QR codes screen
    router.push({
      pathname: '/(admin)/session-qr-codes',
      params: { sessionId },
    });
  }, [router, handleCloseSheet]);

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

        {/* Black bar at bottom for navigation visibility */}
        <View style={[styles.navigationBar, { height: Math.max(insets.bottom, 20) }]} />

        <FAB
          icon="plus"
          style={[styles.fab, { bottom: Math.max(insets.bottom, Spacing.lg) + 8 }]}
          onPress={handleOpenSheet}
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={['75%']}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={styles.sheetIndicator}
          backgroundStyle={styles.sheetBackground}
          onChange={(index) => setIsSheetOpen(index >= 0)}
        >
          <CreateSessionBottomSheet
            onClose={handleCloseSheet}
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
  navigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    backgroundColor: Colors.primary,
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
