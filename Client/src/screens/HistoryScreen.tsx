import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { BlurView } from "expo-blur";
import Animated, { FadeIn } from "react-native-reanimated";

import { SearchBar } from "../components/SearchBar";
import { FilterChips } from "../components/FilterChips";
import { HistoryGrid } from "../components/HistoryGrid";
import { api } from "../services/api";
import { FavoritesContext } from "../context/FavoritesContext";
import { ConfirmModal } from "../components/ConfirmModal";
import { TopBar } from "../components/TopBar";
import { WallpaperImage } from "../components/WallpaperImage";
import { getAspectRatioFromResolution } from "../utils/image";

const { width, height } = Dimensions.get("window");

const THEME = {
  background: "#1e293b",
  card: "#334155",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  accent: "#38bdf8",
  danger: "#ef4444",
};

export const HistoryScreen = () => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  // Custom Modal States
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isClearAllModalVisible, setIsClearAllModalVisible] = useState(false);

  const { addFavorite, removeFavorite, isFavorite, toggleFavorite } =
    useContext(FavoritesContext);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getHistory();
      const items = response.data.items || response.data;
      setHistoryItems(items);
      setFilteredItems(items);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const executeClearAll = useCallback(async () => {
    try {
      await api.clearAllHistory();
      setHistoryItems([]);
      setIsClearAllModalVisible(false);
      Alert.alert("Success", "History cleared");
    } catch {
      Alert.alert("Error", "Failed to clear history");
    }
  }, []);

  const handleDelete = useCallback((item: any) => {
    setItemToDelete(item);
    setIsDeleteModalVisible(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteHistoryItem(itemToDelete.id);
      setHistoryItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      setIsDeleteModalVisible(false);
      setItemToDelete(null);
    } catch {
      Alert.alert("Error", "Failed to delete history item");
    }
  }, [itemToDelete]);

  const handleDownload = useCallback(async (item: any) => {
    if (!item?.imageUrl) return;

    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = item.imageUrl;
        link.download = `AuraPixels-${Date.now()}.png`;
        link.target = "_blank";
        link.rel = "noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert("Success", "Wallpaper download started.");
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant gallery access to download.",
        );
        return;
      }

      const fileUri = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? ""}AuraPixels-${Date.now()}.png`;

      const downloadRes = await FileSystem.downloadAsync(
        item.imageUrl,
        fileUri,
      );
      if (downloadRes.status !== 200) throw new Error("Download failed");

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert("Success", "Wallpaper saved to gallery!");
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Error", "Failed to save image.");
    }
  }, []);

  const handleFavoriteToggle = useCallback(
    async (item: any) => {
      const wallpaperId = item.wallpaperId ?? null;
      const currentlyFavorited = Boolean(
        item.favoritedByCurrentUser ??
        isFavorite(String(item.wallpaperId ?? item.id)),
      );
      const wallpaperObj = {
        id: String(item.wallpaperId ?? item.id),
        wallpaperId,
        url: item.imageUrl,
        prompt: item.prompt,
        isGenerated: true,
      };

      const persistable = wallpaperId !== null && wallpaperId !== undefined;

      try {
        if (persistable) {
          await toggleFavorite(wallpaperObj);
        } else if (currentlyFavorited) {
          removeFavorite(String(item.id));
        } else {
          addFavorite(wallpaperObj);
        }

        const nextFavorited = !currentlyFavorited;

        setHistoryItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, favoritedByCurrentUser: nextFavorited }
              : entry,
          ),
        );
        setFilteredItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, favoritedByCurrentUser: nextFavorited }
              : entry,
          ),
        );

        if (selectedItem?.id === item.id) {
          setSelectedItem((current: any) =>
            current
              ? { ...current, favoritedByCurrentUser: nextFavorited }
              : current,
          );
        }
      } catch (error) {
        if (currentlyFavorited) {
          addFavorite(wallpaperObj);
        } else {
          removeFavorite(String(item.id));
        }

        setHistoryItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, favoritedByCurrentUser: currentlyFavorited }
              : entry,
          ),
        );
        setFilteredItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, favoritedByCurrentUser: currentlyFavorited }
              : entry,
          ),
        );

        Alert.alert("Error", "Failed to update favorite status");
      }
    },
    [addFavorite, removeFavorite, isFavorite, toggleFavorite, selectedItem],
  );

  const openPreview = useCallback((item: any) => {
    setSelectedItem(item);
    setIsPreviewVisible(true);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 220);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const filterKey = useMemo(
    () => `${selectedCategory}::${debouncedSearchQuery.trim().toLowerCase()}`,
    [selectedCategory, debouncedSearchQuery],
  );

  useEffect(() => {
    let result = historyItems;

    if (debouncedSearchQuery) {
      result = result.filter((item) =>
        item.prompt.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter(
        (item) =>
          item.style &&
          item.style.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    setFilteredItems(result);
  }, [debouncedSearchQuery, selectedCategory, historyItems]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <TopBar />

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchWrapper}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {/* Filters */}
        <FilterChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Grid */}
        <Animated.View
          key={filterKey}
          entering={FadeIn.duration(180)}
          style={{ flex: 1 }}
        >
          <HistoryGrid
            data={filteredItems}
            loading={loading}
            onItemPress={openPreview}
            onDownload={handleDownload}
            onFavorite={handleFavoriteToggle}
            onDelete={handleDelete}
          />
        </Animated.View>
      </View>

      {/* Fullscreen Preview Modal */}
      <Modal
        visible={isPreviewVisible}
        transparent={true}
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
                style={styles.closeButton}
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
                        {(selectedItem.userName || "Y")[0]}
                      </Text>
                    </View>
                    <Text style={styles.modalUsername}>
                      {selectedItem.userName || "You"}
                    </Text>
                  </View>

                  <View style={styles.previewStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="heart" size={20} color={THEME.danger} />
                      <Text style={styles.statText}>
                        {selectedItem.likesCount ?? selectedItem.likes ?? 0}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={styles.primaryAction}
                    onPress={() => handleDownload(selectedItem)}
                  >
                    <Ionicons name="download" size={24} color="#0f172a" />
                    <Text style={styles.primaryActionText}>Download</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity
                      style={styles.iconAction}
                      onPress={() => handleFavoriteToggle(selectedItem)}
                    >
                      <Ionicons
                        name={
                          selectedItem &&
                          (selectedItem.favoritedByCurrentUser ||
                            isFavorite(
                              String(
                                selectedItem.wallpaperId ?? selectedItem.id,
                              ),
                            ))
                            ? "bookmark"
                            : "bookmark-outline"
                        }
                        size={24}
                        color={
                          selectedItem &&
                          (selectedItem.favoritedByCurrentUser ||
                            isFavorite(
                              String(
                                selectedItem.wallpaperId ?? selectedItem.id,
                              ),
                            ))
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

      {/* Confirmation Modals */}
      <ConfirmModal
        visible={isDeleteModalVisible}
        title="Delete History"
        message="Are you sure you want to remove this generation? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => {
          setIsDeleteModalVisible(false);
          setItemToDelete(null);
        }}
        confirmText="Delete"
        isDestructive={true}
      />

      <ConfirmModal
        visible={isClearAllModalVisible}
        title="Clear History"
        message="Are you sure you want to delete all your generation history? This will permanently remove all items."
        onConfirm={executeClearAll}
        onCancel={() => setIsClearAllModalVisible(false)}
        confirmText="Clear All"
        isDestructive={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: 15,
  },
  content: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContent: {
    width: width,
    height: height,
    justifyContent: "center",
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
  closeButton: {
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
