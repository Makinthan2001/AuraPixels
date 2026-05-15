import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const CATEGORIES = [
  'All', 'Cinematic', 'Anime', 'Minimal', 'Abstract', 'Cyberpunk'
];

interface FilterChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const THEME = {
  background: '#1e293b',
  card: '#334155',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  accent: '#38bdf8',
};

export const FilterChips = ({ selectedCategory, onSelectCategory }: FilterChipsProps) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => onSelectCategory(category)}
              style={[
                styles.chip,
                isSelected ? styles.selectedChip : styles.unselectedChip
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                isSelected ? styles.selectedChipText : styles.unselectedChipText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 15,
  },
  container: {
    paddingHorizontal: 5,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: THEME.accent,
    borderColor: THEME.accent,
  },
  unselectedChip: {
    backgroundColor: THEME.card,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  selectedChipText: {
    color: '#0f172a',
  },
  unselectedChipText: {
    color: THEME.textSecondary,
  },
});
