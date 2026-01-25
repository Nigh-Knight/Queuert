import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen
        name="create-session"
        options={{ title: 'Create Session' }}
      />
    </Stack>
  );
}
