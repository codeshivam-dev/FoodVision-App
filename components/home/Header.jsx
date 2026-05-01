import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "../../context/ThemeContext";
import { Txt } from "../UIComponents";
import { useRouter } from "expo-router";

export default function Header({ name }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [emoji, setEmoji] = useState("");

  useEffect(() => {
    getGreeting();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
      setEmoji("🌅");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
      setEmoji("☀️");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
      setEmoji("🌆");
    } else {
      setGreeting("Good Night");
      setEmoji("🌙");
    }
  };

  // Gradient colors based on time
  const getGradientColors = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      // Morning: Warm orange to purple
      return [theme.colors.primary, '#FF6B6B'];
    } else if (hour >= 12 && hour < 17) {
      // Afternoon: Blue to purple
      return [theme.colors.blue, theme.colors.primary];
    } else {
      // Evening/Night: Dark purple
      return [theme.colors.primaryDark || '#6B2FCC', theme.colors.primary];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      {/* Left Section */}
      <View style={styles.leftSection}>
        {/* Emoji & Greeting */}
        <View style={styles.greetingRow}>
          <Txt size={20}>
            {emoji}
          </Txt>
          <Txt 
            size={theme.fontSize.sm} 
            color="rgba(255,255,255,0.9)"
          >
            {greeting}
          </Txt>
        </View>
        
        {/* User Name */}
        <Txt 
          size={theme.fontSize.xxl} 
          bold 
          color={theme.colors.white}
          style={styles.userName}
        >
          {name || "User"}
        </Txt>

        {/* Streak or small info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Ionicons name="flame" size={12} color="#FFD93D" />
            <Txt size={10} color="rgba(255,255,255,0.9)">
              7 day streak
            </Txt>
          </View>
        </View>
      </View>

      {/* Right Section - Icons */}
      <View style={styles.rightSection}>
        {/* Notifications */}
        <TouchableOpacity 
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Profile Quick Access */}
        <TouchableOpacity 
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/Profile')}
        >
          <Ionicons name="person-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftSection: {
    flex: 1,
    gap: 6,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rightSection: {
    gap: 10,
    marginTop: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});