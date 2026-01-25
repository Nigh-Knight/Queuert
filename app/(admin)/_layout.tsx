import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Remove the duplicate black header bar
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="session-qr-codes" />
    </Stack>
  );
}
