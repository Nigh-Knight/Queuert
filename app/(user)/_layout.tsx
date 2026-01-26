import { Stack } from 'expo-router';

export default function UserLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="registration" />
      <Stack.Screen name="scan-qr" />
      <Stack.Screen name="status" />
    </Stack>
  );
}
