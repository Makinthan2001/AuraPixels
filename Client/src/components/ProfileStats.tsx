import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ProfileStatsProps {
  stats: {
    generated: number;
    liked: number;
    favorites: number;
    joinedDate: string;
  };
}

export const ProfileStats = ({ stats }: ProfileStatsProps) => {
  const statItems = [
    { label: 'Generated', value: stats.generated, icon: 'color-wand', color: '#38bdf8' },
    { label: 'Liked', value: stats.liked, icon: 'heart', color: '#ef4444' },
    { label: 'Favorites', value: stats.favorites, icon: 'bookmark', color: '#f59e0b' },
    { label: 'Joined', value: stats.joinedDate, icon: 'calendar', color: '#10b981' },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.container}>
      <View style={styles.grid}>
        {statItems.map((item, index) => (
          <View key={item.label} style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#334155',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
});
