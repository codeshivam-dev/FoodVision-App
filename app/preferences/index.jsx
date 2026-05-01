// app/preferences/index.jsx
import React, { useContext, useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../../components/shared/Button";
import { Txt, Box, Card } from "../../components/UIComponents";
import { useTheme } from "../../context/ThemeContext";
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useRouter } from "expo-router";
import { UserContext } from '../../context/UserContext';
import { calculateCaloriesAI } from "../../services/AiModel";
import Prompt from "../../shared/Prompt";
import LoadingDialog from "../../components/shared/LoadingDialog";

export default function Preference() {
  const { theme } = useTheme();
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();
  const UpdateUserPref = useMutation(api.Users.UpdateUserPref);
  
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(null);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(false);

  const genderOptions = [
    { key: "male", icon: "♂", label: "Male", icon2: "gender-male" },
    { key: "female", icon: "♀", label: "Female", icon2: "gender-female" },
    { key: "other", icon: "⚪", label: "Other", icon2: "gender-transgender" },
  ];

  const goalOptions = [
    { 
      key: "lose", 
      title: "Lose Weight", 
      subtitle: "Trim down and feel lighter",
      icon: "trending-down",
      color: theme.colors.error 
    },
    { 
      key: "gain", 
      title: "Gain Weight", 
      subtitle: "Build mass healthily",
      icon: "trending-up",
      color: theme.colors.blue 
    },
    { 
      key: "muscle", 
      title: "Build Muscle", 
      subtitle: "Increase strength and definition",
      icon: "barbell",
      color: theme.colors.accent || theme.colors.GREEN 
    },
  ];

  const onContinue = async () => {
    if (!weight || !height || !age || !gender || !goal) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields to create your personalized plan.",
        [{ text: "OK" }]
      );
      return;
    }

    if (isNaN(weight) || isNaN(height) || isNaN(age)) {
      Alert.alert(
        "Invalid Input",
        "Please enter valid numbers for weight, height, and age.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);

    try {
      const data = {
        uid: user?._id,
        weight: weight,
        height: height,
        age: age,
        gender: gender,
        goal: goal,
      };

      // Calculate calories via AI
      const PROMPT = JSON.stringify(data) + " " + Prompt.CALORIES_PROMPT;
      const AIResult = await calculateCaloriesAI(PROMPT);
      
      const JSONContent = JSON.parse(
        AIResult.replace(/```json/g, "").replace(/```/g, "").trim()
      );

      // Update user preferences in Convex
      await UpdateUserPref({
        ...data,
        ...JSONContent,
      });

      // Update local user context
      setUser(prev => ({
        ...prev,
        ...data,
        ...JSONContent,
      }));

      // Navigate to Home
      router.replace('/(tabs)/Home');

    } catch (error) {
      console.error("Preference update error:", error);
      
      Alert.alert(
        "Something went wrong",
        "Unable to save your preferences. Please try again.",
        [
          { text: "Try Again", onPress: onContinue },
          { text: "Cancel", style: "cancel" },
        ]
      );
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
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Box style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="fitness-outline" size={28} color={theme.colors.primary} />
            </View>
            <Txt size={theme.fontSize.xxl} bold color={theme.colors.text} style={styles.title}>
              Tell Us About Yourself
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={styles.subtitle}>
              This helps us create your personalized meal plan
            </Txt>
          </View>

          {/* Form Fields */}
          <Card style={{ padding: 20, gap: 16 }}>
            {/* Weight & Height */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Txt size={theme.fontSize.sm} bold color={theme.colors.text} style={styles.label}>
                  Weight (kg)
                </Txt>
                <View style={[styles.inputWrapper, { 
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.inputBorder,
                }]}>
                  <Ionicons name="scale-outline" size={18} color={theme.colors.textSecondary} />
                  <TextInput
                    placeholder="e.g., 70"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholderTextColor={theme.colors.textSecondary}
                    maxLength={4}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Txt size={theme.fontSize.sm} bold color={theme.colors.text} style={styles.label}>
                  Height (cm)
                </Txt>
                <View style={[styles.inputWrapper, { 
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.inputBorder,
                }]}>
                  <Ionicons name="resize-outline" size={18} color={theme.colors.textSecondary} />
                  <TextInput
                    placeholder="e.g., 170"
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="numeric"
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholderTextColor={theme.colors.textSecondary}
                    maxLength={3}
                  />
                </View>
              </View>
            </View>

            {/* Age */}
            <View>
              <Txt size={theme.fontSize.sm} bold color={theme.colors.text} style={styles.label}>
                Age
              </Txt>
              <View style={[styles.inputWrapper, { 
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
              }]}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.textSecondary} />
                <TextInput
                  placeholder="e.g., 25"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholderTextColor={theme.colors.textSecondary}
                  maxLength={2}
                />
              </View>
            </View>
          </Card>

          {/* Gender Selection */}
          <View style={styles.section}>
            <Txt size={theme.fontSize.md} bold color={theme.colors.text} style={styles.sectionTitle}>
              Gender
            </Txt>
            <View style={styles.row}>
              {genderOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.genderBox, { 
                    borderColor: gender === opt.key ? theme.colors.primary : theme.colors.border,
                    backgroundColor: gender === opt.key ? theme.colors.primaryLight : theme.colors.card,
                  }]}
                  onPress={() => setGender(opt.key)}
                  activeOpacity={0.7}
                >
                  <Txt size={24} style={{ marginBottom: 4 }}>
                    {opt.icon}
                  </Txt>
                  <Txt 
                    size={theme.fontSize.xs} 
                    bold={gender === opt.key}
                    color={gender === opt.key ? theme.colors.primary : theme.colors.textSecondary}
                  >
                    {opt.label}
                  </Txt>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Goal Selection */}
          <View style={styles.section}>
            <Txt size={theme.fontSize.md} bold color={theme.colors.text} style={styles.sectionTitle}>
              What's Your Goal?
            </Txt>
            
            <View style={{ gap: 10 }}>
              {goalOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.goalCard, { 
                    borderColor: goal === opt.key ? theme.colors.primary : theme.colors.border,
                    backgroundColor: goal === opt.key ? theme.colors.primaryLight : theme.colors.card,
                  }]}
                  onPress={() => setGoal(opt.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.goalIcon, { backgroundColor: opt.color + '20' }]}>
                    <MaterialCommunityIcons 
                      name={opt.icon} 
                      size={20} 
                      color={opt.color} 
                    />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                      {opt.title}
                    </Txt>
                    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                      {opt.subtitle}
                    </Txt>
                  </View>

                  {goal === opt.key && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={22} 
                      color={theme.colors.primary} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <Button 
              title="Continue"
              onPress={onContinue}
              loading={loading}
            />
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 40 }} />
        </Box>
      </ScrollView>

      {/* Loading Dialog */}
      <LoadingDialog 
        loading={loading} 
        message="Creating your personalized plan..."
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  genderBox: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1.5,
    borderRadius: 12,
    gap: 14,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 24,
  },
});