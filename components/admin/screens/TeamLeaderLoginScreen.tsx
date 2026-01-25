import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { InputField } from '@/components/provider/atoms/InputField';
import { PhoneNumberInput } from '../atoms/PhoneNumberInput';

export interface TeamLeaderLoginScreenProps {
  countryCode: string;
  phoneNumber: string;
  verificationCode: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  onVerificationCodeChange: (code: string) => void;
  onVerify: () => void;
  onLogin: () => void;
  isVerifying?: boolean;
  isLoggingIn?: boolean;
  verificationSent?: boolean;
}

export function TeamLeaderLoginScreen({
  countryCode,
  phoneNumber,
  verificationCode,
  onCountryCodeChange,
  onPhoneNumberChange,
  onVerificationCodeChange,
  onVerify,
  onLogin,
  isVerifying = false,
  isLoggingIn = false,
  verificationSent = false,
}: TeamLeaderLoginScreenProps) {
  const canVerify = phoneNumber.length >= 10 && !verificationSent;
  const canLogin = verificationSent && verificationCode.length === 6;

  return (
    <View style={styles.container}>
      <Header title="Queuert - Team Leader Login" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.instructionText}>
          Please enter your phone number to receive a one-time verification code. Once verified, you can log in to manage your team and queue.
        </Text>

        <View style={styles.section}>
          <PhoneNumberInput
            countryCode={countryCode}
            phoneNumber={phoneNumber}
            onCountryCodeChange={onCountryCodeChange}
            onPhoneNumberChange={onPhoneNumberChange}
            label="Phone Number"
            placeholder="Enter phone number"
            helperText="A one-time code will be sent to this number"
          />
        </View>

        <View style={styles.section}>
          <InputField
            label="Verification Code"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChangeText={onVerificationCodeChange}
            keyboardType="number-pad"
            maxLength={6}
            editable={verificationSent}
            containerStyle={styles.verificationInput}
          />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            label="Verify"
            onPress={onVerify}
            variant="primary"
            disabled={!canVerify}
            isLoading={isVerifying}
            style={styles.button}
          />

          <CustomButton
            label="Login"
            onPress={onLogin}
            variant={canLogin ? 'primary' : 'secondary'}
            disabled={!canLogin}
            isLoading={isLoggingIn}
            style={styles.button}
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
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text.secondary,
    lineHeight: 26,
    marginBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  verificationInput: {
    marginBottom: 0,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
});
