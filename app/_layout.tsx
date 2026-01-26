import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

function NavigationBarWrapper({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  // Add extra padding above navigation bar to push content up
  const navigationBarHeight = Math.max(insets.bottom, 20);
  const topPadding = 16; // Spacing.md equivalent for consistent gap

  return (
    <View style={{ flex: 1 }}>
      {children}
      {/* Global black navigation bar with top padding for content spacing */}
      <View
        style={[
          styles.globalNavigationBar,
          {
            height: navigationBarHeight + topPadding,
            paddingTop: topPadding,
          }
        ]}
      />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ConvexProvider client={convex}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <NavigationBarWrapper>
            <Stack
              screenOptions={{
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="provider" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
              <Stack.Screen name="(volunteer)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="dark" />
          </NavigationBarWrapper>
        </ThemeProvider>
      </ConvexProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  globalNavigationBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    zIndex: 9999, // Ensure it's always on top
    // Note: height includes topPadding to create breathing room for all bottom elements
    // This prevents FABs, buttons, and pagination dots from getting too close to nav buttons
  },
});
