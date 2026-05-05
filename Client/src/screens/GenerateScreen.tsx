import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { COLORS, SIZES } from "../utils/constants";
import { FavoritesContext } from "../context/FavoritesContext";
import { api } from "../services/api";

const ART_STYLES = [
  {
    id: "cinematic",
    name: "Cinematic",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2DLrdSI1auiCprDQRer9gJlV7ct21TOYEz-lRsnW71XK5wsGGP2pyInu0PHCBRSRmSQ6ZDXWzvZGiHS6vmo2jgGeYok2hhnU_eqfeaczspPhk-rHFQ5PLr6I9b5uoELb13W5kkj7dpTF8Cxe3FahTucs3U9OMA6icV2D_97s2_eDH2I6hQkd02Nr9iPoSvDy__6nMNAAG3kJIFH1NQN01VkuWR_gzky8digmXFJPibmM9APajKE2vFH2m9i-Ejv5rNzyC6pKsHFhn",
  },
  {
    id: "anime",
    name: "Anime",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARvwu208-w8_lRB-pxaze1Ttuda5XvM5dKnPDyvSUUenGK9A92bBVGquBM1vM5jScqv0p_qo3zsc_ccLVVy_WXgM3EHW-gdeJPrQFinGDjfjWZ-6GXAha-Z25CKkNMGwYE60jgswm37XoNtFTo7ybBVPP1qCq28vdc9TQqFL19cYMQe1vevfPeT2Q97qL4P5jqyDWv4nQhbqFzWSCOzlTUubTEe7WowDVWQVG16A4ikf0sR3eylUQy92GmX4HbMbv5rRx4lxHYIWAm",
  },
  {
    id: "minimal",
    name: "Minimal",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCc6xlCaP9MdEeNALW1HajEG4V7QSp3zq8xypc04cTBilHKNLjgqWQxwjYTNc75iJLRmcYbXf08sJMRkk_JiwdN4gRBljN8_ng9MOriwT89mgQTlUcnBrz_Q-yy6AEUGyyaUgVkro_37euSVf9Y6Ify4EJFTvc9iVLrSk9d1QmhtBjR56XQnlPEnBlA-wNx_IiMxalKFTes6K87TY67256awe0MJPALenBkywqFvk4bxiYVm6S_k8CUUCNAPaC8hS1JQJGz8GUHQdnF",
  },
  {
    id: "abstract",
    name: "Abstract",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrxhkFviveNbQDK8L5fCVG8q7JiqkLP4H9x0O5QQKF4geUTp3yIvCiOMFkzFhgmCbuwRT8IEhYYxpg0dBggGGhiMZMky3ignzGDIOWqZuHvcFMCPjQLWqDvgmZP8ohOisieXSxJj-S1SbNgWRbRXfupcfYCTY8F3iNixgr1_RCI1Ib5Ej4vP2ONoYLydyjkiQF-o7aj9iOVMBjkGK0D7eX3tl-bQiHO2fIk4ZcFVVltw1Xncjhqbw-DRdIbin45VUPWUusB8WlJmmD",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCB7juZSQ9P9Eh2P1RcskWNPPAqHYLmb3FZyKg6HbIOuqiubiEPZGNdRhUoU99Iz9CBFDOiMnncGVL3W_RLamkcGoinKKcxOpXFFFn_mj3fQAmAvQL1_Lg5wmjHYmIAFt1m3ITpJTN6Le3YTfLLgCwhoGWQ3ibgS-keIt2LKyBeg5_PbvksXHztpbOfUs-7YORQM6fGlwKksjAxZDIkohF3O96cpnZhLKhfnPgd0mkcOf6Q5BVpRGNjmLJUeVVJM0zfU4evNAdlAvvK",
  },
];

const RESOLUTIONS = [
  { label: "Square (1:1)", value: "square" },
  { label: "Mobile (Portrait)", value: "portrait" },
  { label: "Desktop (Landscape)", value: "landscape" },
  { label: "Tablet", value: "tablet" },
  { label: "Ultra Wide", value: "ultrawide" },
];

const LUMINA_COLORS = {
  background: "#0f1418",
  surface: "#1b2024",
  primary: "#8ed5ff",
  outline: "#87929a",
  white: "#FFFFFF",
  glass: "rgba(255, 255, 255, 0.05)",
  glassPill: "rgba(15, 20, 24, 0.8)",
};

export const GenerateScreen = ({ route, navigation }: any) => {
  const initialPrompt = route.params?.initialPrompt || "";
  const [prompt, setPrompt] = useState(initialPrompt);
  const [activeStyle, setActiveStyle] = useState("cinematic");
  const [activeRes, setActiveRes] = useState("portrait");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);

  const { addToHistory, addFavorite } = useContext(FavoritesContext);
  const spinValue = useSharedValue(0);

  useEffect(() => {
    if (isGenerating) {
      spinValue.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      spinValue.value = 0;
    }
  }, [isGenerating]);

  const animatedSpin = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value * 360}deg` }],
  }));

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt first.");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await api.generateWallpaper(
        prompt,
        activeStyle,
        activeRes,
      );
      const data = response.data;

      const newImage = {
        id: Date.now().toString(),
        url: data.imageUrl,
        title: prompt.slice(0, 20) + "...",
        prompt: data.prompt,
        tags: [activeStyle, "AI Generated"],
        isGenerated: true,
      };

      setGeneratedImage(newImage);
      addToHistory(newImage);
    } catch (error: any) {
      console.error("Generation failed:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to generate image.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (generatedImage) {
      addFavorite(generatedImage);
      Alert.alert("Success", "Saved to favorites!");
    }
  };

  const handleDownload = async () => {
    if (!generatedImage?.url) return;

    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = generatedImage.url;
        link.download = `AuraPixels-${Date.now()}.png`;
        link.target = "_blank";
        link.rel = "noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert("Success", "Wallpaper download started.");
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant gallery access to download.",
        );
        return;
      }

      const fileUri =
        FileSystem.documentDirectory + `AuraPixels-${Date.now()}.png`;

      if (generatedImage.url.startsWith("data:")) {
        const base64Data = generatedImage.url.split(",")[1];
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } else {
        const downloadRes = await FileSystem.downloadAsync(
          generatedImage.url,
          fileUri,
        );
        if (downloadRes.status !== 200) throw new Error("Download failed");
      }

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert("Success", "Wallpaper saved to gallery!");
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Error", "Failed to save image.");
    }
  };

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="menu" size={24} color={LUMINA_COLORS.outline} />
          </TouchableOpacity>
          <View style={styles.profileContainer}>
            <Image
              source="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
              style={styles.profileImage}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Preview Container */}
          <Animated.View
            entering={FadeInDown.duration(800)}
            style={styles.previewCard}
          >
            <View style={styles.previewBackground} />

            {generatedImage ? (
              <Image
                source={{ uri: generatedImage.url }}
                style={styles.previewImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                {isGenerating ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View style={[styles.spinner, animatedSpin]}>
                      <Ionicons
                        name="sparkles"
                        size={40}
                        color={LUMINA_COLORS.primary}
                      />
                    </Animated.View>
                    <Text style={styles.loadingText}>Generating Magic...</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.placeholderIconBox}>
                      <Ionicons
                        name="image-outline"
                        size={32}
                        color={LUMINA_COLORS.outline}
                      />
                    </View>
                    <Text style={styles.placeholderTitle}>
                      Generated image will appear here
                    </Text>
                    <Text style={styles.placeholderSubtitle}>
                      AWAITING PROMPT ENGINEERING
                    </Text>
                  </>
                )}
              </View>
            )}

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDownload}
                disabled={!generatedImage}
              >
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={LUMINA_COLORS.white}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Art Style Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Art Style</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {ART_STYLES.map((style, index) => (
                <View key={style.id}>
                  <TouchableOpacity
                    onPress={() => setActiveStyle(style.id)}
                    style={[
                      styles.styleCard,
                      activeStyle === style.id && styles.activeStyleCard,
                    ]}
                  >
                    <Image
                      source={{ uri: style.image }}
                      style={styles.styleImage}
                    />
                    <View style={styles.styleOverlay}>
                      <Text
                        style={[
                          styles.styleName,
                          activeStyle === style.id && {
                            color: LUMINA_COLORS.primary,
                          },
                        ]}
                      >
                        {style.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Resolution Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resolution</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {RESOLUTIONS.map((res, index) => (
                <View key={res.value}>
                  <TouchableOpacity
                    onPress={() => setActiveRes(res.value)}
                    style={[
                      styles.resPill,
                      activeRes === res.value && styles.activeResPill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.resText,
                        activeRes === res.value && styles.activeResText,
                      ]}
                    >
                      {res.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 200 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Floating Prompt Bar */}
      <BlurView intensity={20} tint="dark" style={styles.promptBarContainer}>
        <View style={styles.promptBar}>
          <TextInput
            style={styles.input as any}
            placeholder="Describe your wallpaper..."
            placeholderTextColor={LUMINA_COLORS.outline}
            value={prompt}
            onChangeText={setPrompt}
            multiline={false}
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity
            style={[styles.generateButton, !prompt.trim() && { opacity: 0.5 }]}
            onPress={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color={LUMINA_COLORS.background} />
            ) : (
              <>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={LUMINA_COLORS.background}
                />
                <Text style={styles.generateButtonText}>Generate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LUMINA_COLORS.background,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: "800",
    color: LUMINA_COLORS.primary,
    letterSpacing: -0.5,
  },
  profileContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  previewCard: {
    aspectRatio: 0.8,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: LUMINA_COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginBottom: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  previewBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: LUMINA_COLORS.surface,
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholderContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  placeholderIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: LUMINA_COLORS.white,
    textAlign: "center",
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 12,
    fontWeight: "900",
    color: LUMINA_COLORS.outline,
    letterSpacing: 2,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: LUMINA_COLORS.primary,
  },
  previewActions: {
    position: "absolute",
    top: 20,
    right: 20,
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(15, 20, 24, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: LUMINA_COLORS.white,
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "800",
    color: LUMINA_COLORS.primary,
    letterSpacing: 1,
  },
  horizontalScroll: {
    gap: 15,
    paddingRight: 20,
  },
  styleCard: {
    width: 120,
    height: 160,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeStyleCard: {
    borderColor: LUMINA_COLORS.primary,
    shadowColor: LUMINA_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  styleImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  styleOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    padding: 12,
  },
  styleName: {
    fontSize: 10,
    fontWeight: "900",
    color: LUMINA_COLORS.white,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  resPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: LUMINA_COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  activeResPill: {
    backgroundColor: LUMINA_COLORS.primary,
    borderColor: "transparent",
  },
  resText: {
    fontSize: 12,
    fontWeight: "700",
    color: LUMINA_COLORS.outline,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  activeResText: {
    color: LUMINA_COLORS.background,
  },
  promptBarContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  promptBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "rgba(15, 20, 24, 0.8)",
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    color: LUMINA_COLORS.white,
    fontSize: 14,
    fontWeight: "500",
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
    } as any),
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LUMINA_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  generateButtonText: {
    color: LUMINA_COLORS.background,
    fontSize: 14,
    fontWeight: "800",
  },
  navTextActive: {
    fontSize: 10,
    fontWeight: "800",
    color: LUMINA_COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
