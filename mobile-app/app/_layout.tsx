import { useEffect, useRef } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProvider, useApp } from '../src/context/AppContext';

// Prevent the splash screen from auto-hiding before storage is loaded.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Inner navigator — reads context AFTER AppProvider is mounted.
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isReady } = useApp();
  const splashHidden = useRef(false);

  // Hide the splash screen exactly once, as soon as AsyncStorage has hydrated.
  // All auth-based navigation is handled declaratively via <Redirect> inside
  // the individual layouts (tabs/_layout.tsx and index.tsx), NOT here.
  // Driving navigation from this effect caused race conditions with the tab
  // navigator's own routing (router.replace('/') resolved to the tabs' index
  // = Scan tab, not the root login screen).
  useEffect(() => {
    if (!isReady || splashHidden.current) return;
    splashHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, [isReady]);

  // Return null while hydrating — prevents a flash of unstyled content.
  if (!isReady) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Login / sign-up — the true initial route */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* Onboarding slides */}
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        {/* Tab navigator — guarded by (tabs)/_layout.tsx */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Product detail */}
        <Stack.Screen name="product/[upc]" options={{ headerShown: false }} />
        {/* Misc modal */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    // GestureHandlerRootView must be the outermost wrapper —
    // react-native-gesture-handler's Swipeable requires it.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <RootLayoutNav />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
