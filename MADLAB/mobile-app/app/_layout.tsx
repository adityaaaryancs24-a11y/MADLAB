import AsyncStorage from "@react-native-async-storage/async-storage";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import 'react-native-reanimated';
import { AppProvider } from '../src/context/AppContext';
import { themeSignal } from '../src/utils/themeSignal';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // 1. Initial theme load
    AsyncStorage.getItem("verity_settings").then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.themeMode === "light" || parsed.themeMode === "dark") {
            setThemeMode(parsed.themeMode);
            return;
          }
        } catch {}
      }
      setThemeMode(systemColorScheme === "light" ? "light" : "dark");
    });

    // 2. Subscribe to theme changes
    const unsubscribe = themeSignal.subscribe((newTheme) => {
      setThemeMode(newTheme);
    });

    return unsubscribe;
  }, [systemColorScheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <ThemeProvider value={themeMode === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[upc]" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
        </ThemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
