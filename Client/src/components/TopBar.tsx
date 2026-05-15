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
  title: string;
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: THEME.text,
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
