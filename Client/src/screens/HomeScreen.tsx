import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, { FadeIn } from "react-native-reanimated";

import { TopBar } from "../components/TopBar";
import { SearchBar } from "../components/SearchBar";
import { FilterChips } from "../components/FilterChips";
import { FeedGrid } from "../components/FeedGrid";
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
    likes: item?.likes ?? item?.likesCount ?? item?._count?.likes ?? 0,
    isLiked: Boolean(item?.isLiked),
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

  const feedCacheRef = useRef<Record<string, any[]>>({});
  const trendingCacheRef = useRef<any[] | null>(null);
  const requestIdRef = useRef(0);

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
      setLoadingCategory(true);
      setFilteredWallpapers([]);

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
    await Promise.all([fetchTrending(true), fetchFeed({ force: true })]);
    setRefreshing(false);
  }, [fetchFeed, fetchTrending]);

  const handleLike = async (item: any) => {
    try {
      setFilteredWallpapers((prev) => {
        const updated = prev.map((w) => {
          if (w.id === item.id) {
            return {
              ...w,
              isLiked: !w.isLiked,
              likes: w.isLiked ? w.likes - 1 : w.likes + 1,
            };
          }
          return w;
        });

        feedCacheRef.current[feedKey] = updated;
        return updated;
      });

      await api.toggleLike(item.id);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      void fetchFeed({ force: true });
    }
  };

  const openPreview = (item: any) => {
    setSelectedItem(item);
    setIsPreviewVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TopBar title="Discover" />

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

        <View style={[styles.sectionHeader, styles.headerWithViewAll]}>
          <Text style={styles.sectionTitle}>Trending Wallpapers</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        <FeedGrid
          data={trendingWallpapers.slice(0, 4)}
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
                      <Text style={styles.statText}>{selectedItem.likes}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.previewActions}>
                  <TouchableOpacity style={styles.primaryAction}>
                    <Ionicons name="download" size={24} color="#0f172a" />
                    <Text style={styles.primaryActionText}>Download</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity style={styles.iconAction}>
                      <Ionicons name="share-social" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconAction}>
                      <Ionicons name="bookmark" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
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
