import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  StatusBar, 
  Alert, 
  ActivityIndicator,
  Modal,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { AuthContext } from '../context/AuthContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileStats } from '../components/ProfileStats';
import { SettingsMenu } from '../components/SettingsMenu';
import { EditProfileModal } from '../components/EditProfileModal';
import { LogoutButton } from '../components/LogoutButton';
import { api } from '../services/api';
import { COLORS } from '../utils/constants';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, setUser } = useContext(AuthContext);
  const { favorites, history } = useContext(FavoritesContext);
  
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUserProfile();
      setProfileData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Fallback to context user if API fails
      setProfileData({
        name: user?.name || 'User',
        email: user?.email || '',
        profileImage: user?.profileImage,
        generatedCount: history.length,
        likedCount: 0,
        favoritesCount: favorites.length,
        joinedDate: 'May 2024'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (data: { name: string }) => {
    try {
      const response = await api.updateUserProfile(data);
      const updatedUser = response.data.data;
      setProfileData(updatedUser);
      setUser(updatedUser); // Update AuthContext
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('Error', 'Failed to update profile.');
      throw error;
    }
  };

  const handleEditPhoto = () => {
    Alert.alert('Change Photo', 'Upload from gallery or take a new photo.', [
      { text: 'Gallery', onPress: () => console.log('Pick image') },
      { text: 'Camera', onPress: () => console.log('Take photo') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const menuItems = [
    { 
      id: 'edit', 
      label: 'Edit Profile', 
      icon: 'person-outline', 
      onPress: () => setIsEditModalVisible(true) 
    },
    { 
      id: 'help', 
      label: 'Help & Support', 
      icon: 'help-circle-outline', 
      onPress: () => Alert.alert('Support', 'Contacting support...') 
    },
    { 
      id: 'about', 
      label: 'About AuraPixels', 
      icon: 'information-circle-outline', 
      onPress: () => Alert.alert('About', 'AuraPixels v1.0.0\nAI-powered wallpaper platform.') 
    },
    { 
      id: 'privacy', 
      label: 'Privacy Policy', 
      icon: 'shield-checkmark-outline', 
      onPress: () => console.log('Privacy') 
    },
    { 
      id: 'terms', 
      label: 'Terms & Conditions', 
      icon: 'document-text-outline', 
      onPress: () => console.log('Terms') 
    },
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileHeader 
          user={profileData} 
          onEditPhoto={handleEditPhoto}
          onPhotoPress={() => setIsPreviewVisible(true)}
        />

        <ProfileStats stats={{
          generated: profileData?.generatedCount || 0,
          liked: profileData?.likedCount || 0,
          favorites: profileData?.favoritesCount || 0,
          joinedDate: profileData?.joinedDate || '2024'
        }} />

        <SettingsMenu items={menuItems} />

        <LogoutButton onLogout={async () => {
          await logout();
        }} />

        <View style={{ height: 120 }} />
      </ScrollView>

      {profileData && (
        <EditProfileModal 
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleUpdateProfile}
          initialData={{ name: profileData.name, email: profileData.email }}
        />
      )}

      {/* Fullscreen Preview */}
      <Modal visible={isPreviewVisible} transparent animationType="fade">
        <BlurView intensity={90} tint="dark" style={styles.previewOverlay}>
          <TouchableOpacity 
            style={styles.closePreview} 
            onPress={() => setIsPreviewVisible(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          <Animated.View entering={FadeIn.duration(400)} style={styles.previewImageWrapper}>
            <Image 
              source={profileData?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || 'User')}&background=38bdf8&color=fff`}
              style={styles.fullImage}
              contentFit="contain"
            />
          </Animated.View>
          <TouchableOpacity style={styles.changeBtn} onPress={handleEditPhoto}>
            <Ionicons name="camera" size={24} color="#0f172a" />
            <Text style={styles.changeBtnText}>Change Photo</Text>
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingTop: 15,
  },
  scrollContent: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  previewOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closePreview: {
    position: 'absolute',
    top: 60,
    right: 30,
    zIndex: 10,
  },
  previewImageWrapper: {
    width: '100%',
    height: '60%',
    borderRadius: 40,
    overflow: 'hidden',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38bdf8',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 40,
    gap: 10,
  },
  changeBtnText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
});
