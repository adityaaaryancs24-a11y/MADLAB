import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { router } from 'expo-router';
import { Home, Search, Settings, Scan, Heart } from 'lucide-react-native';
import { useApp } from '../../src/context/AppContext';

export default function TabLayout() {
  const { isAuthenticated, isReady } = useApp();

  // Guard: if the user is not authenticated, redirect to the login screen.
  // This fires whenever isAuthenticated changes (e.g. after logout) while the
  // tab group is mounted. Using a useEffect + router.replace here (rather than
  // a <Redirect> component) avoids a flash of the tab UI before the redirect.
  //
  // WHY this works when _layout.tsx's approach didn't:
  //   router.replace('/') called from the ROOT layout is ambiguous in Expo
  //   Router v6 — it can resolve to the nearest group index, which inside
  //   the tab context is (tabs)/index (Scan tab). Called from WITHIN the
  //   tab layout, the router still uses the root stack, but the intent is
  //   explicit: we're leaving the (tabs) group entirely.
  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      // Replace the entire (tabs) group with the root login screen.
      // '/' is a valid typed route for app/index.tsx.
      router.replace('/');
    }
  }, [isAuthenticated, isReady]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0E15',
          borderTopColor: 'rgba(255,255,255,0.1)',
        },
        tabBarActiveTintColor: '#4ADE80',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <Scan color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => <Heart color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
