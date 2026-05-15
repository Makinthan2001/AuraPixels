import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

const THEME = {
  textSecondary: '#94a3b8',
  accent: '#38bdf8',
};

export const EmptyHistory = () => {
  return (
    <Animated.View 
      entering={FadeIn.duration(800)}
      style={styles.container}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="time-outline" size={60} color={THEME.accent} />
      </View>
      <Text style={styles.title}>No generated wallpapers yet</Text>
      <Text style={styles.subtitle}>Your creations will appear here once you generate them.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
