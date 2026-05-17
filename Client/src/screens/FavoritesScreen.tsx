import React, { useState, useEffect, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl, 
  StatusBar, 
  Modal, 
  TouchableOpacity, 
  Alert, 
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

import { api } from '../services/api';
import { FavoritesContext } from '../context/FavoritesContext';
import { FeedGrid } from '../components/FeedGrid';
import { WallpaperImage } from '../components/WallpaperImage';
import { getAspectRatioFromResolution } from '../utils/image';
import { COLORS, SIZES } from '../utils/constants';

const THEME = {
  background: "#1e293b",
  card: "#334155",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  accent: "#38bdf8",
  danger: "#ef4444",
};

export const FavoritesScreen = () => {
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { removeFavorite: removeFavoriteFromContext, addFavorite: addFavoriteToContext, isFavorite } = useContext(FavoritesContext);

  const fetchFavorites = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      const response = await api.getFavorites({ page: pageNum, limit: 10 });
      const newItems = response.data?.data || [];
      
      if (shouldRefresh || pageNum === 1) {
        setFavoritesList(newItems);
      } else {
        setFavoritesList(prev => [...prev, ...newItems]);
      }
      
      setHasMore(newItems.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites(1);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFavorites(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchFavorites(page + 1);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!selectedItem) return;
    
    // Using Context to track optimistic UI
    const currentlyFavorited = isFavorite(String(selectedItem.id)) || favoritesList.some(f => f.id === selectedItem.id);
    
    const wallpaperObj = {
      id: String(selectedItem.id),
      url: selectedItem.imageUrl,
      prompt: selectedItem.prompt,
    };
    
    // Optimistic UI updates
    if (currentlyFavorited) {
      removeFavoriteFromContext(String(selectedItem.id));
      setFavoritesList(prev => prev.filter(f => f.id !== selectedItem.id));
      setIsPreviewVisible(false); // Close modal when unfavoriting from favorites screen
    } else {
      addFavoriteToContext(wallpaperObj);
      setFavoritesList(prev => [selectedItem, ...prev]);
    }

    try {
      const parsedId = parseInt(selectedItem.id, 10);
      if (!Number.isNaN(parsedId)) {
        await api.addFavorite(parsedId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
      fetchFavorites(1, true); // Revert on fail
    }
  };

  const handleDownload = async () => {
    if (!selectedItem?.imageUrl) return;
    try {
      setIsDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save images.');
        return;
      }
      const fileUri = `${FileSystem.documentDirectory}${selectedItem.id}.jpg`;
      const { uri } = await FileSystem.downloadAsync(selectedItem.imageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Wallpaper saved to your gallery!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to download wallpaper.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>{favoritesList.length} saved wallpapers</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.accent} />
        }
        onScroll={({ nativeEvent }) => {
          const isCloseToBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 400;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        <FeedGrid 
          data={favoritesList} 
          loading={loading && favoritesList.length === 0} 
          onItemPress={(item) => {
            setSelectedItem(item);
            setIsPreviewVisible(true);
          }}
          onLike={() => {}} // Not rendering a like button natively in the grid if not requested, but WallpaperCard expects it
        />
      </ScrollView>

      {/* Fullscreen Preview Modal */}
      <Modal
        visible={isPreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

          {selectedItem && (
            <Animated.View entering={FadeIn.duration(300)} style={styles.previewContent}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsPreviewVisible(false)}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>

              <WallpaperImage
                uri={selectedItem.imageUrl}
                aspectRatio={getAspectRatioFromResolution(selectedItem.resolution)}
                contentFit="contain"
                borderRadius={28}
                style={styles.fullImage}
              />

              <BlurView intensity={40} tint="dark" style={styles.previewInfo}>
                <Text style={styles.previewPrompt}>{selectedItem.prompt}</Text>

                <View style={styles.previewFooter}>
                  <View style={styles.previewUser}>
                    <View style={styles.modalAvatar}>
                      <Text style={styles.avatarText}>
                        {(selectedItem.userName || selectedItem.user?.name || "U")[0]}
                      </Text>
                    </View>
                    <Text style={styles.modalUsername}>
                      {selectedItem.userName || selectedItem.user?.name || "AuraPixels"}
                    </Text>
                  </View>

                  <View style={styles.previewStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="heart" size={20} color={THEME.danger} />
                      <Text style={styles.statText}>{selectedItem.likesCount || selectedItem.likes || 0}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.previewActions}>
                  <TouchableOpacity 
                    style={[styles.primaryAction, isDownloading && { opacity: 0.7 }]} 
                    onPress={handleDownload}
                    disabled={isDownloading}
                  >
                    <Ionicons name="download" size={24} color="#0f172a" />
                    <Text style={styles.primaryActionText}>
                      {isDownloading ? "Downloading..." : "Download"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity style={styles.iconAction} onPress={handleFavoriteToggle}>
                      <Ionicons 
                        name="bookmark" 
                        size={24} 
                        color={THEME.accent} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: 15,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.text,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    marginTop: 4,
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
    color: THEME.textSecondary,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  previewContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 0,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    maxWidth: 500,
  },
  previewInfo: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 32,
    padding: 24,
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  previewPrompt: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    marginBottom: 20,
  },
  previewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  previewUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalUsername: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "700",
  },
  previewStats: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  previewActions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.accent,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
  },
  primaryActionText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconAction: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
