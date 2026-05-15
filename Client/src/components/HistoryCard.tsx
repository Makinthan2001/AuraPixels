import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

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
}: HistoryCardProps) => {
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
      style={styles.container}
    >
      <View style={styles.card}>
        {/* Image — tappable to open preview */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
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
                    {item.resolution === "portrait"
                      ? "9:16"
                      : item.resolution === "landscape"
                        ? "16:9"
                        : item.resolution === "square"
                          ? "1:1"
                          : item.resolution}
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
          <Ionicons name="heart-outline" size={18} color="#fff" />
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
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    overflow: "hidden",
    height: 300,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
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
