import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { WallpaperImage } from "./WallpaperImage";
import { formatResolutionLabel } from "../utils/image";

interface HistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  style?: string;
  resolution?: string;
  createdAt: string;
}

interface HistoryCardProps {
  item: HistoryItem;
  index: number;
  onPress: () => void;
  onDownload: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  isFavorited?: boolean;
}

const THEME = {
  background: "#1e293b",
  card: "#334155",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  accent: "#38bdf8",
  danger: "#ef4444",
};

export const HistoryCard = ({
  item,
  index,
  onPress,
  onDownload,
  onFavorite,
  onDelete,
  isFavorited = false,
}: HistoryCardProps) => {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = Math.max(160, (width - 60) / 2);
  const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const handleDeletePress = () => {
    onDelete();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(500)}
      style={[styles.container, { width: CARD_WIDTH }]}
    >
      <View style={[styles.card, { aspectRatio: 0.86 }]}>
        {/* Image — tappable to open preview */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          style={styles.imageContainer}
        >
          <WallpaperImage
            uri={item.imageUrl}
            contentFit="cover"
            borderRadius={24}
            style={styles.image}
          />
        </TouchableOpacity>

        {/* Text Overlay — tappable to open preview */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          style={styles.infoContainer}
        >
          <BlurView intensity={30} tint="dark" style={styles.infoOverlay}>
            <Text numberOfLines={2} style={styles.promptText}>
              {item.prompt}
            </Text>

            <View style={styles.tagContainer}>
              {item.style && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.style}</Text>
                </View>
              )}
              {item.resolution && (
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: "rgba(56, 189, 248, 0.2)" },
                  ]}
                >
                  <Text style={[styles.tagText, { color: THEME.accent }]}>
                    {formatResolutionLabel(item.resolution)}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.dateText}>{formattedDate}</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Action Buttons — rendered LAST so they're on top and responsive */}
        {/* Download button - top left */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={onDownload}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="download-outline" size={18} color="#fff" />
        </TouchableOpacity>

        {/* Action Buttons — individually positioned for better touch reliability */}
        {/* Favorite button - top right */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavorite}
          activeOpacity={0.6}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons
            name={isFavorited ? "bookmark" : "bookmark-outline"}
            size={18}
            color={isFavorited ? THEME.accent : "#fff"}
          />
        </TouchableOpacity>

        {/* Delete button - top right, below favorite */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
          activeOpacity={0.6}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="trash-outline" size={18} color={THEME.danger} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  infoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 100,
  },
  deleteButton: {
    position: "absolute",
    top: 56, // Positioned below Favorite button
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 100,
  },
  downloadButton: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(56, 189, 248, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 99,
  },
  infoOverlay: {
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  promptText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dateText: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "500",
  },
});
