import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { InfoScreenTemplate } from '../src/components/InfoScreenTemplate';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
  const sections = [
    {
      title: 'Our Privacy Commitment',
      icon: 'shield-checkmark',
      content: [
        'At AuraPixels, your privacy is paramount. We believe in transparency and want to assure you that your data is safe and handled with the highest level of security.',
        'This Privacy Policy outlines how we collect, use, process, and protect your information when you use our mobile application and services.',
      ],
    },
    {
      title: 'Information We Collect',
      icon: 'list-circle',
      content: [
        '1. Account Information: When you register or sign in (via email/password or Google OAuth), we store your name, email address, and profile picture.',
        '2. Creative Data: Wallpapers you generate, prompts you submit, likes you toggle, and items you favorite are stored in our secure database to sync your account.',
        '3. Device Data: We collect standard technical information like platform OS, system language, and screen dimensions solely to render layouts correctly and improve app performance.',
      ],
    },
    {
      title: 'How We Use Your Data',
      icon: 'cog',
      content: [
        'We use your data strictly to deliver a premium, personalized wallpaper experience:',
        '• To secure and authenticate your account.',
        '• To run the AI generation pipelines and maintain your creation history.',
        '• To organize your favorites collection and feed interaction.',
        '• We never sell, distribute, or share your personal data with third-party advertisers.',
      ],
    },
    {
      title: 'Data Security & Storage',
      icon: 'lock-closed',
      content: [
        'All client-server communications are fully encrypted using modern Transport Layer Security (TLS). Account access tokens are safely encrypted on your device using Expo Secure Store.',
        'Database hosting is securely isolated on industry-standard platforms (Neon Postgres) with strictly regulated access policies.',
      ],
    },
  ];

  const footer = (
    <View style={styles.footer}>
      <Text style={styles.dateText}>Last Updated: May 18, 2026</Text>
    </View>
  );

  return (
    <InfoScreenTemplate
      title="Privacy Policy"
      subtitle="How we protect your personal canvas"
      sections={sections}
      footer={footer}
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '550',
  },
});
