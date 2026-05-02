import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

// Local Assets
const bgImage = require('../../assets/images/img_4.png');
const art1 = require('../../assets/images/img_1.png');
const art2 = require('../../assets/images/img_2.png');
const logo = require('../../assets/images/logo.svg');

export const LandingScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      {/* Background Wallpaper */}
      <View style={StyleSheet.absoluteFill}>
        <Image source={bgImage} style={styles.bgImage} contentFit="cover" />
        <LinearGradient
          colors={['rgba(240, 238, 235, 0.4)', 'rgba(235, 232, 228, 0.7)', '#EAE6E1', '#E5E0DA']}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.overlay}
        />
      </View>

      {/* Content Wrapper */}
      <View style={styles.contentWrapper}>
        {/* Top Section: Logo */}
        <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
          <View >
            <Image source={logo} style={styles.logoIcon} contentFit="contain" />
          </View>
          <Text style={styles.logoText}>AI-powered wallpaper generation</Text>
        </Animated.View>

        {/* Middle Section: Content Area */}
        <View style={styles.mainContent}>
          

          {/* Bento-style Preview Grid */}
          <Animated.View entering={FadeInUp.duration(800).delay(400).springify()} style={styles.gridContainer}>
            <View style={styles.gridLeft}>
              <Image source={art1} style={styles.artImage} contentFit="cover" />
            </View>
            <View style={styles.gridRight}>
              <View style={styles.gridRightTop}>
                <Image source={art2} style={styles.artImage} contentFit="cover" />
              </View>
              <View style={styles.gridRightBottom}>
                <Ionicons name="color-palette" size={32} color={COLORS.primary} />
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Section: Actions */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Sign In</Text>
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  logoIcon: {
    width: 200,
    height: 200,
  },
  logoText: {
  fontSize: 25,
  textAlign: 'center',
  fontWeight: 'bold',
  color: '#2d2d2dff',
  letterSpacing: 2,
},
  mainContent: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4A4A4A',
    textAlign: 'center',
    maxWidth: 240,
  },
  gridContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 200,
    gap: 16,
  },
  gridLeft: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gridRight: {
    flex: 1,
    gap: 16,
  },
  gridRightTop: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gridRightBottom: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#D9D2CC', // Accent surface
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#D9D2CC',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
});
