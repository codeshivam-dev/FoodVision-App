import { Dimensions, Image, StatusBar, StyleSheet } from "react-native";
import { Box, Txt } from "../components/UIComponents";
import Button from "../components/shared/Button";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import { useConvex } from "convex/react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/FirebasConfig";
import { api } from "../convex/_generated/api";

const { width, height } = Dimensions.get("screen");

export default function Index() {
  const router = useRouter();
  const { setUser } = useContext(UserContext);
  const convex = useConvex();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userInfo) => {
      try {
        if (!userInfo?.email) {
          setIsLoading(false);
          return;
        }

        const userData = await convex.query(api.Users.GetUser, {
          email: userInfo.email,
        });

        if (userData) {
          setUser(userData);

          if (userData?.role === "nutritionist") {
            router.replace("/(nutritionist)/(tabs)/Dashboard");
          } else if (userData?.role === "user") {
            router.replace("/(tabs)/Home");
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error.message);
        setIsLoading(false);
      }
    });

    const timer = setTimeout(() => setIsLoading(false), 500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (isLoading) return null;

  return (
    <Box style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Image */}
      <Image
        source={require("../assets/images/landing.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Overlay */}
      <Box style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <Box bg="transparent" style={styles.content}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Txt
            size={theme.fontSize.xxxl}
            bold
            color={theme.colors.white}
            style={styles.title}
          >
            AI Diet Planner
          </Txt>

          <Txt
            size={theme.fontSize.lg}
            color={theme.colors.white}
            style={styles.subtitle}
          >
            Craft delicious, healthy meal plans tailored just for you. Achieve
            your goals with ease!
          </Txt>
        </Box>
      </Box>

      {/* Bottom Section */}
      <Box bg="transparent" style={styles.bottomSection}>
        <Button
          title="Get Started"
          onPress={() => router.push("/auth/SignIn")}
        />

        <Txt
          size={theme.fontSize.xs}
          color={theme.colors.white}
          style={styles.footer}
        >
          Powered by AI • Personalized Plans
        </Txt>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    position: "absolute",
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 160,
    height: 140,
    marginBottom: 8,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 28,
    opacity: 0.9,
    marginTop: 4,
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 50,
    gap: 12,
  },
  footer: {
    textAlign: "center",
    opacity: 0.6,
    letterSpacing: 1,
  },
});
