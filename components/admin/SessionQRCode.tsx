import { View, StyleSheet, Text, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface SessionQRCodeProps {
  sessionId: string;
  size?: number;
  showInstructions?: boolean;
}

/**
 * Session QR Code component
 * Generates QR code for SERVICE USERS to scan and join the queue
 * This is separate from volunteer QR codes
 */
export function SessionQRCode({
  sessionId,
  size = Dimensions.get('window').width * 0.7,
  showInstructions = true
}: SessionQRCodeProps) {
  // QR code value for session join (for service users)
  const qrValue = JSON.stringify({
    sessionId,
    type: 'session_join',
  });

  return (
    <View style={styles.container}>
      {showInstructions && (
        <Text style={styles.title}>
          👥 Service User Registration
        </Text>
      )}

      <View style={styles.qrContainer}>
        <QRCode
          value={qrValue}
          size={size}
          backgroundColor="white"
          color="black"
        />
      </View>

      {showInstructions && (
        <>
          <Text style={styles.instruction}>
            📸 Service users scan this code to join the queue
          </Text>
          <Text style={styles.note}>
            This is different from volunteer QR codes
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: Spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instruction: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.xl,
    textAlign: 'center',
  },
  note: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
