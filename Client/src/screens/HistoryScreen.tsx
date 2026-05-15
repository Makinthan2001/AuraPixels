import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeInUp, SlideInUp } from "react-native-reanimated";

import { SearchBar } from "../components/SearchBar";
import { FilterChips } from "../components/FilterChips";
import { HistoryGrid } from "../components/HistoryGrid";
import { api } from "../services/api";
import { FavoritesContext } from "../context/FavoritesContext";
import { ConfirmModal } from "../components/ConfirmModal";

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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  
  // Custom Modal States
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isClearAllModalVisible, setIsClearAllModalVisible] = useState(false);

  const { addFavorite } = useContext(FavoritesContext);

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

  const handleClearAll = useCallback(() => {
    setIsClearAllModalVisible(true);
  }, []);

  const executeClearAll = useCallback(async () => {
    try {
      await api.clearAllHistory();
      setHistoryItems([]);
      setIsClearAllModalVisible(false);
      Alert.alert("Success", "History cleared");
    } catch (error) {
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
    } catch (error) {
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

  const handleFavorite = useCallback((item: any) => {
    addFavorite({
      id: item.id.toString(),
      url: item.imageUrl,
      prompt: item.prompt,
      isGenerated: true,
    });
    Alert.alert("Success", "Added to favorites!");
  }, [addFavorite]);

  const openPreview = useCallback((item: any) => {
    setSelectedItem(item);
    setIsPreviewVisible(true);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    let result = historyItems;
    if (searchQuery) {
      result = result.filter((item) =>
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()),
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
  }, [searchQuery, selectedCategory, historyItems]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity style={styles.headerAction} onPress={handleClearAll}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search */}
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Filters */}
        <FilterChips
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Grid */}
        <HistoryGrid
          data={filteredItems}
          loading={loading}
          onItemPress={openPreview}
          onDownload={handleDownload}
          onFavorite={handleFavorite}
          onDelete={handleDelete}
        />
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

              <Image
                source={{ uri: selectedItem.imageUrl }}
                style={styles.fullImage}
                contentFit="contain"
              />

              <BlurView intensity={40} tint="dark" style={styles.previewInfo}>
                <Text style={styles.previewPrompt}>{selectedItem.prompt}</Text>

                <View style={styles.previewMeta}>
                  <View style={styles.previewTag}>
                    <Text style={styles.previewTagText}>
                      {selectedItem.style || "Standard"}
                    </Text>
                  </View>
                  <View style={styles.previewTag}>
                    <Text style={styles.previewTagText}>
                      {selectedItem.resolution || "Portrait"}
                    </Text>
                  </View>
                </View>

                <View style={styles.previewActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalAction,
                      { backgroundColor: THEME.accent },
                    ]}
                    onPress={() => handleDownload(selectedItem)}
                  >
                    <Ionicons name="download" size={20} color="#0f172a" />
                    <Text
                      style={[styles.modalActionText, { color: "#0f172a" }]}
                    >
                      Download
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalAction}
                    onPress={() => handleFavorite(selectedItem)}
                  >
                    <Ionicons name="heart" size={20} color="#fff" />
                    <Text style={styles.modalActionText}>Favorite</Text>
                  </TouchableOpacity>
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
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.text,
    letterSpacing: 0.5,
  },
  headerAction: {
    width: 60,
    alignItems: "flex-end",
  },
  clearText: {
    color: THEME.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 0, // Grid handles its own padding
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
    width: width,
    height: height * 0.7,
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
    overflow: "hidden",
  },
  previewPrompt: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    lineHeight: 24,
  },
  previewMeta: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 25,
  },
  previewTag: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  previewTagText: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  previewActions: {
    flexDirection: "row",
    gap: 15,
  },
  modalAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  modalActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
