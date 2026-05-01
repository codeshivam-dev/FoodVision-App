import { Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { UserContext } from "../context/UserContext";
import { ThemeProvider } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { lightTheme } from "../shared/Colors";
import GlobalStatusBar from "../components/shared/GlobalStatusBar";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL ?? "", {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth state
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: lightTheme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
        <StatusBar
          barStyle="dark-content"
          backgroundColor={lightTheme.colors.background}
        />
      </View>
    );
  }

  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <UserContext.Provider value={{ user, setUser }}>
          <GlobalStatusBar />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(nutritionist)" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="consultancy" />
            <Stack.Screen name="generate-ai-recipe" />
            <Stack.Screen name="preferences" />
            <Stack.Screen name="recipe-detail" />
          </Stack>
        </UserContext.Provider>
      </ThemeProvider>
    </ConvexProvider>
  );
}
