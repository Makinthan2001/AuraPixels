import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../utils/constants";
import { FavoritesContext } from "../context/FavoritesContext";
import { Button } from "../components/Button";
import { WallpaperImage } from "../components/WallpaperImage";
import { getAspectRatioFromResolution } from "../utils/image";

const { width, height } = Dimensions.get("window");

export const WallpaperDetailScreen = ({ route, navigation }: any) => {
  const { wallpaper } = route.params;
  const { isFavorite, addFavorite, removeFavorite } =
    useContext(FavoritesContext);

  const favorite = isFavorite(wallpaper.id);

  const toggleFavorite = () => {
    if (favorite) {
      removeFavorite(wallpaper.id);
    } else {
      addFavorite(wallpaper);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      "Download Started",
      "The wallpaper is downloading to your gallery.",
    );
  };

  const handleGenerateSimilar = () => {
    navigation.navigate("GenerateTab", {
      initialPrompt: `Like ${wallpaper.title}`,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.imageViewport}
        contentContainerStyle={styles.imageStage}
        minimumZoomScale={1}
        maximumZoomScale={3}
        bouncesZoom={true}
        centerContent={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <WallpaperImage
          uri={wallpaper.url}
          aspectRatio={getAspectRatioFromResolution(wallpaper.resolution)}
          contentFit="contain"
          borderRadius={0}
          style={styles.image}
        />
      </ScrollView>

      {/* Top Gradient/Shadow area for back button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Bottom Content Area */}
      <View style={styles.bottomSheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bottomSheetContent}
        >
          <Text style={styles.title}>
            {wallpaper.title || "Untitled Wallpaper"}
          </Text>

          <View style={styles.tagsContainer}>
            {wallpaper.tags?.map((tag: string) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCircle}
              onPress={toggleFavorite}
            >
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={28}
                color={favorite ? COLORS.error : COLORS.primary}
              />
            </TouchableOpacity>

            <Button
              title="Download"
              onPress={handleDownload}
              style={styles.downloadBtn}
              icon={
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={COLORS.white}
                />
              }
            />
          </View>

          <Button
            title="Generate Similar"
            variant="secondary"
            onPress={handleGenerateSimilar}
            icon={
              <Ionicons
                name="color-wand-outline"
                size={20}
                color={COLORS.white}
              />
            }
            style={styles.generateBtn}
          />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  image: {
    width: width - 24,
    maxHeight: height * 0.68,
    alignSelf: "center",
  },
  imageViewport: {
    width: "100%",
    height: height * 0.72,
    backgroundColor: "#0f172a",
  },
  imageStage: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
  },
  topBar: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.4,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: SIZES.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  bottomSheetContent: {
    paddingBottom: SIZES.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SIZES.md,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBtn: {
    flex: 1,
  },
  generateBtn: {
    width: "100%",
  },
});
