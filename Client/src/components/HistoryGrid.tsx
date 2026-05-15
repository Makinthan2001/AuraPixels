import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { HistoryCard } from './HistoryCard';
import { EmptyHistory } from './EmptyHistory';

interface HistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  style?: string;
  resolution?: string;
  createdAt: string;
}

interface HistoryGridProps {
  data: HistoryItem[];
  loading: boolean;
  onItemPress: (item: HistoryItem) => void;
  onDownload: (item: HistoryItem) => void;
  onFavorite: (item: HistoryItem) => void;
  onDelete: (item: HistoryItem) => void;
}

const THEME = {
  accent: '#38bdf8',
};

export const HistoryGrid = ({ 
  data, 
  loading, 
  onItemPress, 
  onDownload, 
  onFavorite, 
  onDelete 
}: HistoryGridProps) => {
  if (loading && data.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={THEME.accent} />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <HistoryCard
          item={item}
          index={index}
          onPress={() => onItemPress(item)}
          onDownload={() => onDownload(item)}
          onFavorite={() => onFavorite(item)}
          onDelete={() => onDelete(item)}
        />
      )}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyHistory />}
    />
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 100,
    paddingTop: 10,
  },
});
