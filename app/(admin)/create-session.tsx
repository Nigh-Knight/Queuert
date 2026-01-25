import { useState } from 'react';
import { View, StyleSheet, Alert, Text, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/provider/atoms/Header';
import { CustomButton } from '@/components/provider/atoms/CustomButton';
import { DropdownSelect } from '@/components/provider/atoms/DropdownSelect';
import { InputField } from '@/components/provider/atoms/InputField';

const LOCATIONS = [
  { label: "📍 Kam's Laundromat", value: 'kams' },
  { label: "📍 Star Laundromat", value: 'star' },
];

export default function CreateSession() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createSession = useMutation(api.sessions.createSession);

  const [location, setLocation] = useState<string | number>('');
  const [date, setDate] = useState(new Date());
  const [volunteerCount, setVolunteerCount] = useState('5');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      setError('Please select a location');
      return;
    }

    const count = parseInt(volunteerCount, 10);
    if (isNaN(count) || count < 1) {
      setError('Please enter a valid volunteer count');
      return;
    }

    if (date.getTime() < Date.now()) {
      setError('Session date must be in the future');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Auto-retry logic (3 attempts)
    let attempts = 0;
    while (attempts < 3) {
      try {
        const result = await createSession({
          location: location as string,
          scheduledDate: date.getTime(),
          volunteerCount: count,
        });

        if (result.hasOverlappingSession) {
          Alert.alert(
            'Warning',
            'There is already an active session at this location.',
            [{ text: 'OK' }]
          );
        }

        // Navigate to QR code display (Plan 05)
        router.push({
          pathname: '/(admin)/session-qr-codes',
          params: { sessionId: result.sessionId },
        });
        return;
      } catch (err) {
        attempts++;
        if (attempts >= 3) {
          setError('Failed to create session. Please try again.');
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="✨ Create Session" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <DropdownSelect
            label="📍 Location"
            options={LOCATIONS}
            selectedValue={location}
            onChange={setLocation}
            placeholder="Select laundromat"
          />

          <View style={styles.dateTimeRow}>
            <View style={styles.dateButton}>
              <Text style={styles.label}>📅 Date</Text>
              <CustomButton
                label={date.toLocaleDateString()}
                onPress={() => setShowDatePicker(true)}
                variant="secondary"
              />
            </View>

            <View style={styles.timeButton}>
              <Text style={styles.label}>🕐 Time</Text>
              <CustomButton
                label={date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                onPress={() => setShowTimePicker(true)}
                variant="secondary"
              />
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={date}
              mode="time"
              onChange={handleTimeChange}
            />
          )}

          <InputField
            label="👥 Number of Volunteer QR Codes"
            value={volunteerCount}
            onChangeText={setVolunteerCount}
            keyboardType="numeric"
            placeholder="5"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <CustomButton
          label="✅ Create Session"
          onPress={handleSubmit}
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },
  form: { padding: Spacing.lg, gap: Spacing.md },
  errorBanner: {
    backgroundColor: Colors.alert,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: 4,
  },
  errorText: { color: 'white', textAlign: 'center', fontWeight: '600' },
  dateTimeRow: { flexDirection: 'row', gap: Spacing.md },
  dateButton: { flex: 1 },
  timeButton: { flex: 1 },
  label: { ...Typography.caption, marginBottom: Spacing.xs, fontWeight: '600' },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
