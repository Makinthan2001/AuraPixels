import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../src/utils/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'generate') {
            iconName = focused ? 'color-wand' : 'color-wand-outline';
          } else if (route.name === 'favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: '#8ed5ff',
        tabBarInactiveTintColor: '#87929a',
        tabBarStyle: {
          backgroundColor: '#0f1418',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.05)',
          elevation: 0,
          height: 80,
          paddingBottom: 20,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarShowLabel: false,
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="generate" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
