import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { InfoScreenTemplate } from '../src/components/InfoScreenTemplate';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
  const sections = [
    {
      title: 'Frequently Asked Questions',
      icon: 'help-circle',
      content: [
        'Q: How does the AI wallpaper generator work?\nA: Simply write a detailed description of the wallpaper you want in the Generate tab. Select a style (e.g., Anime, Minimal, Cyberpunk), choose your preferred resolution, and tap "Generate". Our system will create a unique wallpaper for you in seconds.',
        'Q: How can I save wallpapers to my device?\nA: Tap on any wallpaper to open its preview modal. From there, tap the "Download" button to save it directly to your device\'s gallery. Make sure to grant media library permissions when prompted.',
        'Q: What is the "History" tab?\nA: The history tab saves all the wallpapers you have generated yourself, ensuring you never lose your custom creations.',
      ],
    },
    {
      title: 'AI Generation Guide',
      icon: 'color-palette',
      content: [
        'To get the best possible AI wallpapers, follow these tips:',
        '1. Be descriptive: Instead of "mountain", try "a majestic snow-capped mountain peaking through clouds at sunset, highly detailed, cinematic lighting".',
        '2. Specify styles: Use the style selector to get clean results for Anime, Abstract, 3D Render, etc.',
        '3. Think about colors: Add color terms like "pastel color palette", "neon glows", or "moody dark tones" to match your device setup.',
      ],
    },
    {
      title: 'Account & Synchronization',
      icon: 'sync',
      content: [
        'AuraPixels syncs your favorites and generation history to the cloud. You can log in on multiple devices and access your collection instantly.',
        'If you encounter connection issues, try logging out and logging back in from the Profile menu.',
      ],
    },
  ];

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Email support at: support@aurapixels.com\n\nWe typically respond within 24 hours!');
  };

  const footer = (
    <View style={styles.card}>
      <Ionicons name="chatbubbles-outline" size={32} color="#38bdf8" style={styles.icon} />
      <Text style={styles.cardTitle}>Still need help?</Text>
      <Text style={styles.cardDesc}>
        Our support team is available 24/7 to resolve any issues.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleContactSupport}>
        <Ionicons name="mail" size={18} color="#0f172a" />
        <Text style={styles.buttonText}>Email Support</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <InfoScreenTemplate
      title="Help & Support"
      subtitle="How can we help you today?"
      sections={sections}
      footer={footer}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.15)',
    marginTop: 8,
  },
  icon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
});
