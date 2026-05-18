import React, { useState, useEffect, useContext, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { AuthContext } from "../context/AuthContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStats } from "../components/ProfileStats";
import { SettingsMenu } from "../components/SettingsMenu";
import { TopBar } from "../components/TopBar";
import { EditProfileModal } from "../components/EditProfileModal";
import { LogoutButton } from "../components/LogoutButton";
import { api } from "../services/api";
import { COLORS } from "../utils/constants";

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, setUser } = useContext(AuthContext);
  const { favorites, history } = useContext(FavoritesContext);

  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const hasFocusedOnceRef = React.useRef(false);

  const fetchProfile = useCallback(
    async (options?: { silent?: boolean }) => {
      try {
        if (options?.silent) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        const response = await api.getUserProfile();
        setProfileData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Fallback to context user if API fails
        setProfileData({
          name: user?.name || "User",
          email: user?.email || "",
          profileImage: user?.profileImage,
          generatedCount: history.length,
          likedCount: 0,
          favoritesCount: favorites.length,
          joinedDate: "May 2024",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      favorites.length,
      history.length,
      user?.email,
      user?.name,
      user?.profileImage,
    ],
  );

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnceRef.current) {
        hasFocusedOnceRef.current = true;
        return;
      }

      void fetchProfile({ silent: true });
    }, [fetchProfile]),
  );

  const handleUpdateProfile = async (data: { name: string }) => {
    try {
      const response = await api.updateUserProfile(data);
      const updatedUser = response.data.data;
      setProfileData(updatedUser);
      setUser(updatedUser); // Update AuthContext
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      Alert.alert("Error", "Failed to update profile.");
      throw error;
    }
  };

  const handleEditPhoto = async () => {
    if (Platform.OS === "web") {
      await pickImage();
      return;
    }

    Alert.alert("Change Photo", "Upload from gallery or take a new photo.", [
      { text: "Gallery", onPress: pickImage },
      { text: "Camera", onPress: takePhoto },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      if (Platform.OS === "web") {
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        formData.append("photo", blob, "profile.jpg");
      } else {
        formData.append("photo", {
          uri: asset.uri,
          type: "image/jpeg",
          name: "profile.jpg",
        } as any);
      }

      const response = await api.uploadPhoto(formData);
      const updatedProfileImage = response.data.data.profileImage;

      setProfileData({ ...profileData, profileImage: updatedProfileImage });
      if (user) {
        setUser({ ...user, profileImage: updatedProfileImage } as any);
      }
      if (Platform.OS !== "web") {
        Alert.alert("Success", "Profile photo updated!");
      } else {
        window.alert("Profile photo updated!");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      if (Platform.OS !== "web") {
        Alert.alert("Error", "Failed to upload photo.");
      } else {
        window.alert("Failed to upload photo.");
      }
    } finally {
      setIsLoading(false);
      setIsPreviewVisible(false);
    }
  };

  const menuItems = [
    {
      id: "edit",
      label: "Edit Profile",
      icon: "person-outline",
      onPress: () => setIsEditModalVisible(true),
    },
    {
      id: "help",
      label: "Help & Support",
      icon: "help-circle-outline",
      onPress: () => Alert.alert("Support", "Contacting support..."),
    },
    {
      id: "about",
      label: "About AuraPixels",
      icon: "information-circle-outline",
      onPress: () =>
        Alert.alert(
          "About",
          "AuraPixels v1.0.0\nAI-powered wallpaper platform.",
        ),
    },
    {
      id: "privacy",
      label: "Privacy Policy",
      icon: "shield-checkmark-outline",
      onPress: () => console.log("Privacy"),
    },
    {
      id: "terms",
      label: "Terms & Conditions",
      icon: "document-text-outline",
      onPress: () => console.log("Terms"),
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <TopBar />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void fetchProfile({ silent: true })}
            tintColor="#38bdf8"
          />
        }
      >
        <ProfileHeader
          user={profileData}
          onEditPhoto={handleEditPhoto}
          onPhotoPress={() => setIsPreviewVisible(true)}
        />

        <ProfileStats
          stats={{
            generated: profileData?.generatedCount || 0,
            liked: profileData?.likedCount || 0,
            favorites: profileData?.favoritesCount || 0,
            joinedDate: profileData?.joinedDate || "2024",
          }}
        />

        <SettingsMenu items={menuItems} />

        <LogoutButton
          onLogout={async () => {
            await logout();
          }}
        />

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
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.previewImageWrapper}
          >
            <Image
              source={
                profileData?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.name || "User")}&background=38bdf8&color=fff`
              }
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
    backgroundColor: "#1e293b",
    paddingTop: 15,
  },
  scrollContent: {
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "600",
  },
  previewOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  closePreview: {
    position: "absolute",
    top: 60,
    right: 30,
    zIndex: 10,
  },
  previewImageWrapper: {
    width: "100%",
    height: "60%",
    borderRadius: 40,
    overflow: "hidden",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#38bdf8",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 40,
    gap: 10,
  },
  changeBtnText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700",
  },
});
