import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { COLORS, SIZES } from '../utils/constants';
import { FavoritesContext } from '../context/FavoritesContext';

const STYLES = ['Anime', 'Realistic', '3D', 'Cyberpunk', 'Minimal', 'Watercolor'];
const RESOLUTIONS = ['Mobile (9:16)', 'Desktop (16:9)', 'Square (1:1)'];

export const GenerateScreen = ({ route, navigation }: any) => {
  const initialPrompt = route.params?.initialPrompt || '';
  const [prompt, setPrompt] = useState(initialPrompt);
  const [activeStyle, setActiveStyle] = useState('Realistic');
  const [activeRes, setActiveRes] = useState('Mobile (9:16)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<any>(null);

  const { addToHistory, addFavorite } = useContext(FavoritesContext);

  useEffect(() => {
    if (route.params?.initialPrompt) {
      setPrompt(route.params.initialPrompt);
    }
  }, [route.params]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt first.');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedImage(null);
    
    // Simulate API call
    setTimeout(() => {
      const newImage = {
        id: Date.now().toString(),
        url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop', // mock generated image
        title: prompt.slice(0, 20) + '...',
        prompt: prompt,
        tags: [activeStyle, 'AI Generated'],
        isGenerated: true,
      };
      setGeneratedImage(newImage);
      addToHistory(newImage);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSave = () => {
    if (generatedImage) {
      addFavorite(generatedImage);
      Alert.alert('Success', 'Image saved to favorites!');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Create Magic</Text>
        <Text style={styles.headerSubtitle}>Transform your words into stunning wallpapers</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Describe your perfect wallpaper..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            value={prompt}
            onChangeText={setPrompt}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.sectionTitle}>Art Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
          {STYLES.map(style => (
            <TouchableOpacity 
              key={style} 
              style={[styles.chip, activeStyle === style && styles.activeChip]}
              onPress={() => setActiveStyle(style)}
            >
              <Text style={[styles.chipText, activeStyle === style && styles.activeChipText]}>{style}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Resolution</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
          {RESOLUTIONS.map(res => (
            <TouchableOpacity 
              key={res} 
              style={[styles.chip, activeRes === res && styles.activeChip]}
              onPress={() => setActiveRes(res)}
            >
              <Text style={[styles.chipText, activeRes === res && styles.activeChipText]}>{res}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Button
          title={isGenerating ? "Generating..." : "Generate AI Wallpaper"}
          onPress={handleGenerate}
          isLoading={isGenerating}
          style={styles.generateBtn}
          icon={!isGenerating && <Ionicons name="sparkles" size={20} color={COLORS.white} />}
        />

        {generatedImage && (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionTitle}>Result</Text>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: generatedImage.url }} style={styles.generatedImage} contentFit="cover" />
            </View>
            <View style={styles.resultActions}>
              <Button
                title="Save"
                variant="outline"
                style={styles.actionBtn}
                onPress={handleSave}
                icon={<Ionicons name="heart-outline" size={20} color={COLORS.primary} />}
              />
              <Button
                title="Download"
                style={styles.actionBtn}
                onPress={() => Alert.alert('Downloading...')}
                icon={<Ionicons name="download-outline" size={20} color={COLORS.white} />}
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
    fontWeight: '800',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
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
    overflow: 'hidden',
    marginBottom: SIZES.md,
  },
  generatedImage: {
    width: '100%',
    height: 400,
  },
  resultActions: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  actionBtn: {
    flex: 1,
  },
});
