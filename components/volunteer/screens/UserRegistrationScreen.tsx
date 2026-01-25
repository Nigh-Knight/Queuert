import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { InputField } from '@/components/provider/atoms/InputField';
import { DropdownSelect, DropdownOption } from '@/components/provider/atoms/DropdownSelect';
import { CustomButton } from '@/components/provider/atoms/CustomButton';

export interface UserRegistrationFormData {
  firstName: string;
  lastName: string;
  livingCondition: string;
  estimatedLoads: string;
  weight: string;
}

export interface UserRegistrationScreenProps {
  formData: UserRegistrationFormData;
  onFormDataChange: (data: UserRegistrationFormData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  livingConditionOptions: DropdownOption[];
}

export function UserRegistrationScreen({
  formData,
  onFormDataChange,
  onSubmit,
  isLoading = false,
  livingConditionOptions,
}: UserRegistrationScreenProps) {
  const handleFieldChange = (field: keyof UserRegistrationFormData, value: string | number) => {
    onFormDataChange({
      ...formData,
      [field]: String(value),
    });
  };

  const isFormValid = 
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.livingCondition !== '' &&
    formData.estimatedLoads.trim() !== '';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <InputField
          label="First Name"
          placeholder="Enter first name"
          value={formData.firstName}
          onChangeText={(text) => handleFieldChange('firstName', text)}
          autoCapitalize="words"
        />

        <InputField
          label="Last Name"
          placeholder="Enter last name"
          value={formData.lastName}
          onChangeText={(text) => handleFieldChange('lastName', text)}
          autoCapitalize="words"
        />

        <DropdownSelect
          label="Living Condition"
          options={livingConditionOptions}
          selectedValue={formData.livingCondition}
          onChange={(value) => handleFieldChange('livingCondition', value)}
          placeholder="Select living condition"
        />

        <InputField
          label="Estimated Loads"
          placeholder="Enter number of loads"
          value={formData.estimatedLoads}
          onChangeText={(text) => handleFieldChange('estimatedLoads', text)}
          keyboardType="number-pad"
        />

        <InputField
          label="Weight (optional)"
          placeholder="Enter weight"
          value={formData.weight}
          onChangeText={(text) => handleFieldChange('weight', text)}
          keyboardType="decimal-pad"
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            label="Submit Registration"
            onPress={onSubmit}
            variant="primary"
            disabled={!isFormValid}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  buttonContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
