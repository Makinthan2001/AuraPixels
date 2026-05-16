import React from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const THEME = {
  background: '#1e293b',
  card: '#334155',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  accent: '#38bdf8',
};

export const SearchBar = ({ value, onChangeText }: SearchBarProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={THEME.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search by prompt..."
        placeholderTextColor={THEME.textSecondary}
        value={value}
        onChangeText={onChangeText}
        underlineColorAndroid="transparent"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.5)', // More translucent dark blue
    borderRadius: 28, // Pill shape
    paddingHorizontal: 20,
    height: 56,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  icon: {
    marginRight: 12,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    color: THEME.text,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    } as any),
  },
});
