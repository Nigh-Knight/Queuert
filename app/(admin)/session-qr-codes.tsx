import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Text, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { QRCodeSlide } from '@/components/admin/QRCodeSlide';
import { SessionQRCode } from '@/components/admin/SessionQRCode';

const { width } = Dimensions.get('window');

export default function SessionQRCodes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const typedSessionId = sessionId as Id<'sessions'>;

  const generateCodes = useMutation(api.volunteers.generateVolunteerCodes);
  const session = useQuery(api.sessions.getSessionById, { sessionId: typedSessionId });
  const volunteers = useQuery(api.volunteers.getVolunteersBySession, { sessionId: typedSessionId });

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate volunteer codes on mount if none exist
  useEffect(() => {
    if (session && volunteers !== undefined && volunteers.length === 0) {
      generateVolunteerCodes();
    }
  }, [session, volunteers]);

  const generateVolunteerCodes = async () => {
    if (!session) return;
    setIsGenerating(true);
    try {
      await generateCodes({
        sessionId: typedSessionId,
        count: session.volunteerCount,
      });
    } catch (error) {
      console.error('Failed to generate codes:', error);
    }
    setIsGenerating(false);
  };

  const handleDone = () => {
    router.replace('/(admin)');
  };

  if (!session || volunteers === undefined) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isGenerating || volunteers.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating volunteer codes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // All QR codes: [session QR, ...volunteer QRs]
  const allQRCodes = [{ type: 'session', _id: 'session-qr' }, ...volunteers];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="📱 Session QR Codes" />

      <FlatList
        data={allQRCodes}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => {
          if (item.type === 'session') {
            // First page: Session QR for service users
            return (
              <View style={styles.slideContainer}>
                <SessionQRCode sessionId={sessionId} showInstructions />
                <Text style={styles.swipeHint}>
                  👉 Swipe right for volunteer codes
                </Text>
              </View>
            );
          }
          // Subsequent pages: Volunteer QR codes
          return (
            <QRCodeSlide
              sessionId={sessionId}
              qrCode={(item as any).qrCode}
              index={index}
              total={allQRCodes.length}
            />
          );
        }}
      />

      {/* Footer with Done button (only on last page) and pagination dots */}
      <View style={[styles.footer, {
        paddingBottom: Math.max(insets.bottom, 20) + 16 + Spacing.lg, // Account for nav bar height + top padding
      }]}>
        {/* Show Done button only on last page */}
        {currentIndex === allQRCodes.length - 1 && (
          <CustomButton
            label="Done"
            onPress={handleDone}
            variant="primary"
          />
        )}

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {allQRCodes.map((item, index) => (
            <View
              key={item._id}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  slideContainer: {
    flex: 1,
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  swipeHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xl,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'center',
    minHeight: 80, // Reserve consistent space for footer
    justifyContent: 'flex-end',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text.tertiary,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
