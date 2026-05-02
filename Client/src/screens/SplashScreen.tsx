import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { COLORS } from '../utils/constants';

export const SplashScreen = ({ navigation }: any) => {
  const scale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10 });
    
    // Fake loading delay before routing will be handled in AppNavigator
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Text style={styles.logoText}>AuraPixels</Text>
      </Animated.View>
      <Animated.Text entering={FadeIn.delay(500)} style={styles.subtitle}>
        AI-Powered Wallpapers
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
