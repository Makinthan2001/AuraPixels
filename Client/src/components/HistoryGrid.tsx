import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { HistoryCard } from "./HistoryCard";
import { EmptyHistory } from "./EmptyHistory";

interface HistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  style?: string;
  resolution?: string;
  createdAt: string;
  favoritedByCurrentUser?: boolean;
}

interface HistoryGridProps {
  data: HistoryItem[];
  loading: boolean;
  refreshing?: boolean;
  onItemPress: (item: HistoryItem) => void;
  onDownload: (item: HistoryItem) => void;
  onFavorite: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
  onRefresh?: () => void;
}

export const HistoryGrid = ({
  data,
  loading,
  refreshing = false,
  onItemPress,
  onDownload,
  onFavorite,
  onDelete,
  onRefresh,
}: HistoryGridProps) => {
  const { width } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;

  if (loading && data.length === 0) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={`history-skeleton-${index}`} style={styles.skeletonCard} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => item.id}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#38bdf8"
          />
        ) : undefined
      }
      renderItem={({ item, index }) => (
        <HistoryCard
          item={item}
          index={index}
          onPress={() => onItemPress(item)}
          onDownload={() => onDownload(item)}
          onFavorite={() => onFavorite(item)}
          onDelete={() => onDelete(item)}
          isFavorited={Boolean(item.favoritedByCurrentUser)}
        />
      )}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={[
        styles.contentContainer,
        isDesktopWeb && styles.desktopContent,
      ]}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyHistory />}
    />
  );
};

const styles = StyleSheet.create({
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skeletonCard: {
    width: "48%",
    aspectRatio: 0.82,
    borderRadius: 24,
    marginBottom: 20,
    backgroundColor: "#22304a",
    opacity: 0.7,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    width: "100%",
  },
  contentContainer: {
    paddingBottom: 100,
    paddingTop: 10,
    width: "100%",
  },
  desktopContent: {
    alignSelf: "center",
    maxWidth: 1280,
  },
});
