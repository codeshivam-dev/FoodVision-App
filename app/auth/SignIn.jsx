import {
  View,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Txt, Box } from "../../components/UIComponents";
import Input from "../../components/shared/Input";
import Button from "../../components/shared/Button";
import { Link, router } from "expo-router";
import { useContext, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/FirebasConfig";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserContext } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const convex = useConvex();
  const { setUser } = useContext(UserContext);
  const { theme } = useTheme();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Missing Password", "Please enter your password");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const onSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;
      console.log("Firebase SignIn success:", user.email);

      // Fetch user data from Convex
      const userData = await convex.query(api.Users.GetUser, {
        email: user.email,
      });

      if (!userData) {
        Alert.alert("Account Not Found", "Please create an account first");
        setLoading(false);
        return;
      }

      console.log("Convex user data:", userData);
      setUser(userData);

      // Route based on role
      if (userData?.role === "nutritionist") {
        router.replace("/(nutritionist)/(tabs)/Dashboard");
      } else {
        router.replace("/(tabs)/Home");
      }
    } catch (error) {
      console.error("SignIn error:", error.message);

      // Handle specific Firebase errors
      switch (error.code) {
        case "auth/user-not-found":
          Alert.alert("Account Not Found", "No account found with this email");
          break;
        case "auth/wrong-password":
          Alert.alert("Incorrect Password", "Please check your password");
          break;
        case "auth/invalid-email":
          Alert.alert("Invalid Email", "Please enter a valid email address");
          break;
        case "auth/too-many-requests":
          Alert.alert("Too Many Attempts", "Please try again later");
          break;
        default:
          Alert.alert("Sign In Failed", "Please check your email and password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Box
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Header Section */}
          <Box bg="transparent" style={styles.header}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Txt
              size={theme.fontSize.xxxl}
              bold
              color={theme.colors.text}
              style={styles.title}
            >
              Welcome Back
            </Txt>

            <Txt
              size={theme.fontSize.md}
              color={theme.colors.textSecondary}
              style={styles.subtitle}
            >
              Sign in to continue your health journey
            </Txt>
          </Box>

          {/* Form Section */}
          <Box bg="transparent" style={styles.form}>
            <Input
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              }
            />

            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              password={!showPassword}
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              }
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              }
            />

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Txt
                size={theme.fontSize.sm}
                color={theme.colors.primary}
                style={{ textAlign: "right" }}
              >
                Forgot Password?
              </Txt>
            </TouchableOpacity>

            {/* Sign In Button */}
            <Button
              title="Sign In"
              onPress={onSignIn}
              loading={loading}
              style={{ marginTop: 8 }}
            />
          </Box>

          {/* Footer Section */}
          <Box bg="transparent" style={styles.footer}>
            <View style={styles.dividerContainer}>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.divider },
                ]}
              />
              <Txt
                size={theme.fontSize.sm}
                color={theme.colors.textSecondary}
                style={{ marginHorizontal: 10 }}
              >
                or
              </Txt>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: theme.colors.divider },
                ]}
              />
            </View>

            <View style={styles.signupRow}>
              <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
                Don't have an account?
              </Txt>
              <Link href={"/auth/SignUp"}>
                <Txt size={theme.fontSize.sm} color={theme.colors.primary} bold>
                  {" "}
                  Create Account
                </Txt>
              </Link>
            </View>
          </Box>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    width: "100%",
    gap: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
    gap: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  divider: {
    flex: 1,
    height: 1,
  },
  signupRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
