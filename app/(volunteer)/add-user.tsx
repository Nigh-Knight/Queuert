/**
 * Manual User Registration (Volunteer Flow)
 *
 * Allows volunteers to manually add users to the queue
 * for people who don't have phones or need assistance.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors, Typography, Spacing } from '@/constants/theme';
import type { Id } from '@/convex/_generated/dataModel';

// Components
import { Header } from '@/components/provider/atoms/Header';
import { InputField } from '@/components/provider/atoms/InputField';
import { DropdownSelect, DropdownOption } from '@/components/provider/atoms/DropdownSelect';
import { CustomButton } from '@/components/provider/atoms/CustomButton';

const livingConditionOptions: DropdownOption[] = [
  { label: 'Homeless', value: 'homeless' },
  { label: 'Sheltered', value: 'sheltered' },
  { label: 'Other', value: 'loads' },
];

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  livingCondition: string;
  estimatedLoads: string;
  weight: string;
}

export default function AddUserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sessionId: string }>();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    livingCondition: '',
    estimatedLoads: '',
    weight: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mutations
  const registerUser = useMutation(api.auth.registerServiceUser);
  const submitIntake = useMutation(api.intake.submitIntakeForm);

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.livingCondition !== '' &&
    formData.estimatedLoads.trim() !== '';

  const handleSubmit = async () => {
    if (!isFormValid || !params.sessionId) return;

    setIsLoading(true);
    try {
      // Step 1: Register the user
      const { userId } = await registerUser({
        sessionId: params.sessionId as Id<'sessions'>,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      });

      // Step 2: Submit intake form (this also adds to queue)
      await submitIntake({
        serviceUserId: userId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        livingCondition: formData.livingCondition as 'homeless' | 'sheltered' | 'loads',
        estimatedLaundryLoads: parseInt(formData.estimatedLoads, 10) || 1,
        estimatedLaundryWeightLbs: parseFloat(formData.weight) || 0,
        sessionId: params.sessionId as Id<'sessions'>,
      });

      Alert.alert(
        'Success',
        `${formData.firstName} ${formData.lastName} has been added to the queue.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add user';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <Header title="Add New User" />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Manually add a service user to the queue
          </Text>

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

          <InputField
            label="Phone Number (optional)"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChangeText={(text) => handleFieldChange('phone', text)}
            keyboardType="phone-pad"
          />

          <DropdownSelect
            label="Living Condition"
            options={livingConditionOptions}
            selectedValue={formData.livingCondition}
            onChange={(value) => handleFieldChange('livingCondition', value as string)}
            placeholder="Select living condition"
          />

          <InputField
            label="Estimated Number of Loads"
            placeholder="e.g., 2-3 loads"
            value={formData.estimatedLoads}
            onChangeText={(text) => handleFieldChange('estimatedLoads', text)}
            keyboardType="number-pad"
          />

          <InputField
            label="Estimated Weight of Laundry (optional)"
            placeholder="e.g., 10-15 lbs"
            value={formData.weight}
            onChangeText={(text) => handleFieldChange('weight', text)}
            keyboardType="decimal-pad"
          />

          <View style={styles.buttonContainer}>
            <CustomButton
              label="Submit"
              onPress={handleSubmit}
              variant="primary"
              disabled={!isFormValid}
              isLoading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
  },
});
