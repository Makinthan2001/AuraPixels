import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { InfoScreenTemplate } from '../src/components/InfoScreenTemplate';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const sections = [
    {
      title: 'Our Vision',
      icon: 'rocket',
      content: [
        'AuraPixels is a modern mobile platform designed to redefine how you personalize your digital canvas. We believe that your phone wallpaper is an expression of your personality, mood, and style.',
        'By combining state-of-the-art AI generation tools with a premium, community-driven social feed, we make it effortless to discover, create, and share breath-taking digital art.',
      ],
    },
    {
      title: 'Powered by AI',
      icon: 'hardware-chip',
      content: [
        'All custom generations in AuraPixels run on cutting-edge server-side diffusion models (like FLUX.1-schnell). Our advanced generation pipeline processes prompts in seconds to generate crystal-clear high-definition portrait, landscape, and square wallpapers.',
      ],
    },
    {
      title: 'Built with Love',
      icon: 'heart',
      content: [
        'AuraPixels is designed as a modern, premium experience using React Native, Expo, and NestJS/Express. We pay immense attention to detail — from fluid animations to responsive glassmorphic interfaces.',
        'We hope you enjoy using AuraPixels to create beautiful art just as much as we enjoyed building it!',
      ],
    },
  ];

  const footer = (
    <View style={styles.footer}>
      <View style={styles.logoBadge}>
        <Ionicons name="sparkles" size={24} color="#38bdf8" />
        <Text style={styles.logoText}>AuraPixels</Text>
      </View>
      <Text style={styles.versionText}>Version 1.0.0 (Build 102)</Text>
      <Text style={styles.copyrightText}>© 2026 AuraPixels. All rights reserved.</Text>
    </View>
  );

  return (
    <InfoScreenTemplate
      title="About AuraPixels"
      subtitle="Discover the future of phone aesthetics"
      sections={sections}
      footer={footer}
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '850',
    color: '#fff',
    letterSpacing: 1,
  },
  versionText: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '600',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    color: '#64748b',
  },
});
