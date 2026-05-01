import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Meals") {
            iconName = focused ? "fast-food" : "fast-food-outline";
          } else if (route.name === "Progress") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        // Theme-based colors
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,

        // Tab bar styling
        tabBarStyle: {
          backgroundColor: isDark ? theme.colors.card : theme.colors.background,
          borderTopColor: theme.colors.divider,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },

        // Label styling
        tabBarLabelStyle: {
          fontSize: theme.fontSize.xs,
          fontWeight: theme.fontWeight.medium,
        },

        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="Meals"
        options={{
          title: "Meals",
        }}
      />
      <Tabs.Screen
        name="Progress"
        options={{
          title: "Progress",
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
