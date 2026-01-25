import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { InputField } from '@/components/provider/atoms/InputField';
import { DropdownSelect, DropdownOption } from '@/components/provider/atoms/DropdownSelect';

export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  livingCondition: string;
  estimatedLoads: string;
}

export interface UserRegistrationScreenProps {
  formData: UserRegistrationData;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onLivingConditionChange: (value: string | number) => void;
  onEstimatedLoadsChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

const LIVING_CONDITIONS: DropdownOption[] = [
  { label: 'Homeless', value: 'homeless' },
  { label: 'Shelter', value: 'shelter' },
  { label: 'Transitional Housing', value: 'transitional' },
  { label: 'Temporary Housing', value: 'temporary' },
  { label: 'Other', value: 'other' },
];

export function UserRegistrationScreen({
  formData,
  onFirstNameChange,
  onLastNameChange,
  onLivingConditionChange,
  onEstimatedLoadsChange,
  onSubmit,
  onBack,
  isSubmitting = false,
}: UserRegistrationScreenProps) {
  const isFormValid =
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.livingCondition !== '' &&
    formData.estimatedLoads !== '' &&
    Number(formData.estimatedLoads) > 0;

  return (
    <View style={styles.container}>
      <Header
        title="User Registration"
        onBackPress={onBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <InputField
            label="First Name"
            placeholder="Enter first name"
            value={formData.firstName}
            onChangeText={onFirstNameChange}
            autoCapitalize="words"
          />

          <InputField
            label="Last Name"
            placeholder="Enter last name"
            value={formData.lastName}
            onChangeText={onLastNameChange}
            autoCapitalize="words"
          />

          <DropdownSelect
            label="Living Condition"
            placeholder="Select living condition"
            options={LIVING_CONDITIONS}
            selectedValue={formData.livingCondition}
            onChange={onLivingConditionChange}
          />

          <InputField
            label="Estimated Loads"
            placeholder="Number of loads"
            value={formData.estimatedLoads}
            onChangeText={onEstimatedLoadsChange}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.buttonContainer}>
          <CustomButton
            label="Register User"
            onPress={onSubmit}
            variant="primary"
            disabled={!isFormValid}
            isLoading={isSubmitting}
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
  form: {
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
  },
});
