import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeInRight,
  type SharedValue,
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.82;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;
const SPACING = 16;
const FULL_ITEM_SIZE = ITEM_WIDTH + SPACING;

interface TrendingItem {
  id: string;
  imageUrl: string;
  prompt: string;
  userName: string;
  user?: {
    name: string;
    avatar?: string;
  };
  likes: number;
  isLiked?: boolean;
}

interface TrendingCarouselProps {
  data: TrendingItem[];
  loading: boolean;
  onItemPress: (item: TrendingItem) => void;
  onLike?: (item: TrendingItem) => void;
}

const THEME = {
  background: "#1e293b",
  card: "#334155",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  accent: "#38bdf8",
  danger: "#ef4444",
  success: "#10b981",
};

const TrendingCard = ({ 
  item, 
  index, 
  scrollX, 
  onPress,
  onLike 
}: { 
  item: TrendingItem; 
  index: number; 
  scrollX: SharedValue<number>;
  onPress: () => void;
  onLike?: () => void;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * FULL_ITEM_SIZE,
      index * FULL_ITEM_SIZE,
      (index + 1) * FULL_ITEM_SIZE,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.92, 1, 0.92],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * FULL_ITEM_SIZE,
      index * FULL_ITEM_SIZE,
      (index + 1) * FULL_ITEM_SIZE,
    ];

    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [-40, 0, 40],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }, { scale: 1.1 }],
    };
  });

  return (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPress}
        style={styles.card}
      >
        <Animated.View style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: item.imageUrl }}
            style={[styles.image, imageAnimatedStyle]}
            contentFit="cover"
            transition={500}
            cachePolicy="memory-disk"
          />
        </Animated.View>
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <View style={styles.infoContainer}>
            <Text style={styles.prompt} numberOfLines={2}>
              {item.prompt}
            </Text>
            
            <View style={styles.footer}>
              <View style={styles.userContainer}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{(item.userName || item.user?.name || 'A')[0]}</Text>
                </View>
                <Text style={styles.username}>{item.userName || item.user?.name}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.likesBadge}
                onPress={(e) => {
                  e.stopPropagation();
                  onLike?.();
                }}
              >
                <Ionicons 
                  name={item.isLiked ? "heart" : "heart-outline"} 
                  size={16} 
                  color={item.isLiked ? THEME.danger : "#fff"} 
                />
                <Text style={styles.likesCount}>{item.likes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const SkeletonCard = () => (
  <View style={[styles.cardContainer, { opacity: 0.6 }]}>
    <View style={[styles.card, { backgroundColor: THEME.card }]}>
      <LinearGradient
        colors={[THEME.card, '#475569', THEME.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  </View>
);

export const TrendingCarousel = ({ data, loading, onItemPress, onLike }: TrendingCarouselProps) => {
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const renderItem = useCallback(({ item, index }: { item: TrendingItem; index: number }) => (
    <TrendingCard 
      item={item} 
      index={index} 
      scrollX={scrollX} 
      onPress={() => onItemPress(item)}
      onLike={() => onLike?.(item)}
    />
  ), [onItemPress, onLike, scrollX]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Trending Now</Text>
        </View>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
        >
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </Animated.ScrollView>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Trending Now</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="flame-outline" size={48} color={THEME.textSecondary} />
          <Text style={styles.emptyText}>No trending wallpapers yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Trending Now</Text>
        </View>
      </View>

      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={FULL_ITEM_SIZE}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={Platform.OS === 'android'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trendingBadge: {
    backgroundColor: THEME.danger,
    padding: 6,
    borderRadius: 8,
    shadowColor: THEME.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.text,
    letterSpacing: -0.5,
  },
  viewAll: {
    fontSize: 14,
    color: THEME.accent,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  cardContainer: {
    width: ITEM_WIDTH,
    marginRight: SPACING,
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 24,
  },
  infoContainer: {
    gap: 14,
  },
  prompt: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '900',
  },
  username: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '700',
  },
  likesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  likesCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyText: {
    color: THEME.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
