import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Header } from '../atoms/Header';
import { InputField } from '../atoms/InputField';
import { CustomButton } from '../atoms/CustomButton';

export interface WelcomeBackScreenProps {
  onContinue: (phoneNumber: string) => void;
  onBack?: () => void;
}

export function WelcomeBackScreen({
  onContinue,
  onBack,
}: WelcomeBackScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isPhoneValid = phoneNumber.replace(/\D/g, '').length >= 10;

  const handleContinue = async () => {
    if (!isPhoneValid) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onContinue(phoneNumber);
    }, 1000);
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Welcome Back!" onBackPress={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingIcon}>👋</Text>
          <Text style={styles.greetingText}>
            Please enter your mobile number to get started
          </Text>
        </View>

        <InputField
          label="Phone Number"
          placeholder="(123) 456-7890"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
          keyboardType="phone-pad"
          maxLength={12}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            We'll verify your number to confirm your account
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          label="Continue"
          onPress={handleContinue}
          disabled={!isPhoneValid}
          isLoading={isLoading}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greetingIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  greetingText: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: Typography.h2.lineHeight,
  },
  infoContainer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    lineHeight: Typography.caption.lineHeight,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
