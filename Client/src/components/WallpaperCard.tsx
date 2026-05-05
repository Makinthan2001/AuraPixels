import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';

interface WallpaperCardProps {
  url: string;
  onPress: () => void;
  title?: string;
  height?: number;
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export const WallpaperCard: React.FC<WallpaperCardProps> = ({ url, onPress, title, height = 250 }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, { height }]}
    >
      <Image
        style={styles.image}
        source={{ uri: url }}
        placeholder={blurhash}
        contentFit="cover"
        transition={600}
      />
      
      {title && (
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        >
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: COLORS.lumina.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    paddingTop: 30,
  },
  title: {
    color: COLORS.lumina.white,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
});
