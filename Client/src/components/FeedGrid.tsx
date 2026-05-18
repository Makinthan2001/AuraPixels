import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { WallpaperCard } from "./WallpaperCard";

const SkeletonCard = () => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -120 + shimmer.value * 240 }],
  }));

  return (
    <View style={styles.skeletonCard}>
      <LinearGradient
        colors={["#0f172a", "#172133", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.14)", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

interface FeedItem {
  id: string;
  imageUrl: string;
  prompt: string;
  userName: string;
  likes: number;
  isLiked?: boolean;
}

interface FeedGridProps {
  data: FeedItem[];
  loading: boolean;
  onItemPress: (item: FeedItem) => void;
  onLike: (item: FeedItem) => void;
  actionIconName?: "heart" | "heart-outline" | "bookmark" | "bookmark-outline";
  actionIconColor?: string;
}

export const FeedGrid = ({
  data,
  loading,
  onItemPress,
  onLike,
  actionIconName,
  actionIconColor,
}: FeedGridProps) => {
  // Split data into two columns for masonry-like effect
  const leftColumn = data.filter((_, i) => i % 2 === 0);
  const rightColumn = data.filter((_, i) => i % 2 !== 0);

  if (loading && data.length === 0) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!loading && data.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="image-outline"
            size={48}
            color="#475569"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>
            No wallpapers found for this category
          </Text>
          <Text style={styles.emptyText}>
            Try another category or clear your search to explore more results.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.column}>
            {leftColumn.map((item, index) => (
              <WallpaperCard
                key={item.id}
                id={item.id}
                url={item.imageUrl}
                prompt={item.prompt}
                userName={item.userName}
                likes={item.likes}
                isLiked={item.isLiked}
                actionIconName={actionIconName}
                actionIconColor={actionIconColor}
                onPress={() => onItemPress(item)}
                onLike={() => onLike(item)}
              />
            ))}
          </View>
          <View style={styles.column}>
            {rightColumn.map((item, index) => (
              <WallpaperCard
                key={item.id}
                id={item.id}
                url={item.imageUrl}
                prompt={item.prompt}
                userName={item.userName}
                likes={item.likes}
                isLiked={item.isLiked}
                actionIconName={actionIconName}
                actionIconColor={actionIconColor}
                onPress={() => onItemPress(item)}
                onLike={() => onLike(item)}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    gap: 15,
    alignSelf: "stretch",
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  skeletonGrid: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 20,
    gap: 15,
    alignSelf: "stretch",
  },
  skeletonCard: {
    flex: 1,
    height: 280,
    borderRadius: 24,
    backgroundColor: "#22304a",
    opacity: 0.7,
    overflow: "hidden",
    position: "relative",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 120,
  },
  emptyState: {
    width: "100%",
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
  },
});
