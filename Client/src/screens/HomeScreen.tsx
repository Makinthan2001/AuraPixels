import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  RefreshControl,
  Modal,
  Platform,
  Share,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, { FadeIn } from "react-native-reanimated";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

import { FavoritesContext } from "../context/FavoritesContext";
import { TopBar } from "../components/TopBar";
import { SearchBar } from "../components/SearchBar";
import { FilterChips } from "../components/FilterChips";
import { FeedGrid } from "../components/FeedGrid";
import { TrendingCarousel } from "../components/TrendingCarousel";
import { WallpaperImage } from "../components/WallpaperImage";
import { api } from "../services/api";
import { MOCK_WALLPAPERS } from "../utils/mockData";
import { getAspectRatioFromResolution, repairImageUrl } from "../utils/image";

const { width, height } = Dimensions.get("window");

const THEME = {
  background: "#1e293b",
  text: "#ffffff",
  accent: "#38bdf8",
  danger: "#ef4444",
};

const normalizeWallpaper = (item: any) => {
  const username =
    item?.userName ||
    item?.username ||
    item?.user?.name ||
    item?.creator?.name ||
    "Anonymous";
  const profileImage =
    item?.profileImage ||
    item?.userAvatar ||
    item?.user?.profileImage ||
    item?.creator?.profileImage ||
    null;

  return {
    id: String(item?.id ?? item?.title ?? Date.now()),
    imageUrl: repairImageUrl(item?.imageUrl || item?.url || ""),
    prompt: item?.prompt || item?.title || "Generated wallpaper",
    userName: username,
    user: item?.user || { name: username, avatar: profileImage || undefined },
    likes: item?.likesCount ?? item?.likes ?? item?._count?.likes ?? 0,
    likesCount: item?.likesCount ?? item?.likes ?? item?._count?.likes ?? 0,
    favoritesCount: item?.favoritesCount ?? item?._count?.favorites ?? 0,
    isLiked: Boolean(item?.likedByCurrentUser ?? item?.isLiked),
    isFavorited: Boolean(item?.favoritedByCurrentUser ?? item?.isFavorited),
    profileImage,
    category: item?.category || item?.style || null,
    style: item?.style,
    resolution: item?.resolution,
  };
};

const fallbackFeedItems = MOCK_WALLPAPERS.map((item, index) => ({
  id: item.id,
  imageUrl: item.url,
  prompt: item.title,
  userName: "AuraPixels",
  user: { name: "AuraPixels" },
  likes: 0,
  isLiked: false,
  style: item.tags?.[0] || "Featured",
  resolution: index % 2 === 0 ? "portrait" : "square",
}));

export const HomeScreen = () => {
  const [trendingWallpapers, setTrendingWallpapers] = useState<any[]>([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState<any[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const { homeFeedRevision } = useContext(FavoritesContext);

  const feedCacheRef = useRef<Record<string, any[]>>({});
  const trendingCacheRef = useRef<any[] | null>(null);
  const requestIdRef = useRef(0);
  const lastSyncedRevisionRef = useRef(0);

  const feedKey = useMemo(
    () => `${selectedCategory}::${debouncedSearchQuery.trim().toLowerCase()}`,
    [selectedCategory, debouncedSearchQuery],
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearchQuery(searchQuery), 250);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchTrending = useCallback(async (force = false) => {
    try {
      if (!force && trendingCacheRef.current) {
        setTrendingWallpapers(trendingCacheRef.current);
        return;
      }

      setIsTrendingLoading(true);
      const trendingRes = await api.getTrending();
      const trendingItems = Array.isArray(trendingRes.data?.data)
        ? trendingRes.data.data
        : [];

      const normalizedTrending =
        trendingItems.length > 0
          ? trendingItems.map(normalizeWallpaper)
          : fallbackFeedItems.map((item) => ({
              ...item,
              user: { name: item.userName },
            }));

      trendingCacheRef.current = normalizedTrending;
      setTrendingWallpapers(normalizedTrending);
    } catch (error) {
      console.error("Failed to fetch trending wallpapers:", error);
      setTrendingWallpapers(fallbackFeedItems);
    } finally {
      setIsTrendingLoading(false);
    }
  }, []);

  const fetchFeed = useCallback(
    async (options?: {
      force?: boolean;
      category?: string;
      search?: string;
      preserveCurrent?: boolean;
    }) => {
      const category = options?.category ?? selectedCategory;
      const search = (options?.search ?? debouncedSearchQuery).trim();
      const cacheKey = `${category}::${search.toLowerCase()}`;
      const cached = feedCacheRef.current[cacheKey];

      if (cached && !options?.force) {
        setFilteredWallpapers(cached);
        setLoadingCategory(false);
        return;
      }

      const requestId = ++requestIdRef.current;
      if (!options?.preserveCurrent) {
        setLoadingCategory(true);
        setFilteredWallpapers([]);
      }

      try {
        const response = await api.getFeed({
          category: category === "All" ? undefined : category,
          search: search || undefined,
        });

        const feedItems = Array.isArray(response.data?.data?.wallpapers)
          ? response.data.data.wallpapers
          : [];

        const normalizedFeed = feedItems.map(normalizeWallpaper);

        if (requestId !== requestIdRef.current) {
          return;
        }

        feedCacheRef.current[cacheKey] = normalizedFeed;
        setFilteredWallpapers(normalizedFeed);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        console.error("Failed to fetch feed:", error);
        setFilteredWallpapers(fallbackFeedItems);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoadingCategory(false);
        }
      }
    },
    [debouncedSearchQuery, selectedCategory],
  );

  useEffect(() => {
    void fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  useFocusEffect(
    useCallback(() => {
      if (lastSyncedRevisionRef.current === homeFeedRevision) {
        return;
      }

      lastSyncedRevisionRef.current = homeFeedRevision;
      requestIdRef.current += 1;

      void Promise.all([
        fetchTrending(true),
        fetchFeed({ force: true, preserveCurrent: true }),
      ]);
    }, [fetchFeed, fetchTrending, homeFeedRevision]),
  );

  const handleSelectCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category);

      const cacheKey = `${category}::${debouncedSearchQuery.trim().toLowerCase()}`;
      const cached = feedCacheRef.current[cacheKey];

      if (cached) {
        setFilteredWallpapers(cached);
        setLoadingCategory(false);
      } else {
        setFilteredWallpapers([]);
        setLoadingCategory(true);
      }
    },
    [debouncedSearchQuery],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchTrending(true),
      fetchFeed({ force: true, preserveCurrent: true }),
    ]);
    setRefreshing(false);
  }, [fetchFeed, fetchTrending]);

  const patchWallpaperState = useCallback(
    (wallpaperId: string, patcher: (item: any) => any) => {
      const applyPatch = (items: any[]) =>
        items.map((item) =>
          String(item.id) === String(wallpaperId) ? patcher(item) : item,
        );

      setTrendingWallpapers((prev) => applyPatch(prev));
      setFilteredWallpapers((prev) => applyPatch(prev));

      if (trendingCacheRef.current) {
        trendingCacheRef.current = applyPatch(trendingCacheRef.current);
      }

      Object.keys(feedCacheRef.current).forEach((key) => {
        feedCacheRef.current[key] = applyPatch(feedCacheRef.current[key]);
      });

      setSelectedItem((current) =>
        current && String(current.id) === String(wallpaperId)
          ? patcher(current)
          : current,
      );
    },
    [],
  );

  const handleLike = async (item: any) => {
    const wallpaperId = String(item.id);
    const likedBefore = Boolean(item.likedByCurrentUser ?? item.isLiked);

    try {
      patchWallpaperState(wallpaperId, (current) => ({
        ...current,
        isLiked: !likedBefore,
        likedByCurrentUser: !likedBefore,
        likes: Math.max(
          (current.likes ?? current.likesCount ?? 0) + (likedBefore ? -1 : 1),
          0,
        ),
        likesCount: Math.max(
          (current.likesCount ?? current.likes ?? 0) + (likedBefore ? -1 : 1),
          0,
        ),
      }));

      const response = await api.toggleLike(item.id);
      const payload = response.data?.data ?? response.data ?? {};
      const liked = Boolean(
        payload?.liked ?? payload?.likedByCurrentUser ?? !likedBefore,
      );
      const likesCount = Number(payload?.likesCount ?? 0);

      patchWallpaperState(wallpaperId, (current) => ({
        ...current,
        isLiked: liked,
        likedByCurrentUser: liked,
        likes: likesCount,
        likesCount,
      }));
    } catch (error) {
      console.error("Failed to toggle like:", error);
      void fetchFeed({ force: true });
      void fetchTrending(true);
    }
  };

  const openPreview = (item: any) => {
    setSelectedItem(item);
    setIsPreviewVisible(true);
  };

  const handleDownload = async () => {
    if (!selectedItem?.imageUrl) return;
    try {
      setIsDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to save images.",
        );
        return;
      }
      const fileUri = `${FileSystem.documentDirectory}${selectedItem.id}.jpg`;
      const { uri } = await FileSystem.downloadAsync(
        selectedItem.imageUrl,
        fileUri,
      );
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Success", "Wallpaper saved to your gallery!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to download wallpaper.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFavorite = async () => {
    if (!selectedItem) return;

    const wallpaperObj = {
      id: String(selectedItem.id),
      url: selectedItem.imageUrl,
      prompt: selectedItem.prompt,
      wallpaperId: Number.parseInt(selectedItem.id, 10),
    };

    try {
      const result = await toggleFavorite(wallpaperObj);

      if (result.favorited) {
        Alert.alert("Success", "Added to favorites!");
      } else {
        Alert.alert("Removed", "Removed from favorites.");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Failed to update favorites. Please check if you are logged in and the wallpaper exists.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <TopBar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.accent}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchWrapper}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <TrendingCarousel
          data={trendingWallpapers}
          loading={isTrendingLoading}
          onItemPress={openPreview}
          onLike={handleLike}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
        </View>
        <FilterChips
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />

        <View style={[styles.sectionHeader, { marginTop: 25 }]}>
          <Text style={styles.sectionTitle}>Wallpapers</Text>
        </View>
        <Animated.View key={feedKey} entering={FadeIn.duration(180)}>
          <FeedGrid
            data={filteredWallpapers}
            loading={loadingCategory}
            onItemPress={openPreview}
            onLike={handleLike}
          />
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={isPreviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />

          {selectedItem && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.previewContent}
            >
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsPreviewVisible(false)}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>

              <WallpaperImage
                uri={selectedItem.imageUrl}
                aspectRatio={getAspectRatioFromResolution(
                  selectedItem.resolution,
                )}
                contentFit="cover"
                borderRadius={28}
                style={[styles.fullImage, styles.imageShadow]}
              />

              <BlurView intensity={40} tint="dark" style={styles.previewInfo}>
                <Text style={styles.previewPrompt}>{selectedItem.prompt}</Text>

                <View style={styles.previewFooter}>
                  <View style={styles.previewUser}>
                    <View style={styles.modalAvatar}>
                      <Text style={styles.avatarText}>
                        {(selectedItem.userName || selectedItem.user.name)[0]}
                      </Text>
                    </View>
                    <Text style={styles.modalUsername}>
                      {selectedItem.userName || selectedItem.user.name}
                    </Text>
                  </View>

                  <View style={styles.previewStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="heart" size={20} color={THEME.danger} />
                      <Text style={styles.statText}>
                        {selectedItem.likesCount ?? selectedItem.likes}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={[
                      styles.primaryAction,
                      isDownloading && { opacity: 0.7 },
                    ]}
                    onPress={handleDownload}
                    disabled={isDownloading}
                  >
                    <Ionicons name="download" size={24} color="#0f172a" />
                    <Text style={styles.primaryActionText}>
                      {isDownloading ? "Downloading..." : "Download"}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity
                      style={styles.iconAction}
                      onPress={handleFavorite}
                    >
                      <Ionicons
                        name={
                          selectedItem && isFavorite(String(selectedItem.id))
                            ? "bookmark"
                            : "bookmark-outline"
                        }
                        size={24}
                        color={
                          selectedItem && isFavorite(String(selectedItem.id))
                            ? THEME.accent
                            : "#fff"
                        }
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
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: 15,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerWithViewAll: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.text,
    letterSpacing: 0.5,
  },
  viewAllLink: {
    fontSize: 14,
    color: THEME.accent,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContent: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  fullImage: {
    width: width - 40,
    maxHeight: height * 0.68,
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  imageShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  previewInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    overflow: "hidden",
  },
  previewPrompt: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    lineHeight: 24,
  },
  previewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
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
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
  modalUsername: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  previewStats: {
    flexDirection: "row",
    gap: 15,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  previewActions: {
    flexDirection: "row",
    gap: 15,
  },
  primaryAction: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.accent,
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  primaryActionText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryActions: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  iconAction: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
});
