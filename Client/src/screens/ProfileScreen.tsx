import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { WallpaperCard } from '../components/WallpaperCard';
import { COLORS, SIZES, SHADOWS } from '../utils/constants';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useContext(AuthContext);
  const { favorites, history } = useContext(FavoritesContext);

  const renderHeader = () => (
    <View>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{history.length}</Text>
          <Text style={styles.statLabel}>Generated</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Downloads</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Generation History</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <View style={styles.historyImageWrapper}>
              <WallpaperCard
                url={item.url}
                height={100}
                onPress={() => navigation.navigate('WallpaperDetail', { wallpaper: item })}
              />
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyPrompt} numberOfLines={2}>&quot;{item.prompt}&quot;</Text>
              <View style={styles.historyTags}>
                {item.tags?.map(tag => (
                  <Text key={tag} style={styles.historyTagText}>#{tag}</Text>
                ))}
              </View>
              <TouchableOpacity 
                style={styles.reGenerateBtn}
                onPress={() => navigation.navigate('GenerateTab', { initialPrompt: item.prompt })}
              >
                <Text style={styles.reGenerateText}>Regenerate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No generation history yet.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SIZES.lg,
    paddingBottom: 100,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    padding: SIZES.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    ...SHADOWS.subtle,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SIZES.md,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.sm,
    marginBottom: SIZES.md,
    ...SHADOWS.subtle,
  },
  historyImageWrapper: {
    width: 80,
  },
  historyInfo: {
    flex: 1,
    marginLeft: SIZES.md,
    justifyContent: 'center',
  },
  historyPrompt: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  historyTags: {
    flexDirection: 'row',
    gap: SIZES.xs,
    marginBottom: SIZES.sm,
  },
  historyTagText: {
    fontSize: 12,
    color: COLORS.secondary,
  },
  reGenerateBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  reGenerateText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
  },
});
