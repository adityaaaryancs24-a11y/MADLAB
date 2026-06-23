import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useEffect } from 'react';
import { Home, Search, List, Settings, Scan, Heart } from 'lucide-react-native';
import { useAppTheme } from '../../src/hooks/useAppTheme';
import { useApp } from '../../src/context/AppContext';

export default function TabLayout() {
  const { theme, accent } = useAppTheme();
  const { isAuthenticated, isAuthLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    console.log("Auth state:", isAuthenticated);
  
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isAuthLoading]);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bgCard,
          borderTopColor: theme.border,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: accent.hex,
        tabBarInactiveTintColor: theme.textMuted,
      }}>
      <Tabs.Screen
        name="index"
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
        name="scan"
        options={{
          title: 'Scan',
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={props.onPress || undefined}
              onLongPress={props.onLongPress || undefined}
              accessibilityState={props.accessibilityState}
              activeOpacity={0.85}
              style={[
                props.style,
                {
                  top: -14,
                  justifyContent: 'center',
                  alignItems: 'center',
                }
              ]}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: accent.hex,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: accent.hex,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                  borderWidth: 4,
                  borderColor: theme.bg,
                }}
              >
                <Scan color={theme.bg} size={24} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          ),
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
