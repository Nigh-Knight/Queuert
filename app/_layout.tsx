import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Get Convex URL from environment with fallback
const convexUrl = Constants.expoConfig?.extra?.convexUrl ||
                  process.env.EXPO_PUBLIC_CONVEX_URL ||
                  'https://cheerful-greyhound-927.convex.cloud';

console.log('[Convex] Initializing with URL:', convexUrl);

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ConvexProvider client={convex}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="provider" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ConvexProvider>
    </SafeAreaProvider>
  );
}
