import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Header } from '../atoms/Header';
import { CustomButton } from '../atoms/CustomButton';

export interface VerificationScreenProps {
  phoneNumber: string;
  onVerificationComplete: (code: string) => void;
  onBack?: () => void;
  onResendCode?: () => void;
}

export function VerificationScreen({
  phoneNumber,
  onVerificationComplete,
  onBack,
  onResendCode,
}: VerificationScreenProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRef = useRef<TextInput>(null);

  const codeLength = 6;
  const isCodeComplete = code.length === codeLength;

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= codeLength) {
      setCode(cleaned);
    }
  };

  const handleVerify = async () => {
    if (!isCodeComplete) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onVerificationComplete(code);
    }, 1500);
  };

  const handleResend = () => {
    onResendCode?.();
    setCode('');
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    inputRef.current?.focus();
  };

  const renderCodeInput = () => {
    const digits = code.split('');
    const inputs = Array(codeLength)
      .fill(0)
      .map((_, i) => digits[i] || '');

    return (
      <View style={styles.codeInputContainer}>
        {inputs.map((digit, index) => (
          <View key={index} style={styles.codeDigitBox}>
            <Text style={styles.codeDigit}>{digit}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Verify Your Number" onBackPress={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          We've sent a 6-digit code to {'\n'}
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </Text>

        <View style={styles.codeInputWrapper}>
          {renderCodeInput()}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={codeLength}
            autoFocus
            editable={!isLoading}
          />
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendLabel}>Didn't receive the code?</Text>
          {resendCountdown > 0 ? (
            <Text style={styles.resendCountdown}>
              Resend in {resendCountdown}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendButton}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          label="Verify"
          onPress={handleVerify}
          disabled={!isCodeComplete}
          isLoading={isLoading}
        />
        <CustomButton
          label="Log Back In"
          onPress={onBack}
          variant="secondary"
          style={styles.secondaryButton}
          disabled={isLoading}
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
  description: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    marginBottom: Spacing.xxl,
    lineHeight: Typography.body.lineHeight,
    textAlign: 'center',
  },
  phoneNumber: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
  codeInputWrapper: {
    marginBottom: Spacing.xxl,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  codeDigitBox: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  resendContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  resendLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  resendButton: {
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
    color: Colors.primary,
  },
  resendCountdown: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.disabled,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  secondaryButton: {
    marginTop: Spacing.md,
  },
});
