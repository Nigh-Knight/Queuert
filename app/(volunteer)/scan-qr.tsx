/**
 * Volunteer QR Scanner Screen
 *
 * Scans admin-generated QR codes to join sessions.
 * Features:
 * - Validates QR codes with Convex backend
 * - Handles invalid codes with error feedback
 * - Shows confirmation dialog when switching sessions
 * - Persists session to AsyncStorage on success
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { QRScanner } from '@/components/auth/QRScanner';
import { SessionStorage, SessionData } from '@/utils/session-storage';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function VolunteerScanQR() {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSession, setPendingSession] = useState<SessionData | null>(null);

  const validateVolunteerQR = useMutation(api.auth.validateVolunteerQR);

  const handleScanComplete = async (qrCode: string) => {
    setIsValidating(true);
    setError(null);

    try {
      // Parse QR code JSON (format: { sessionId, volunteerId, type })
      let volunteerQRCode: string;
      try {
        const qrData = JSON.parse(qrCode);
        if (qrData.type !== 'volunteer_join' || !qrData.volunteerId) {
          throw new Error('Invalid volunteer QR code format');
        }
        volunteerQRCode = qrData.volunteerId;
      } catch {
        throw new Error('QR code is not a valid volunteer code');
      }

      // Validate QR code with Convex
      const result = await validateVolunteerQR({ qrCode: volunteerQRCode });

      // Check if user already has a session
      const existingSession = await SessionStorage.load();

      const newSession: SessionData = {
        sessionId: result.sessionId,
        role: result.role,
        volunteerId: result.volunteerId,
        location: result.location,
        timestamp: Date.now(),
      };

      // If switching sessions, show confirmation dialog
      if (existingSession && existingSession.sessionId !== result.sessionId) {
        setPendingSession(newSession);
        showSessionSwitchConfirmation(result.location);
      } else {
        // No existing session or same session, save and navigate
        await SessionStorage.save(newSession);
        router.replace('./dashboard');
      }
    } catch (error) {
      // Handle validation errors
      const errorMessage = error instanceof Error
        ? error.message
        : 'QR code validation failed';

      setError(errorMessage);

      // Show error alert
      Alert.alert(
        'Invalid QR Code',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => setError(null),
          },
        ]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const showSessionSwitchConfirmation = (newLocation: string) => {
    Alert.alert(
      'Switch Session?',
      `Join ${newLocation} session?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setPendingSession(null);
            setError(null);
          },
        },
        {
          text: 'Join',
          onPress: async () => {
            if (pendingSession) {
              await SessionStorage.save(pendingSession);
              setPendingSession(null);
              router.replace('./dashboard');
            }
          },
        },
      ]
    );
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    Alert.alert('Scanner Error', errorMsg, [
      {
        text: 'OK',
        onPress: () => setError(null),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* QR Scanner */}
      <QRScanner
        onScanComplete={handleScanComplete}
        onError={handleError}
      />

      {/* Error message overlay */}
      {error && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Scan Failed</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      )}

      {/* Loading overlay during validation */}
      {isValidating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Validating QR code...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.xxl,
    maxWidth: 400,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Colors.alert,
  },
  errorTitle: {
    ...Typography.h1,
    color: Colors.alert,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: Spacing.xxl,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    fontWeight: '500',
  },
});
