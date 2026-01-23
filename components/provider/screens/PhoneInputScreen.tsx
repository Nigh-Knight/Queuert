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
import { DropdownSelect, DropdownOption } from '../atoms/DropdownSelect';
import { CustomButton } from '../atoms/CustomButton';

export interface PhoneInputScreenProps {
  onPhoneSubmit: (countryCode: string, phoneNumber: string) => void;
  onBack?: () => void;
}

const COUNTRY_OPTIONS: DropdownOption[] = [
  { label: '🇺🇸 United States (+1)', value: '+1' },
  { label: '🇨🇦 Canada (+1)', value: '+1' },
  { label: '🇬🇧 United Kingdom (+44)', value: '+44' },
  { label: '🇦🇺 Australia (+61)', value: '+61' },
  { label: '🇲🇽 Mexico (+52)', value: '+52' },
];

export function PhoneInputScreen({
  onPhoneSubmit,
  onBack,
}: PhoneInputScreenProps) {
  const [countryCode, setCountryCode] = useState<string | number>('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isPhoneValid = phoneNumber.replace(/\D/g, '').length >= 10;

  const handleContinue = async () => {
    if (!isPhoneValid) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onPhoneSubmit(String(countryCode), phoneNumber);
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
      <Header title="Enter Your Number" onBackPress={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          We'll send you a verification code to confirm your number
        </Text>

        <DropdownSelect
          label="Country"
          options={COUNTRY_OPTIONS}
          selectedValue={countryCode}
          onChange={setCountryCode}
        />

        <InputField
          label="Phone Number"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
          keyboardType="phone-pad"
          maxLength={12}
        />

        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerIcon}>ℹ️</Text>
          <Text style={styles.disclaimerText}>
            Standard SMS rates may apply. You'll receive a verification code shortly.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          label="Send Verification Code"
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
  description: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    lineHeight: Typography.body.lineHeight,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  disclaimerIcon: {
    fontSize: 20,
  },
  disclaimerText: {
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
