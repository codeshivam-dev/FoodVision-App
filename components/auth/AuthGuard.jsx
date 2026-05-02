import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";

export function AuthGuard({ children, requiredRole = null }) {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure context is ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // User is null means not authenticated or logged out
    if (user === null) {
      router.replace('/auth/SignIn');
      return;
    }

    // If role is required and user doesn't have it
    if (requiredRole && user?.role !== requiredRole) {
      if (requiredRole === 'nutritionist') {
        router.replace('/(tabs)/Home');
      } else {
        router.replace('/(nutritionist)/(tabs)/Dashboard');
      }
      return;
    }
  }, [user, isReady, requiredRole]);

  // Show loading while checking
  if (!isReady || user === undefined) {
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

  // If user is null, don't render children (will redirect)
  if (user === null) {
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

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
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

  return children;
}