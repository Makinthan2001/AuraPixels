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
} from "react-native";
import { Image } from "expo-image";
import { File, Paths } from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { COLORS, SIZES } from "../utils/constants";
import { FavoritesContext } from "../context/FavoritesContext";
import { api } from "../services/api";

const STYLES = [
  { label: "Cinematic", value: "cinematic" },
  { label: "Anime", value: "anime" },
  { label: "Minimal", value: "minimal" },
  { label: "Abstract", value: "abstract" },
  { label: "Realistic", value: "realistic" },
];

const RESOLUTIONS = [
  { label: "Mobile (Portrait)", value: "portrait" },
  { label: "Square (1:1)", value: "square" },
  { label: "Desktop (Landscape)", value: "landscape" },
];

export const GenerateScreen = ({ route, navigation }: any) => {
  const initialPrompt = route.params?.initialPrompt || "";
  const [prompt, setPrompt] = useState(initialPrompt);
  const [activeStyle, setActiveStyle] = useState("cinematic");
  const [activeRes, setActiveRes] = useState("portrait");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);

  const { addToHistory, addFavorite } = useContext(FavoritesContext);

  useEffect(() => {
    if (route.params?.initialPrompt) {
      setPrompt(route.params.initialPrompt);
    }
  }, [route.params]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert("Error", "Please enter a prompt first.");
      return;
    }

    if (prompt.length > 200) {
      Alert.alert("Error", "Prompt must be 200 characters or less.");
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
        id: Date.now().toString(), // We don't have the real DB ID returned in the same format right now, but we use what we have
        url: data.imageUrl,
        title: prompt.slice(0, 20) + "...",
        prompt: data.prompt, // enhanced prompt
        tags: [data.style, "AI Generated"],
        isGenerated: true,
      };

      setGeneratedImage(newImage);
      addToHistory(newImage);
    } catch (error: any) {
      console.error("Generation failed:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to generate image. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (generatedImage) {
      addFavorite(generatedImage);
      Alert.alert("Success", "Image saved to favorites!");
    }
  };

  const createFileName = () => {
    const safePrompt = (generatedImage?.title || prompt || "aura-pixels")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    return `${safePrompt || "aura-pixels"}-${Date.now()}.png`;
  };

  const handleDownload = async () => {
    if (!generatedImage?.url) {
      Alert.alert("Error", "Generate an image first.");
      return;
    }

    const fileName = createFileName();

    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = generatedImage.url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const base64Data = generatedImage.url.startsWith("data:")
          ? generatedImage.url.split(",")[1]
          : generatedImage.url;

        const destination = new File(Paths.document, fileName);
        destination.write(base64Data, { encoding: "base64" });

        Alert.alert("Download complete", `Saved to ${destination.uri}`);
      }
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert("Error", "Failed to download image. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.headerTitle}>Create Magic</Text>
        <Text style={styles.headerSubtitle}>
          Transform your words into stunning wallpapers
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your perfect wallpaper (max 200 chars)..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            value={prompt}
            onChangeText={setPrompt}
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={styles.charCount}>{prompt.length}/200</Text>
        </View>

        <Text style={styles.sectionTitle}>Art Style</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContent}
        >
          {STYLES.map((style) => (
            <TouchableOpacity
              key={style.value}
              style={[
                styles.chip,
                activeStyle === style.value && styles.activeChip,
              ]}
              onPress={() => setActiveStyle(style.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeStyle === style.value && styles.activeChipText,
                ]}
              >
                {style.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Resolution</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContent}
        >
          {RESOLUTIONS.map((res) => (
            <TouchableOpacity
              key={res.value}
              style={[
                styles.chip,
                activeRes === res.value && styles.activeChip,
              ]}
              onPress={() => setActiveRes(res.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeRes === res.value && styles.activeChipText,
                ]}
              >
                {res.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button
          title={isGenerating ? "Generating..." : "Generate AI Wallpaper"}
          onPress={handleGenerate}
          isLoading={isGenerating}
          style={styles.generateBtn}
          icon={
            !isGenerating && (
              <Ionicons name="sparkles" size={20} color={COLORS.white} />
            )
          }
        />

        {generatedImage && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Result</Text>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: generatedImage.url }}
                style={[
                  styles.generatedImage,
                  activeRes === "portrait"
                    ? styles.imagePortrait
                    : activeRes === "landscape"
                      ? styles.imageLandscape
                      : styles.imageSquare,
                ]}
                contentFit="contain"
              />
            </View>
            <View style={styles.resultActions}>
              <Button
                title="Save"
                variant="outline"
                style={styles.actionBtn}
                onPress={handleSave}
                icon={
                  <Ionicons
                    name="heart-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                }
              />
              <Button
                title="Download"
                style={styles.actionBtn}
                onPress={handleDownload}
                icon={
                  <Ionicons
                    name="download-outline"
                    size={20}
                    color={COLORS.white}
                  />
                }
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SIZES.lg,
    paddingBottom: 100,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SIZES.lg,
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
  },
  textInput: {
    minHeight: 100,
    fontSize: 16,
    color: COLORS.text,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  chipScroll: {
    marginBottom: SIZES.lg,
  },
  chipContent: {
    gap: SIZES.sm,
  },
  chip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  activeChipText: {
    color: COLORS.white,
  },
  generateBtn: {
    marginTop: SIZES.md,
    marginBottom: SIZES.xl,
  },
  resultContainer: {
    marginTop: SIZES.md,
  },
  imageWrapper: {
    borderRadius: SIZES.radius,
    overflow: "hidden",
    marginBottom: SIZES.md,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  generatedImage: {
    width: "100%",
  },
  imagePortrait: {
    aspectRatio: 9 / 16,
  },
  imageLandscape: {
    aspectRatio: 16 / 9,
  },
  imageSquare: {
    aspectRatio: 1,
  },
  resultActions: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  actionBtn: {
    flex: 1,
  },
});
