import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../src/utils/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 25,
          left: 20,
          right: 20,
          height: 72,
          borderRadius: 36,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
            },
            android: {
              elevation: 12,
            },
          }),
        },
        tabBarItemStyle: {
          height: 72,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarBackground: () => (
          <View style={{ 
            ...StyleSheet.absoluteFillObject, 
            borderRadius: 36, 
            overflow: 'hidden',
            backgroundColor: 'rgba(15, 23, 42, 0.4)' 
          }}>
            <BlurView 
              intensity={Platform.OS === 'ios' ? 45 : 90} 
              tint="dark" 
              style={StyleSheet.absoluteFill} 
            />
          </View>
        ),
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'history') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'favorites') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          }

          if (route.name === 'generate') {
            return (
              <View style={styles.generateButton}>
                <Ionicons name="add" size={30} color="#fff" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={26} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="generate" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  generateButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});



