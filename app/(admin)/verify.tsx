/**
 * Admin Verification Screen
 *
 * This is the ONLY admin verification point in the app.
 * Flow:
 * 1. User selects "Team Leader" role in provider.tsx
 * 2. Navigates here to verify with admin code ("kepler cool")
 * 3. Calls Convex verifyAdminCode mutation
 * 4. On success: saves session to AsyncStorage and navigates to admin dashboard
 * 5. Admin dashboard checks session on mount and redirects here if invalid
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { SessionStorage } from '@/utils/session-storage';

export default function AdminVerifyScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const verifyAdminCode = useMutation(api.auth.verifyAdminCode);

  const codeLength = 11; // "kepler cool" is 11 characters (including space)

  const handleCodeChange = (text: string) => {
    setCode(text);
  };

  const handleVerify = async () => {
    if (code.trim().length === 0) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyAdminCode({ code });

      // Save admin session to AsyncStorage
      await SessionStorage.save({
        sessionId: '', // Admin doesn't have sessionId until they create one
        role: 'service_provider',
        location: '', // Admin can access all locations
        timestamp: Date.now(),
      });

      // Navigate to admin dashboard
      router.replace('/(admin)');
    } catch (error) {
      setIsVerifying(false);
      Alert.alert(
        'Verification Failed',
        error instanceof Error ? error.message : 'Invalid verification code'
      );
      // Clear code for retry
      setCode('');
      inputRef.current?.focus();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderCodeInput = () => {
    return (
      <View style={styles.codeInputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.codeInput}
          value={code}
          onChangeText={handleCodeChange}
          placeholder="Enter admin code"
          placeholderTextColor={Colors.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          editable={!isVerifying}
          onSubmitEditing={handleVerify}
          returnKeyType="done"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Admin Access" onBackPress={handleBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Enter the admin verification code to access admin functions
        </Text>

        <View style={styles.codeInputWrapper}>
          {renderCodeInput()}
        </View>

        <Text style={styles.hint}>
          Contact your system administrator if you don't have the code
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          label="Verify"
          onPress={handleVerify}
          disabled={code.trim().length === 0}
          isLoading={isVerifying}
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
  codeInputWrapper: {
    marginBottom: Spacing.xl,
  },
  codeInputContainer: {
    alignItems: 'center',
  },
  codeInput: {
    width: '100%',
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.body.fontSize,
    color: Colors.text.primary,
    backgroundColor: Colors.surfaceLight,
    textAlign: 'center',
  },
  hint: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
