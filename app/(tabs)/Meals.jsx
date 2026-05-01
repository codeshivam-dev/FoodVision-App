import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import GenerateRecipeCard from "../../components/home/GenerateRecipeCard";
import Button from "../../components/shared/Button";
import { Txt, Box, Card } from "../../components/UIComponents";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../convex/_generated/api";
import MealCard from "../../components/meal/MealCard";

export default function Meals() {
  const router = useRouter();
  const { theme } = useTheme();
  const recipeList = useQuery(api.Recipes.GetAllRecipes);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Convex automatically re-fetches when query changes
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.surface }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <Box style={[styles.header, { 
        backgroundColor: theme.colors.background,
        borderBottomColor: theme.colors.divider 
      }]}>
        <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
          Discover Recipes
        </Txt>
      </Box>

      {/* AI Recipe Generator */}
      <Box style={{ margin: 16, marginBottom: 8 }}>
        <GenerateRecipeCard />
      </Box>

      {/* Suggested Meals Section */}
      <View style={styles.section}>
        <Txt 
          size={theme.fontSize.lg} 
          bold 
          color={theme.colors.text}
          style={{ marginBottom: 14 }}
        >
          Suggested Meals
        </Txt>

        {/* Loading State */}
        {recipeList === undefined && (
          <View style={styles.centerState}>
            <Txt color={theme.colors.textSecondary}>
              Loading recipes...
            </Txt>
          </View>
        )}

        {/* Empty State */}
        {recipeList?.length === 0 && (
          <Card style={styles.centerState}>
            <Ionicons 
              name="restaurant-outline" 
              size={48} 
              color={theme.colors.textSecondary} 
            />
            <Txt 
              color={theme.colors.textSecondary}
              style={{ textAlign: 'center', marginTop: 12 }}
            >
              No recipes available yet
            </Txt>
            <Button 
              title="Generate AI Recipe"
              onPress={() => router.push('/generate-ai-recipe')}
              style={{ marginTop: 12, width: '70%' }}
            />
          </Card>
        )}

        {/* Recipe List */}
        {recipeList?.map((meal) => (
          <MealCard 
            key={meal._id} 
            meal={meal} 
            onPress={() => router.push({
              pathname: "/recipe-detail",
              params: { recipeId: meal._id }
            })}
          />
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  nutritionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 6,
  },
  nutBox: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    gap: 2,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
});