import { Stack, useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function NutritionistLayout() {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    // Auth check
    if (user === null) {
      router.replace('/auth/SignIn');
      return;
    }

    if (user && user.role !== 'nutritionist') {
      router.replace('/(tabs)/Home');
      return;
    }
  }, [user]);

  // Show loader while checking auth
  if (!user || user.role !== 'nutritionist') {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background 
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="client/[clientId]" />
      <Stack.Screen name="consultation/[consultationId]/start" />
      <Stack.Screen name="consultation/[consultationId]/notes" />
      <Stack.Screen name="consultation/[consultationId]/plan" />
    </Stack>
  );
}