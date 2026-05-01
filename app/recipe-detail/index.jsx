import { View, Platform, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import ActionSheet from "react-native-actions-sheet";
import RecipeIntro from "../../components/RecipeIntro";
import RecipeIngredients from "../../components/RecipeIngredients";
import RecipeSteps from "../../components/RecipeSteps";
import AddToMealActionSheet from "../../components/AddToMealActionSheet";
import Button from "../../components/shared/Button";
import { Txt, Box } from "../../components/UIComponents";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../convex/_generated/api";

export default function RecipeDetail() {
  const { recipeId } = useLocalSearchParams();
  const router = useRouter();
  const actionSheetRef = useRef(null);
  const { theme } = useTheme();

  // Fetch recipe data
  const recipeDetail = useQuery(api.Recipes.GetRecipeById, { id: recipeId });

  // Loading State
  if (recipeDetail === undefined) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading recipe details...
        </Txt>
      </Box>
    );
  }

  // Error State - Missing recipeId
  if (!recipeId) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Txt bold color={theme.colors.error} style={{ marginTop: 12 }}>
          Invalid navigation
        </Txt>
        <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
          Missing recipe ID. Please go back and try again.
        </Txt>
        <Button
          title="Go Back"
          variant="outline"
          onPress={() => router.back()}
          style={{ marginTop: 20, width: '60%' }}
        />
      </Box>
    );
  }

  // Error State - Recipe not found
  if (recipeDetail === null) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="restaurant-outline" size={48} color={theme.colors.textSecondary} />
        <Txt bold color={theme.colors.text} style={{ marginTop: 12 }}>
          Recipe Not Found
        </Txt>
        <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
          This recipe may have been removed or is no longer available.
        </Txt>
        <Button
          title="Browse Recipes"
          onPress={() => router.push('/(tabs)/Meals')}
          style={{ marginTop: 20, width: '70%' }}
        />
      </Box>
    );
  }

  // Success State - Show recipe
  return (
    <Box style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={[
          styles.container,
          { paddingTop: Platform.OS === "ios" ? 50 : 30 }
        ]}>
          
          {/* Recipe Header Section */}
          <RecipeIntro recipeDetail={recipeDetail} />

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          {/* Ingredients Section */}
          <View style={styles.section}>
            <RecipeIngredients recipeDetail={recipeDetail} />
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

          {/* Steps Section */}
          <View style={styles.section}>
            <RecipeSteps recipeDetail={recipeDetail} />
          </View>

          {/* Add to Meal Plan Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Add to Meal Plan"
              onPress={() => actionSheetRef.current?.show()}
            />
            
            <Txt 
              size={theme.fontSize.xs} 
              color={theme.colors.textSecondary}
              style={{ textAlign: 'center', marginTop: 8 }}
            >
              Choose a meal slot to add this recipe
            </Txt>
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Action Sheet for Meal Planning */}
      <ActionSheet 
        ref={actionSheetRef}
        gestureEnabled
        containerStyle={{
          backgroundColor: theme.colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <AddToMealActionSheet
          recipeDetail={recipeDetail}
          hideActionSheet={() => actionSheetRef.current?.hide()}
        />
      </ActionSheet>
    </Box>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    padding: 20,
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  divider: {
    height: 1,
    marginTop: 24,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
});