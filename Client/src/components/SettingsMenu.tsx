import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color?: string;
  onPress: () => void;
  isDestructive?: boolean;
}

interface SettingsMenuProps {
  items: MenuItem[];
}

export const SettingsMenu = ({ items }: SettingsMenuProps) => {
  return (
    <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.container}>
      <View style={styles.menuCard}>
        {items.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={item.onPress}
              style={styles.menuItem}
            >
              <View style={styles.leftSection}>
                <View style={[styles.iconBox, { backgroundColor: item.isDestructive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)' }]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={item.isDestructive ? '#ef4444' : (item.color || '#94a3b8')} 
                  />
                </View>
                <Text style={[styles.label, item.isDestructive && styles.destructiveLabel]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={18} 
                color="rgba(148, 163, 184, 0.5)" 
              />
            </TouchableOpacity>
            {index < items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 100,
  },
  menuCard: {
    backgroundColor: '#334155',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  destructiveLabel: {
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 16,
  },
});
