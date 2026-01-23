import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, ComponentSize } from '@/constants/theme';
import { Header } from '../atoms/Header';
import { CustomButton } from '../atoms/CustomButton';

export interface QRCodeScannerScreenProps {
  onQRCodeScanned: (code: string) => void;
  onCancel?: () => void;
  onBack?: () => void;
}

export function QRCodeScannerScreen({
  onQRCodeScanned,
  onCancel,
  onBack,
}: QRCodeScannerScreenProps) {
  const [isScanning] = useState(true);

  // Simulated QR scan (in production, use expo-camera for real scanning)
  const handleSimulatedScan = () => {
    const simulatedQRCode = 'QUEUERT_' + Date.now();
    onQRCodeScanned(simulatedQRCode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Scan QR Code" onBackPress={onBack} />

      <View style={styles.content}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionIcon}>📱</Text>
          <Text style={styles.instructionText}>
            Scan the Service Provider's QR Code to join the queue
          </Text>
        </View>

        <View style={styles.scannerArea}>
          <View style={styles.dashedFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <View style={styles.centerOverlay}>
              <Text style={styles.placeholderText}>QR Code</Text>
            </View>
          </View>

          <Text style={styles.alignmentText}>
            Align QR code within frame
          </Text>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for scanning:</Text>
          <Text style={styles.tipItem}>
            • Ensure good lighting
          </Text>
          <Text style={styles.tipItem}>
            • Hold the device steady
          </Text>
          <Text style={styles.tipItem}>
            • Keep QR code within frame
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <CustomButton
          label={isScanning ? 'Simulate Scan' : 'Try Again'}
          onPress={handleSimulatedScan}
          variant="primary"
        />
        <CustomButton
          label="Cancel"
          onPress={onCancel}
          variant="alert"
          style={styles.cancelButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  instructionIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  instructionText: {
    fontSize: Typography.body.fontSize,
    fontWeight: '500',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: Typography.body.lineHeight,
  },
  scannerArea: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  dashedFrame: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
  centerOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  alignmentText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  tipsContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
    borderRadius: ComponentSize.cardRadius,
    marginTop: Spacing.xl,
  },
  tipsTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  tipItem: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.caption.lineHeight,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  cancelButton: {
    marginTop: Spacing.md,
  },
});
