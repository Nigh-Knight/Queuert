import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { CustomButton } from '@/components/provider/atoms/CustomButton';

export interface QRCodeGenerationScreenProps {
  qrCodeValue: string;
  volunteerName?: string;
  onRegenerateQRCode: () => void;
  isLoading?: boolean;
}

export function QRCodeGenerationScreen({
  qrCodeValue,
  volunteerName,
  onRegenerateQRCode,
  isLoading = false,
}: QRCodeGenerationScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerSection}>
        {volunteerName && (
          <Text style={styles.volunteerName}>Volunteer: {volunteerName}</Text>
        )}
        <Text style={styles.title}>Your QR Code</Text>
      </View>

      {/* QR Code Placeholder Container */}
      <View style={styles.qrCodeContainer}>
        <View style={styles.qrCodePlaceholder}>
          {/* TODO: Replace with actual QR code library component */}
          <Text style={styles.qrCodePlaceholderText}>QR</Text>
          <Text style={styles.qrCodeValue}>{qrCodeValue}</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to use:</Text>
        <Text style={styles.instructionsText}>
          1. Have service users scan this QR code with their phone
        </Text>
        <Text style={styles.instructionsText}>
          2. They will be directed to register for the queue
        </Text>
        <Text style={styles.instructionsText}>
          3. You'll see their registration appear in the queue
        </Text>
      </View>

      {/* Regenerate Button */}
      <View style={styles.buttonContainer}>
        <CustomButton
          label="Generate New QR Code"
          onPress={onRegenerateQRCode}
          variant="secondary"
          isLoading={isLoading}
        />
      </View>

      <Text style={styles.footerNote}>
        This QR code is unique to you and helps track registrations
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  volunteerName: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.h1.fontSize,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  qrCodeContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  qrCodePlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text.disabled,
    marginBottom: Spacing.sm,
  },
  qrCodeValue: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  instructionsTitle: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  instructionsText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  footerNote: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
