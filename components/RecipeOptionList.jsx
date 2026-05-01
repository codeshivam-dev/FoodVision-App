import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { GenerateWithAi } from "../services/AiModel";
import Prompt from "../shared/Prompt";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { UserContext } from "../context/UserContext";
import { useRouter } from "expo-router";
import { Txt, Card } from "./UIComponents";
import LoadingDialog from "./shared/LoadingDialog";

export default function RecipeOptionList({ recipeOption }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useContext(UserContext);
  const CreateRecipe = useMutation(api.Recipes.CreateRecipe);
  
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const onRecipeOptionSelect = async (recipe, index) => {
    if (loading) return; // Prevent double clicks
    
    setSelectedIndex(index);
    setLoading(true);

    try {
      // Generate complete recipe from AI
      const PROMPT = `RecipeName: ${recipe.recipeName}, Description: ${recipe.description} ${Prompt.GENERATE_COMPLETE_RECIPE_PROMPT}`;
      const AIResult = await GenerateWithAi(PROMPT);
      
      // Parse AI response
      const JSONContent = JSON.parse(
        AIResult.replace(/```json/g, "").replace(/```/g, "").trim()
      );

      // Validate AI response
      if (!JSONContent?.recipeName) {
        throw new Error("Invalid recipe data received");
      }

      // Save to database
      const recipeId = await CreateRecipe({
        jsonData: JSONContent,
        imageURI: JSONContent.imageURI || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfx0EZ_atQzJ02juJ9rckhMv2MM2vpmzYBHA&s",
        recipeName: JSONContent.recipeName,
        uid: user?._id,
      });

      console.log("Recipe saved:", recipeId);

      // Navigate to recipe detail
      router.push({
        pathname: "/recipe-detail",
        params: { recipeId },
      });

    } catch (error) {
      console.error("Recipe generation error:", error);
      
      Alert.alert(
        "Generation Failed",
        "Unable to create this recipe. Please try another option.",
        [
          { text: "Try Again", onPress: () => onRecipeOptionSelect(recipe, index) },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setLoading(false);
      setSelectedIndex(null);
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      {/* Header */}
      <View style={styles.header}>
        <Txt size={theme.fontSize.xl} bold color={theme.colors.text}>
          Select Recipe
        </Txt>
        <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
          {recipeOption?.length || 0} options found
        </Txt>
      </View>

      {/* Recipe Options */}
      <View style={{ gap: 12, marginTop: 16 }}>
        {recipeOption?.map((item, index) => {
          const isSelected = selectedIndex === index;
          
          return (
            <TouchableOpacity
              key={item.recipeName + index}
              onPress={() => onRecipeOptionSelect(item, index)}
              disabled={loading}
              activeOpacity={0.7}
              style={[
                styles.recipeCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: isSelected 
                    ? theme.colors.primary 
                    : theme.colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  ...theme.shadows.small,
                },
              ]}
            >
              {/* Recipe Icon */}
              <View style={[styles.iconContainer, { 
                backgroundColor: theme.colors.primaryLight 
              }]}>
                <Ionicons 
                  name="restaurant-outline" 
                  size={24} 
                  color={theme.colors.primary} 
                />
              </View>

              {/* Recipe Info */}
              <View style={styles.recipeInfo}>
                <Txt 
                  size={theme.fontSize.md} 
                  bold 
                  color={theme.colors.text}
                  style={{ marginBottom: 4 }}
                >
                  {item?.recipeName || "Unnamed Recipe"}
                </Txt>
                
                <Txt 
                  size={theme.fontSize.sm} 
                  color={theme.colors.textSecondary}
                  numberOfLines={2}
                >
                  {item?.description || "No description available"}
                </Txt>

                {/* Additional Info Tags */}
                {item?.cookTime && (
                  <View style={[styles.tag, { 
                    backgroundColor: theme.colors.inputBg,
                    marginTop: 8,
                  }]}>
                    <Ionicons 
                      name="time-outline" 
                      size={12} 
                      color={theme.colors.textSecondary} 
                    />
                    <Txt 
                      size={theme.fontSize.xs} 
                      color={theme.colors.textSecondary}
                    >
                      {item.cookTime} min
                    </Txt>
                  </View>
                )}
              </View>

              {/* Arrow Icon */}
              <View style={styles.arrowIcon}>
                <Ionicons 
                  name={isSelected ? "hourglass-outline" : "chevron-forward"} 
                  size={20} 
                  color={isSelected ? theme.colors.primary : theme.colors.textSecondary} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Loading Dialog */}
      <LoadingDialog 
        loading={loading} 
        message="Generating complete recipe..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeInfo: {
    flex: 1,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  arrowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});