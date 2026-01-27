import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Header } from '@/components/provider/atoms/Header';
import { QRScanner, QRScannerRef } from '@/components/auth/QRScanner';
import { SessionStorage } from '@/utils/session-storage';
import { Colors, Spacing } from '@/constants/theme';

/**
 * QR scan screen for service users
 * Scans session QR codes after registration form
 *
 * Flow: Registration → QR Scan → Status
 */
export default function ScanQRScreen() {
  const router = useRouter();
  const scannerRef = useRef<QRScannerRef>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Get registration data from route params
  const {
    firstName,
    lastName,
    phone,
    livingCondition,
    estimatedLoads,
    estimatedWeight,
  } = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    phone?: string;
    livingCondition: string;
    estimatedLoads: string;
    estimatedWeight: string;
  }>();

  const registerUser = useMutation(api.auth.registerServiceUser);
  const submitIntake = useMutation(api.intake.submitIntakeForm);

  const handleScan = async (qrCode: string) => {
    setIsValidating(true);

    try {
      // Step 1: Parse volunteer QR code JSON (format: { sessionId, volunteerId, type })
      let sessionId: string;
      try {
        const qrData = JSON.parse(qrCode);
        if (qrData.type !== 'volunteer_join' || !qrData.sessionId) {
          throw new Error('Invalid volunteer QR code format');
        }
        sessionId = qrData.sessionId;
      } catch {
        throw new Error('QR code is not a valid volunteer code');
      }

      // Step 2: Register service user
      const userResult = await registerUser({
        sessionId: sessionId as any,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone && phone.trim() ? phone : undefined,
      });

      // Step 3: Submit intake form
      await submitIntake({
        serviceUserId: userResult.userId,
        firstName: firstName || '',
        lastName: lastName || '',
        livingCondition: (livingCondition as 'homeless' | 'sheltered' | 'loads') || 'homeless',
        estimatedLaundryLoads: parseInt(estimatedLoads || '1'),
        estimatedLaundryWeightLbs: parseInt(estimatedWeight || '10'),
        sessionId: userResult.sessionId,
      });

      // Step 4: Save session to AsyncStorage
      await SessionStorage.save({
        sessionId: userResult.sessionId as string,
        role: 'service_user',
        userId: userResult.userId as string,
        location: userResult.location,
        timestamp: Date.now(),
      });

      // Step 5: Navigate to status screen
      router.replace('/(user)/status');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate QR code';
      Alert.alert('QR Scan Failed', errorMessage, [
        {
          text: 'Try Again',
          onPress: () => {
            setIsValidating(false);
            // Reset scanner to allow retry
            scannerRef.current?.resetScan();
          },
        },
        {
          text: 'Back to Registration',
          onPress: () => {
            router.back();
          },
          style: 'cancel',
        },
      ]);
      setIsValidating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Scan Session QR" />
      <View style={styles.scannerContainer}>
        <QRScanner
          ref={scannerRef}
          onScanComplete={handleScan}
          onError={(err) => {
            Alert.alert('Scan Error', err, [
              {
                text: 'OK',
                onPress: () => {
                  // Reset scanner to allow retry
                  scannerRef.current?.resetScan();
                },
              },
            ]);
          }}
        />
      </View>

      {/* Loading overlay during validation */}
      {isValidating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <View style={styles.loadingTextContainer}>
              <Text style={styles.loadingText}>Joining queue...</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scannerContainer: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: Colors.background,
    padding: Spacing.xxl,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingTextContainer: {
    marginTop: Spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
});
