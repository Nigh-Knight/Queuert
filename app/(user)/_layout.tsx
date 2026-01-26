import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="scan-session" />
      <Stack.Screen name="phone-entry" />
      <Stack.Screen name="queue-status" />
    </Stack>
  );
}
