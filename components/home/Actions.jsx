// components/home/Actions.jsx - With Haptics & Better UX
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Txt } from "../UIComponents";
import { useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';

export default function Actions() {
  const { theme } = useTheme();
  const router = useRouter();

  const handlePress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (action === 'customMeal') {
      router.push('/generate-ai-recipe');
    } else if (action === 'scanFood') {
      // Future: Implement barcode/food scanning
      console.log("Food scanning coming soon!");
    }
  };

  const actionButtons = [
    {
      key: 'customMeal',
      label: 'Custom Meal',
      icon: 'create-outline',
      variant: 'outline',
      route: '/generate-ai-recipe',
    },
    {
      key: 'scanFood',
      label: 'Scan Food',
      icon: 'scan-outline',
      variant: 'primary',
      route: null,
    },
  ];

  return (
    <View style={styles.actions}>
      {actionButtons.map((btn) => {
        const isPrimary = btn.variant === 'primary';
        
        return (
          <TouchableOpacity 
            key={btn.key}
            style={[
              styles.actionBtn,
              {
                backgroundColor: isPrimary 
                  ? theme.colors.accent || theme.colors.GREEN 
                  : theme.colors.card,
                borderColor: isPrimary 
                  ? 'transparent' 
                  : theme.colors.accent || theme.colors.GREEN,
                borderWidth: isPrimary ? 0 : 1.5,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => handlePress(btn.key)}
          >
            <Ionicons 
              name={btn.icon} 
              size={18} 
              color={isPrimary 
                ? theme.colors.white 
                : theme.colors.accent || theme.colors.GREEN
              } 
            />
            <Txt 
              size={theme.fontSize.sm} 
              bold 
              color={isPrimary 
                ? theme.colors.white 
                : theme.colors.accent || theme.colors.GREEN
              }
            >
              {btn.label}
            </Txt>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { 
    flexDirection: "row", 
    gap: 10, 
    marginVertical: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
});