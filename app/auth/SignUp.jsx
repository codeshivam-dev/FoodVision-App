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
import { Link, useRouter } from "expo-router";
import { useContext, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/FirebasConfig";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserContext } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const createNewUser = useMutation(api.Users.CreateNewUser);
  const { setUser } = useContext(UserContext);
  const { theme } = useTheme();

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your full name");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Missing Password", "Please create a password");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const onSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;
      console.log("Firebase user created:", user.email);

      // Create user record in Convex database
      if (user) {
        const result = await createNewUser({
          name: name.trim(),
          email: email.trim(),
        });

        console.log("Convex user created:", result);

        // Store user in global context
        setUser(result);

        // Navigate to Home (directly logged in)
        router.replace("/(tabs)/Home");
      }
    } catch (error) {
      console.error("Signup error:", error.message);

      // Handle specific Firebase errors
      switch (error.code) {
        case "auth/email-already-in-use":
          Alert.alert(
            "Email Already Exists",
            "An account with this email already exists. Please sign in instead.",
          );
          break;
        case "auth/invalid-email":
          Alert.alert("Invalid Email", "Please enter a valid email address");
          break;
        case "auth/weak-password":
          Alert.alert(
            "Weak Password",
            "Password should be at least 6 characters",
          );
          break;
        default:
          Alert.alert(
            "Registration Failed",
            "Unable to create account. Please try again.",
          );
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
              Create Account
            </Txt>

            <Txt
              size={theme.fontSize.md}
              color={theme.colors.textSecondary}
              style={styles.subtitle}
            >
              Start your personalized health journey
            </Txt>
          </Box>

          {/* Form Section */}
          <Box bg="transparent" style={styles.form}>
            <Input
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              leftIcon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              }
            />

            <Input
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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

            {/* Terms Text */}
            <Txt
              size={theme.fontSize.xs}
              color={theme.colors.textSecondary}
              style={styles.terms}
            >
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </Txt>

            {/* Sign Up Button */}
            <Button
              title="Create Account"
              onPress={onSignUp}
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

            <View style={styles.signinRow}>
              <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
                Already have an account?
              </Txt>
              <Link href={"/auth/SignIn"}>
                <Txt size={theme.fontSize.sm} color={theme.colors.primary} bold>
                  {" "}
                  Sign In
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
  terms: {
    textAlign: "center",
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 10,
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
  signinRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
