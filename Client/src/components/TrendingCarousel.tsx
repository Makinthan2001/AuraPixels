import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.75;
const ITEM_HEIGHT = 400;

interface TrendingItem {
  id: string;
  imageUrl: string;
  prompt: string;
  user: {
    name: string;
    avatar?: string;
  };
  likes: number;
}

interface TrendingCarouselProps {
  data: TrendingItem[];
  onItemPress: (item: TrendingItem) => void;
}

const THEME = {
  background: "#1e293b",
  card: "#334155",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  accent: "#38bdf8",
  danger: "#ef4444",
};

export const TrendingCarousel = ({ data, onItemPress }: TrendingCarouselProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trending Wallpapers</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={ITEM_WIDTH + 20}
        decelerationRate="fast"
      >
        {data.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInRight.delay(index * 100).duration(500)}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => onItemPress(item)}
              style={styles.card}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={500}
              />
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
              >
                <View style={styles.infoContainer}>
                  <Text style={styles.prompt} numberOfLines={2}>
                    {item.prompt}
                  </Text>
                  
                  <View style={styles.footer}>
                    <View style={styles.userContainer}>
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.user.name[0]}</Text>
                      </View>
                      <Text style={styles.username}>{item.user.name}</Text>
                    </View>
                    
                    <View style={styles.likesBadge}>
                      <Ionicons name="heart" size={16} color={THEME.danger} />
                      <Text style={styles.likesCount}>{item.likes}</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.text,
    letterSpacing: 0.5,
  },
  viewAll: {
    fontSize: 14,
    color: THEME.accent,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 15,
    gap: 15,
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: THEME.card,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
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
    height: '50%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  infoContainer: {
    gap: 12,
  },
  prompt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1e293b',
    fontSize: 12,
    fontWeight: '800',
  },
  username: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  likesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  likesCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
