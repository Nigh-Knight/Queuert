import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { QRCodeSlide } from '@/components/admin/QRCodeSlide';

const { width } = Dimensions.get('window');

export default function SessionQRCodes() {
  const router = useRouter();
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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (isGenerating || volunteers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating volunteer codes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="📱 Volunteer QR Codes"
        rightAction={
          <CustomButton
            label="✅ Done"
            onPress={handleDone}
            variant="secondary"
          />
        }
      />

      <FlatList
        data={volunteers}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => (
          <QRCodeSlide
            sessionId={sessionId}
            qrCode={item.qrCode}
            index={index}
            total={volunteers.length}
          />
        )}
      />

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {volunteers.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
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
