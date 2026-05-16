import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { WallpaperImage } from "./WallpaperImage";

interface WallpaperCardProps {
  id: string;
  url: string;
  prompt: string;
  userName: string;
  likes: number;
  isLiked?: boolean;
  onPress: () => void;
  onLike?: () => void;
}

const THEME = {
  background: "#1e293b",
  card: "#334155",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  accent: "#38bdf8",
  danger: "#ef4444",
};

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  url,
  prompt,
  userName,
  likes,
  isLiked = false,
  onPress,
  onLike,
}) => {
  const resolvedAspectRatio = 0.86;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.container, { aspectRatio: resolvedAspectRatio }]}
      >
        <WallpaperImage
          uri={url}
          contentFit="cover"
          borderRadius={24}
          style={styles.image}
        />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.overlay}
        >
          <View style={styles.info}>
            <Text style={styles.prompt} numberOfLines={2}>
              {prompt}
            </Text>

            <View style={styles.footer}>
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{userName[0]}</Text>
                </View>
                <Text style={styles.userName} numberOfLines={1}>
                  {userName}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.likeBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  onLike?.();
                }}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={18}
                  color={isLiked ? THEME.danger : "#fff"}
                />
                <Text style={styles.likesText}>{likes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 15,
  },
  container: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    justifyContent: "flex-end",
    padding: 12,
  },
  info: {
    gap: 8,
  },
  prompt: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    opacity: 0.9,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0f172a",
  },
  userName: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  likesText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
});
