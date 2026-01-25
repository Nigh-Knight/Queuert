import { View, StyleSheet, Text, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface QRCodeSlideProps {
  sessionId: string;
  qrCode: string;
  index: number;
  total: number;
}

export function QRCodeSlide({ sessionId, qrCode, index, total }: QRCodeSlideProps) {
  // QR code value contains both session and volunteer identifier
  const qrValue = JSON.stringify({
    sessionId,
    volunteerId: qrCode,
    type: 'volunteer_join',
  });

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        Volunteer {index + 1} of {total}
      </Text>

      <View style={styles.qrContainer}>
        <QRCode
          value={qrValue}
          size={Dimensions.get('window').width * 0.7}
          backgroundColor="white"
          color="black"
        />
      </View>

      <Text style={styles.instruction}>
        Have volunteer scan this code to join
      </Text>

      <Text style={styles.swipeHint}>
        Swipe left for next volunteer
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  counter: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
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
  swipeHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
  },
});
