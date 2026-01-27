/**
 * QRScanner Component
 *
 * Reusable QR code scanner with camera permission handling.
 * Used by volunteers to scan admin-generated session QR codes.
 *
 * Features:
 * - Automatic camera permission request
 * - Settings navigation for denied permissions
 * - Duplicate scan prevention
 * - Auto-detection of QR codes in frame
 */

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';

interface QRScannerProps {
  onScanComplete: (qrCode: string) => void;
  onError?: (error: string) => void;
}

export interface QRScannerRef {
  resetScan: () => void;
}

export const QRScanner = forwardRef<QRScannerRef, QRScannerProps>(
  ({ onScanComplete, onError }, ref) => {
    const [permission, requestPermission] = useCameraPermissions();
    const hasScanned = useRef<boolean>(false);

    // Reset scan state when component mounts
    useEffect(() => {
      hasScanned.current = false;
    }, []);

    // Expose reset function to parent via ref
    useImperativeHandle(ref, () => ({
      resetScan: () => {
        hasScanned.current = false;
      },
    }));

    const handleScan = (result: { data: string }) => {
      // Prevent duplicate scan processing
      if (hasScanned.current) {
        return;
      }

      hasScanned.current = true;

      try {
        onScanComplete(result.data);
      } catch (error) {
        hasScanned.current = false; // Allow retry on error
        onError?.(error instanceof Error ? error.message : 'Scan processing failed');
      }
    };

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      onError?.('Unable to open settings');
    }
  };

  // Loading state while checking permissions
  if (permission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Checking camera permissions...</Text>
      </View>
    );
  }

  // Permission denied - show instructions and actions
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera Required</Text>
          <Text style={styles.permissionText}>
            Camera access is required to scan QR codes
          </Text>

          {permission.canAskAgain ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={requestPermission}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Request Permission</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.settingsText}>
                Go to Settings &gt; Queuert &gt; Allow Camera
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleOpenSettings}
                activeOpacity={0.7}
              >
                <Text style={styles.primaryButtonText}>Open Settings</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }

  // Camera view with overlay
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleScan}
      />

      {/* Instruction overlay */}
      <View style={styles.overlay}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Point camera at volunteer QR code
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  permissionCard: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: ComponentSize.cardRadius,
    padding: Spacing.xxl,
    maxWidth: 400,
    alignItems: 'center',
  },
  permissionTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  permissionText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  settingsText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: ComponentSize.buttonHeight,
    borderRadius: ComponentSize.buttonRadius,
    paddingHorizontal: Spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 200,
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  instructionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxl,
    marginTop: Spacing.xxxl,
    borderRadius: ComponentSize.buttonRadius,
  },
  instructionText: {
    ...Typography.body,
    color: Colors.background,
    fontWeight: '500',
    textAlign: 'center',
  },
});
