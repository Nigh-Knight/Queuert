import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Header } from '@/components/provider/atoms/Header';
import { InputField } from '@/components/provider/atoms/InputField';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { SessionStorage } from '@/utils/session-storage';
import { Colors, Typography, Spacing } from '@/constants/theme';

/**
 * Phone and name entry screen for service users
 * Receives sessionId from route params after QR scan
 */
export default function PhoneEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessionId, location } = useLocalSearchParams<{
    sessionId: string;
    location: string;
  }>();

  // Guard: redirect if no sessionId
  useEffect(() => {
    if (!sessionId) {
      Alert.alert('Error', 'No session selected. Please scan a QR code.', [
        { text: 'OK', onPress: () => router.replace('/(user)/scan-session') },
      ]);
    }
  }, [sessionId]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registerUser = useMutation(api.auth.registerServiceUser);
  const checkDuplicate = useQuery(
    api.auth.checkPhoneDuplicate,
    phone && sessionId
      ? { sessionId: sessionId as any, phone }
      : 'skip'
  );

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Phone validation (optional, but if provided must be valid)
    if (phone.trim()) {
      if (!phone.startsWith('+')) {
        newErrors.phone = 'Phone must start with + (e.g., +1 for US)';
      } else if (phone.length < 10) {
        newErrors.phone = 'Phone must be at least 10 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Check for duplicate phone if provided
    if (phone.trim() && checkDuplicate?.isDuplicate) {
      Alert.alert(
        'Duplicate Phone',
        'This phone number is already in the queue for this session',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerUser({
        sessionId: sessionId as any,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });

      // Save session to AsyncStorage
      await SessionStorage.save({
        sessionId: sessionId as string,
        role: 'service_user',
        userId: result.userId,
        location: location || result.location,
        timestamp: Date.now(),
      });

      // Navigate to queue status
      router.replace('/(user)/queue-status');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      Alert.alert('Registration Failed', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipPhone = () => {
    // Clear phone field and submit without it
    setPhone('');
    setErrors({ ...errors, phone: undefined });
    // Trigger form validation and submit
    if (firstName.trim() && lastName.trim()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!sessionId) {
    return null; // Guard clause - will redirect via useEffect
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Join Queue" onBackPress={handleBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          Location: {location || 'Loading...'}
        </Text>

        <Text style={styles.instructions}>
          Enter your information to join the queue
        </Text>

        <View style={styles.formContainer}>
          <InputField
            label="First Name *"
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (errors.firstName) {
                setErrors({ ...errors, firstName: undefined });
              }
            }}
            errorMessage={errors.firstName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <InputField
            label="Last Name *"
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (errors.lastName) {
                setErrors({ ...errors, lastName: undefined });
              }
            }}
            errorMessage={errors.lastName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <InputField
            label="Phone Number (Optional)"
            placeholder="+1 234 567 8900"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) {
                setErrors({ ...errors, phone: undefined });
              }
            }}
            errorMessage={errors.phone}
            keyboardType="phone-pad"
            autoCorrect={false}
          />

          <Text style={styles.helpText}>
            Phone number helps us notify you when your laundry is ready.
            Skip if you don't have a phone.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 20) + Spacing.lg,
          },
        ]}
      >
        <CustomButton
          label="Join Queue"
          onPress={handleSubmit}
          disabled={!firstName.trim() || !lastName.trim() || isSubmitting}
          isLoading={isSubmitting}
        />

        {!phone.trim() && (
          <CustomButton
            label="Skip Phone & Join"
            onPress={handleSkipPhone}
            variant="secondary"
            disabled={!firstName.trim() || !lastName.trim() || isSubmitting}
            style={styles.secondaryButton}
          />
        )}
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
  subtitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  instructions: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  helpText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  secondaryButton: {
    marginTop: Spacing.md,
  },
});
