/**
 * DEPRECATED: Use app/(admin)/verify.tsx instead for admin authentication flow
 *
 * This component is kept for potential future use (e.g., confirming sensitive actions
 * within the admin dashboard), but the main admin login flow now uses the full-screen
 * verify page which properly integrates with Convex and session storage.
 */
import { useState } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { InputField } from '@/components/provider/atoms/InputField';

interface AdminVerificationBottomSheetProps {
  onVerified: () => void;
  onClose: () => void;
}

export function AdminVerificationBottomSheet({ onVerified, onClose }: AdminVerificationBottomSheetProps) {
  const [verificationPhrase, setVerificationPhrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAdminCode = useMutation(api.auth.verifyAdminCode);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleVerify = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await verifyAdminCode({ code: verificationPhrase });
      setIsLoading(false);
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect verification phrase. Please try again.');
      setIsLoading(false);
    }
  };

  const isButtonDisabled = verificationPhrase.trim().length === 0 || isLoading;

  return (
    <BottomSheetView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔐 Admin Verification</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <View style={styles.formContent}>
            <Text style={styles.description}>
              Enter the admin verification phrase to access session management
            </Text>

            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            )}

            <InputField
              label="Verification Phrase"
              placeholder="Enter admin phrase"
              value={verificationPhrase}
              onChangeText={(text) => {
                setVerificationPhrase(text);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.hint}>
              💡 Contact the creator if you don't know the phrase
            </Text>
          </View>

          <CustomButton
            label="Verify"
            onPress={handleVerify}
            variant="primary"
            isLoading={isLoading}
            disabled={isButtonDisabled}
          />
        </View>
      </KeyboardAvoidingView>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  keyboardAvoid: {},
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  formContent: {
    gap: Spacing.xs,
    marginBottom: 0,
  },
  description: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    lineHeight: Typography.body.lineHeight,
  },
  errorBanner: {
    backgroundColor: Colors.alert,
    padding: Spacing.sm,
    borderRadius: 4,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  hint: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.tertiary,
    lineHeight: Typography.caption.lineHeight,
    textAlign: 'center'
  },
});
