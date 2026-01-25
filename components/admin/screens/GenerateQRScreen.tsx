import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { QRCodeDisplay } from '../atoms/QRCodeDisplay';

export interface GenerateQRScreenProps {
  title: string;
  instructionText: string;
  qrCodeUrl: string;
  onGenerateNew: () => void;
  onBack: () => void;
  isGenerating?: boolean;
}

export function GenerateQRScreen({
  title,
  instructionText,
  qrCodeUrl,
  onGenerateNew,
  onBack,
  isGenerating = false,
}: GenerateQRScreenProps) {
  return (
    <View style={styles.container}>
      <Header
        title={title}
        onBackPress={onBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instructionText}>{instructionText}</Text>

        <View style={styles.qrContainer}>
          <QRCodeDisplay
            qrCodeUrl={qrCodeUrl}
            size={200}
          />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            label="Generate New QR Code"
            onPress={onGenerateNew}
            variant="primary"
            isLoading={isGenerating}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xxxl,
  },
  qrContainer: {
    marginVertical: Spacing.xl,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: Spacing.xl,
  },
});
