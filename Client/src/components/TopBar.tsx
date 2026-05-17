import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { AuthContext } from "../context/AuthContext";

interface TopBarProps {
  title?: string;
}

const THEME = {
  background: "#1e293b",
  text: "#ffffff",
  textSecondary: "#94a3b8",
  accent: "#38bdf8",
};

export const TopBar = ({ title }: TopBarProps) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "User";

  return (
    <View style={styles.container}>
      {/* Left side: Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require("../../assets/images/logo_home.svg")} 
          style={{ width: 28, height: 28, tintColor: THEME.accent }} 
          contentFit="contain" 
        />
        <Text style={styles.logoText}>AuraPixels</Text>
      </View>
      
      {/* Right side: Profile */}
      <TouchableOpacity 
        style={styles.profileContainer} 
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <Text style={styles.userName}>{firstName}</Text>
        <View style={styles.avatarContainer}>
          {user?.profileImage ? (
            <Image 
              source={user.profileImage} 
              style={styles.avatarImage} 
              contentFit="cover" 
            />
          ) : (
            <Ionicons name="person" size={16} color="#fff" />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.text,
    letterSpacing: -0.5,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
});
