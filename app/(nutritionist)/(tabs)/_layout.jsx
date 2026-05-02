import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NutritionistTabLayout() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const tabScreens = [
    {
      name: "Dashboard",
      title: "Dashboard",
      icon: "grid",
      iconOutline: "grid-outline",
    },
    {
      name: "Clients",
      title: "Clients",
      icon: "people",
      iconOutline: "people-outline",
    },
    {
      name: "Plans",
      title: "Plans",
      icon: "document-text",
      iconOutline: "document-text-outline",
    },
    {
      name: "Profile",
      title: "Profile",
      icon: "person",
      iconOutline: "person-outline",
    },
  ];

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const screen = tabScreens.find((s) => s.name === route.name);
          const iconName = focused ? screen?.icon : screen?.iconOutline;

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {focused && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: theme.colors.primary,
                    marginTop: 4,
                  }}
                />
              )}
            </View>
          );
        },

        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,

        tabBarStyle: {
          backgroundColor: isDark ? theme.colors.card : theme.colors.background,
          borderTopColor: theme.colors.divider,
          borderTopWidth: 1,
          height: 70 + (insets.bottom || 0),
          paddingBottom: 8 + (insets.bottom || 0),
          paddingTop: 10,
          elevation: 0,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },

        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.medium,
          marginTop: 0,
        },

        tabBarBackground: () => null,
        
        tabBarItemStyle: {
          paddingVertical: 4,
        },

        headerShown: false,
      })}
    >
      {tabScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{ title: screen.title }}
        />
      ))}
    </Tabs>
  );
}