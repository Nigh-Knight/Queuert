import { useRef, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { RoleSelectionScreen } from '@/components/provider/screens/RoleSelectionScreen';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AdminVerificationBottomSheet } from '@/components/admin/AdminVerificationBottomSheet';
import { StyleSheet, Keyboard } from 'react-native';
import { Colors } from '@/constants/theme';

export default function ProviderApp() {
  const router = useRouter();
  const verificationSheetRef = useRef<BottomSheet>(null);
  const [pendingNavigation, setPendingNavigation] = useState(false);

  const handleRoleSelect = (role: 'serviceUser' | 'volunteer' | 'teamLeader') => {
    console.log('Selected role:', role);

    if (role === 'teamLeader') {
      // Show verification before navigating to admin
      setPendingNavigation(true);
      verificationSheetRef.current?.expand();
    } else {
      // For now, just log - future phases will handle volunteer/service user flows
      console.log('Service user and volunteer flows coming in future phases');
    }
  };

  const handleVerified = useCallback(() => {
    setPendingNavigation(false);
    verificationSheetRef.current?.close();
    // Navigate to admin page after verification
    router.push('/(admin)');
  }, [router]);

  const handleCloseVerification = useCallback(() => {
    Keyboard.dismiss();
    setPendingNavigation(false);
    verificationSheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
        onPress={handleCloseVerification}
      />
    ),
    [handleCloseVerification]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RoleSelectionScreen
        onRoleSelect={handleRoleSelect}
      />

      {/* Admin Verification Sheet */}
      <BottomSheet
        ref={verificationSheetRef}
        index={-1}
        snapPoints={['50%', '75%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.sheetIndicator}
        backgroundStyle={styles.sheetBackground}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onChange={(index) => {
          if (index === -1) {
            Keyboard.dismiss();
          }
        }}
      >
        <AdminVerificationBottomSheet
          onVerified={handleVerified}
          onClose={handleCloseVerification}
        />
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
