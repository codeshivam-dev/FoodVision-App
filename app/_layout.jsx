import { Stack} from "expo-router";
import { ConvexProvider,useConvex, ConvexReactClient } from "convex/react";
import { UserContext } from "../context/UserContext";
import { ThemeProvider } from "../context/ThemeContext";
import { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/FirebasConfig";
import { api } from "../convex/_generated/api";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL, {
  unsavedChangesWarning: false,
});

// Auth wrapper component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const convex = useConvex();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser?.email) {
          const userData = await convex.query(api.Users.GetUser, {
            email: firebaseUser.email,
          });
          
          if (isMounted) {
            setUser(userData || null);
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleSetUser = useCallback((newUser) => {
    setUser(newUser);
  }, []);

  if (isAuthLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#FFFFFF' 
      }}>
        <ActivityIndicator size="large" color="#8837ff" />
      </View>
    );
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: handleSetUser,
      isAuthenticated: !!user 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="(nutritionist)" 
              options={{ 
                // Prevent going back after logout
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen name="auth" />
            <Stack.Screen name="consultancy" />
            <Stack.Screen name="generate-ai-recipe" />
            <Stack.Screen name="preferences" />
            <Stack.Screen name="recipe-detail" />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </ConvexProvider>
  );
}