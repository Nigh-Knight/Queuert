import { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Header } from '@/components/provider/atoms/Header';
import { QRScanner } from '@/components/auth/QRScanner';
import { Colors, Spacing } from '@/constants/theme';

/**
 * Session QR scan screen for service users
 * Scans venue-displayed QR codes to join a session
 */
export default function ScanSessionScreen() {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateQR = useMutation(api.auth.validateSessionQR);

  const handleScan = async (qrCode: string) => {
    setIsValidating(true);
    setError(null);

    try {
      const result = await validateQR({ qrCode });

      // Navigate to phone entry with session data
      router.push({
        pathname: '/(user)/phone-entry',
        params: {
          sessionId: result.sessionId,
          location: result.location,
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate QR code';
      setError(errorMessage);
      Alert.alert('Invalid QR Code', errorMessage, [
        {
          text: 'Try Again',
          onPress: () => {
            setIsValidating(false);
            setError(null);
          },
        },
      ]);
    }
  };

  const handleBack = () => {
    router.push('/provider');
  };

  return (
    <View style={styles.container}>
      <Header title="Join Session" onBackPress={handleBack} />

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
              <View style={styles.loadingText}>Validating...</View>
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
