import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { WallpaperCard } from '../components/WallpaperCard';
import { COLORS, SIZES } from '../utils/constants';
import { MOCK_CATEGORIES, MOCK_WALLPAPERS } from '../utils/mockData';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const renderHeader = () => (
    <View style={styles.header}>
      <Animated.View entering={FadeInDown.duration(800)} style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.title}>Discover Magic</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('ProfileTab')}>
          <View style={styles.profileContainer}>
            <Image 
              source="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" 
              style={styles.profileImage}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.lumina.outline} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for wallpapers..."
          placeholderTextColor={COLORS.lumina.outline}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </Animated.View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer} 
        contentContainerStyle={styles.categoriesContent}
      >
        {MOCK_CATEGORIES.map((cat, index) => (
          <Animated.View key={cat} entering={FadeInRight.delay(index * 100 + 400)}>
            <TouchableOpacity
              style={[
                styles.categoryChip, 
                activeCategory === cat && styles.activeCategoryChip
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[
                styles.categoryText, 
                activeCategory === cat && styles.activeCategoryText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>VIEW ALL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={MOCK_WALLPAPERS}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View 
            entering={FadeInDown.delay(index * 100 + 600)}
            style={[styles.gridItem, index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight]}
          >
            <WallpaperCard
              url={item.url}
              title={item.title}
              height={index % 3 === 0 ? 300 : 220}
              onPress={() => navigation.navigate('WallpaperDetail', { wallpaper: item })}
            />
          </Animated.View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lumina.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    paddingTop: 20,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.lumina.outline,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.lumina.white,
    letterSpacing: -0.5,
  },
  profileBtn: {
    shadowColor: COLORS.lumina.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  profileContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    backgroundColor: COLORS.lumina.surface,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lumina.surface,
    borderRadius: 25,
    height: 54,
    paddingHorizontal: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.lumina.white,
  },
  categoriesContainer: {
    marginBottom: 30,
  },
  categoriesContent: {
    gap: 12,
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.lumina.surface,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeCategoryChip: {
    backgroundColor: COLORS.lumina.primary,
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.lumina.outline,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeCategoryText: {
    color: COLORS.lumina.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.lumina.white,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.lumina.primary,
    letterSpacing: 1,
  },
  gridItem: {
    flex: 1,
    marginBottom: 16,
  },
  gridItemLeft: {
    marginRight: 8,
  },
  gridItemRight: {
    marginLeft: 8,
  },
});
