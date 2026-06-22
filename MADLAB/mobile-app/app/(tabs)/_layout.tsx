import { Tabs } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Home, Search, List, Settings, Scan, Heart } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0E15',
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#4ADE80',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
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
                  backgroundColor: '#4ADE80',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#4ADE80',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                  borderWidth: 4,
                  borderColor: '#0A0E15',
                }}
              >
                <Scan color="#0A0E15" size={24} strokeWidth={2.5} />
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
