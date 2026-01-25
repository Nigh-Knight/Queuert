import { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
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

  // TODO: Replace with actual verification phrase from environment/config
  const CORRECT_PHRASE = 'laundry-admin-2024';

  const handleVerify = async () => {
    setError(null);
    setIsLoading(true);

    // Simulate verification delay
    setTimeout(() => {
      if (verificationPhrase.trim().toLowerCase() === CORRECT_PHRASE) {
        onVerified();
      } else {
        setError('Incorrect verification phrase. Please try again.');
      }
      setIsLoading(false);
    }, 500);
  };

  const isButtonDisabled = verificationPhrase.trim().length === 0 || isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔐 Admin Verification</Text>
      </View>

      <BottomSheetView style={styles.content}>
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
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.hint}>
          💡 Contact your team leader if you don't have the phrase
        </Text>

        <CustomButton
          label="Verify"
          onPress={handleVerify}
          variant="primary"
          isLoading={isLoading}
          disabled={isButtonDisabled}
        />
      </BottomSheetView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.h2.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  description: {
    fontSize: Typography.body.fontSize,
    color: Colors.text.secondary,
    lineHeight: Typography.body.lineHeight,
    marginBottom: Spacing.sm,
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
    marginBottom: Spacing.md,
  },
});
