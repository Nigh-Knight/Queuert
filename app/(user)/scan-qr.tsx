import { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Header } from '@/components/provider/atoms/Header';
import { QRScanner } from '@/components/auth/QRScanner';
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
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get registration data from route params
  const {
    firstName,
    lastName,
    livingCondition,
    estimatedLoads,
    estimatedWeight,
  } = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    livingCondition: string;
    estimatedLoads: string;
    estimatedWeight: string;
  }>();

  const validateSessionQR = useMutation(api.auth.validateSessionQR);
  const registerUser = useMutation(api.auth.registerServiceUser);
  const submitIntake = useMutation(api.intake.submitIntakeForm);

  const handleScan = async (qrCode: string) => {
    setIsValidating(true);
    setError(null);

    try {
      // Step 1: Validate session QR code
      const sessionResult = await validateSessionQR({ qrCode });

      // Step 2: Register service user
      const userResult = await registerUser({
        sessionId: sessionResult.sessionId,
        firstName: firstName || '',
        lastName: lastName || '',
        // Note: phone is optional - not collected in registration form
        phone: undefined,
      });

      // Step 3: Submit intake form
      await submitIntake({
        serviceUserId: userResult.userId,
        firstName: firstName || '',
        lastName: lastName || '',
        livingCondition: (livingCondition as 'homeless' | 'sheltered' | 'loads') || 'homeless',
        estimatedLaundryLoads: parseInt(estimatedLoads || '1'),
        estimatedLaundryWeightLbs: parseInt(estimatedWeight || '10'),
        sessionId: sessionResult.sessionId,
      });

      // Step 4: Save session to AsyncStorage
      await SessionStorage.save({
        sessionId: sessionResult.sessionId as string,
        role: 'service_user',
        userId: userResult.userId as string,
        location: sessionResult.location,
        timestamp: Date.now(),
      });

      // Step 5: Navigate to status screen
      router.replace('/(user)/status');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate QR code';
      setError(errorMessage);
      Alert.alert('QR Scan Failed', errorMessage, [
        {
          text: 'Try Again',
          onPress: () => {
            setIsValidating(false);
            setError(null);
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
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Header title="Scan Session QR" onBackPress={handleBack} />

      <View style={styles.scannerContainer}>
        <QRScanner
          onScanComplete={handleScan}
          onError={(err) => {
            setError(err);
            Alert.alert('Scan Error', err);
          }}
        />
      </View>

      {/* Loading overlay during validation */}
      {isValidating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <View style={styles.loadingTextContainer}>
              <View style={styles.loadingText}>Joining queue...</View>
            </View>
          </View>
        </View>
      )}
    </View>
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
