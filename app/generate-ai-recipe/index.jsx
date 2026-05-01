import { View, TextInput, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Button from "../../components/shared/Button";
import { Txt, Box, Card } from "../../components/UIComponents";
import Prompt from "../../shared/Prompt";
import { GenerateWithAi } from "../../services/AiModel";
import RecipeOptionList from "../../components/RecipeOptionList";

export default function GenerateAiRecipe() {
  const { theme } = useTheme();
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipeOption, setRecipeOption] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerateRecipe = async () => {
    // Validation
    if (!input.trim()) {
      Alert.alert(
        "Empty Input",
        "Please enter a recipe name or ingredient to generate ideas!",
        [{ text: "OK" }]
      );
      return;
    }

    if (input.trim().length < 3) {
      Alert.alert(
        "Too Short",
        "Please enter at least 3 characters for better results.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    setHasGenerated(true);

    try {
      const PROMPT = Prompt.GENERATE_RECIPE_OPTION_PROMPT + input.trim();
      const AIResult = await GenerateWithAi(PROMPT);
      
      // Clean and parse AI response
      const cleanResult = AIResult
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      
      const JSONContent = JSON.parse(cleanResult);
      
      if (Array.isArray(JSONContent) && JSONContent.length > 0) {
        setRecipeOption(JSONContent);
      } else {
        throw new Error("Invalid recipe format received");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      
      Alert.alert(
        "Generation Failed",
        "Unable to generate recipes. Please try again with different keywords.",
        [
          { 
            text: "Try Again", 
            onPress: () => handleGenerateRecipe() 
          },
          { 
            text: "Cancel", 
            style: "cancel" 
          }
        ]
      );
      
      setRecipeOption([]);
    } finally {
      setLoading(false);
    }
  };

  const clearInput = () => {
    setInput("");
    setRecipeOption([]);
    setHasGenerated(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Box style={[styles.header, { 
          backgroundColor: theme.colors.primary,
          paddingTop: Platform.OS === "ios" ? 50 : 40,
        }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="sparkles" size={28} color={theme.colors.primary} />
            </View>
            <Txt size={theme.fontSize.xxl} bold color={theme.colors.white}>
              AI Recipe Generator
            </Txt>
            <Txt 
              size={theme.fontSize.sm} 
              color="rgba(255,255,255,0.9)"
              style={{ marginTop: 6, textAlign: 'center' }}
            >
              Describe what you want to cook and let AI create personalized recipes
            </Txt>
          </View>
        </Box>

        {/* Input Section */}
        <Box style={[styles.inputSection, { backgroundColor: theme.colors.background }]}>
          <Card style={{ padding: 20 }}>
            {/* Tips */}
            <View style={[styles.tipsContainer, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="bulb-outline" size={18} color={theme.colors.primary} />
              <Txt 
                size={theme.fontSize.xs} 
                color={theme.colors.primary}
                style={{ flex: 1 }}
              >
                Try: "High protein chicken dinner" or "Low carb vegetarian lunch"
              </Txt>
            </View>

            {/* Input Field */}
            <TextInput
              placeholder="E.g., Healthy protein breakfast with eggs..."
              value={input}
              onChangeText={setInput}
              multiline
              numberOfLines={4}
              style={[styles.textArea, {
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text,
                fontSize: theme.fontSize.md,
              }]}
              placeholderTextColor={theme.colors.textSecondary}
              textAlignVertical="top"
              maxLength={200}
            />

            {/* Character Count */}
            <Txt 
              size={theme.fontSize.xs} 
              color={theme.colors.textSecondary}
              style={{ textAlign: 'right', marginTop: 4 }}
            >
              {input.length}/200
            </Txt>

            {/* Action Buttons */}
            <View style={{ gap: 10, marginTop: 16 }}>
              <Button
                title="Generate Recipe"
                loading={loading}
                onPress={handleGenerateRecipe}
              />
              
              {input.length > 0 && (
                <Button
                  title="Clear"
                  variant="ghost"
                  onPress={clearInput}
                />
              )}
            </View>
          </Card>
        </Box>

        {/* Results Section */}
        {loading && (
          <Card style={[styles.loadingCard, { padding: 32, alignItems: 'center', gap: 16 }]}>
            <Ionicons name="sparkles" size={40} color={theme.colors.primary} />
            <Txt size={theme.fontSize.md} color={theme.colors.textSecondary}>
              AI is crafting your recipes...
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
              This may take a few seconds ✨
            </Txt>
          </Card>
        )}

        {!loading && recipeOption.length > 0 && (
          <Box style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                Generated Recipes
              </Txt>
              <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
                Based on: "{input}"
              </Txt>
            </View>
            
            <RecipeOptionList recipeOption={recipeOption} />
          </Box>
        )}

        {!loading && recipeOption.length === 0 && hasGenerated && (
          <Card style={[styles.emptyCard, { padding: 24, alignItems: 'center', gap: 12 }]}>
            <Ionicons 
              name="search-outline" 
              size={48} 
              color={theme.colors.textSecondary} 
            />
            <Txt 
              size={theme.fontSize.md} 
              color={theme.colors.textSecondary}
              style={{ textAlign: 'center' }}
            >
              No recipes generated. Try different ingredients.
            </Txt>
          </Card>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  inputSection: {
    marginTop: -16,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  textArea: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 120,
    lineHeight: 22,
  },
  loadingCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  resultsHeader: {
    marginBottom: 16,
    gap: 4,
  },
  emptyCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
});