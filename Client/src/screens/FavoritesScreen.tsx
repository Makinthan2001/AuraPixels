import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesContext } from '../context/FavoritesContext';
import { WallpaperCard } from '../components/WallpaperCard';
import { COLORS, SIZES } from '../utils/constants';
import { TopBar } from '../components/TopBar';

export const FavoritesScreen = ({ navigation }: any) => {
  const { favorites } = useContext(FavoritesContext);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={COLORS.surface} />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Wallpapers you like will appear here. Start exploring or generate some magic!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Favorites" />
      
      <View style={styles.header}>
        <Text style={styles.subtitle}>{favorites.length} saved wallpapers</Text>
      </View>

      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={[styles.gridItem, index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight]}>
              <WallpaperCard
                url={item.url}
                title={item.title}
                height={200}
                onPress={() => navigation.navigate('WallpaperDetail', { wallpaper: item })}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  listContent: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: 100,
  },
  gridItem: {
    flex: 1,
    marginBottom: SIZES.md,
  },
  gridItemLeft: {
    marginRight: SIZES.sm,
  },
  gridItemRight: {
    marginLeft: SIZES.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
