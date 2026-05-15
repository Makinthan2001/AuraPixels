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
    backgroundColor: THEME.card,
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 54,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: THEME.text,
    fontSize: 16,
    fontWeight: '500',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    } as any),
  },
});
