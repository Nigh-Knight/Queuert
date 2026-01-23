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

export interface RegistrationFormScreenProps {
  onSubmit: (formData: RegistrationData) => void;
  onBack?: () => void;
}

export interface RegistrationData {
  firstName: string;
  lastName: string;
  livingCondition: string;
  estimatedLoads: string;
  estimatedWeight: string;
}

const LIVING_CONDITION_OPTIONS: DropdownOption[] = [
  { label: 'Homeless', value: 'homeless' },
  { label: 'In Transitional Housing', value: 'transitional' },
  { label: 'Permanent Supportive Housing', value: 'permanent' },
  { label: 'Other', value: 'other' },
];

export function RegistrationFormScreen({
  onSubmit,
  onBack,
}: RegistrationFormScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [livingCondition, setLivingCondition] = useState<string | number>('homeless');
  const [estimatedLoads, setEstimatedLoads] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    estimatedLoads.trim() &&
    estimatedWeight.trim();

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        livingCondition: String(livingCondition),
        estimatedLoads,
        estimatedWeight,
      });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Complete Your Profile" onBackPress={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <InputField
          label="First Name"
          placeholder="John"
          value={firstName}
          onChangeText={setFirstName}
        />

        <InputField
          label="Last Name"
          placeholder="Doe"
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.sectionTitle}>Living Situation</Text>

        <DropdownSelect
          label="Living Condition"
          options={LIVING_CONDITION_OPTIONS}
          selectedValue={livingCondition}
          onChange={setLivingCondition}
        />

        <Text style={styles.sectionTitle}>Laundry Details</Text>

        <InputField
          label="Estimated Number of Loads"
          placeholder="e.g., 3"
          value={estimatedLoads}
          onChangeText={setEstimatedLoads}
          keyboardType="number-pad"
        />

        <InputField
          label="Estimated Weight of Laundry"
          placeholder="e.g., 50 lbs"
          value={estimatedWeight}
          onChangeText={setEstimatedWeight}
          keyboardType="decimal-pad"
        />

        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            This information helps us prepare appropriate resources for your visit
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          label="Complete Registration"
          onPress={handleSubmit}
          disabled={!isFormValid}
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
  sectionTitle: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.lg,
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
