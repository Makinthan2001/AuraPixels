import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from "react-native";
import { Image } from "expo-image";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { repairImageUrl } from "../utils/image";

interface WallpaperImageProps {
  uri?: string;
  aspectRatio?: number;
  contentFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ViewStyle>;
  onLoadEnd?: () => void;
}

export const WallpaperImage = React.memo(
  ({
    uri,
    aspectRatio = 1,
    contentFit = "cover",
    borderRadius = 24,
    style,
    imageStyle,
    onLoadEnd,
  }: WallpaperImageProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [layoutWidth, setLayoutWidth] = useState(0);
    const shimmer = useSharedValue(0);

    useEffect(() => {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        -1,
        false,
      );
    }, [shimmer]);

    const shimmerStyle = useAnimatedStyle(() => {
      const travel = Math.max(layoutWidth, 240);
      return {
        transform: [{ translateX: -travel + shimmer.value * travel * 2.2 }],
      };
    });

    const handleLayout = (event: LayoutChangeEvent) => {
      setLayoutWidth(event.nativeEvent.layout.width);
    };

    const source = repairImageUrl(uri);

    return (
      <View
        onLayout={handleLayout}
        style={[styles.container, { aspectRatio, borderRadius }, style]}
      >
        {(isLoading || !source) && !hasError ? (
          <View style={[styles.placeholder, { borderRadius }]}>
            <LinearGradient
              colors={[
                "rgba(15,23,42,0.95)",
                "rgba(30,41,59,0.92)",
                "rgba(15,23,42,0.95)",
              ]}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={[styles.shimmer, shimmerStyle]}>
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(255,255,255,0.12)",
                  "transparent",
                ]}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            <Ionicons
              name="image-outline"
              size={32}
              color="rgba(255,255,255,0.35)"
            />
          </View>
        ) : null}

        {source && !hasError ? (
          <Image
            source={{ uri: source }}
            style={[styles.image, imageStyle]}
            contentFit={contentFit}
            transition={300}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => {
              setIsLoading(false);
              onLoadEnd?.();
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : null}
      </View>
    );
  },
);

WallpaperImage.displayName = "WallpaperImage";

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#0f172a",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "45%",
  },
});
