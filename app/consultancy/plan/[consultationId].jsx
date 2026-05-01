import { View, FlatList, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../components/UIComponents';
import Button from '../../../components/shared/Button';

export default function ExpertDietPlan() {
  const { consultationId } = useLocalSearchParams();
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();
  
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlan();
  }, [consultationId]);

  const getPlan = async () => {
    try {
      const result = await convex.query(api.ExpertDietPlans.getExpertDietPlan, {
        consultationId,
      });
      setPlan(result);
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading diet plan...
        </Txt>
      </Box>
    );
  }

  // Not found state
  if (!plan) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="document-outline" size={48} color={theme.colors.textSecondary} />
        <Txt bold color={theme.colors.text} style={{ marginTop: 12 }}>
          Plan not found
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

  // Calculate total macros
  const totalMacros = plan?.meals?.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.macros?.protein || 0),
    carbs: acc.carbs + (meal.macros?.carbs || 0),
    fat: acc.fat + (meal.macros?.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const macroItems = [
    { label: 'Calories', value: totalMacros?.calories || 0, unit: 'kcal', color: '#FF6B6B', icon: 'fire' },
    { label: 'Protein', value: totalMacros?.protein || 0, unit: 'g', color: '#FF8C42', icon: 'food-drumstick' },
    { label: 'Carbs', value: totalMacros?.carbs || 0, unit: 'g', color: '#FFD93D', icon: 'bread-slice' },
    { label: 'Fats', value: totalMacros?.fat || 0, unit: 'g', color: '#66BB6A', icon: 'oil' },
  ];

  const renderMealCard = ({ item, index }) => (
    <Card style={[styles.mealCard, { 
      borderLeftColor: index % 2 === 0 
        ? theme.colors.primary 
        : theme.colors.accent || theme.colors.GREEN,
    }]}>
      {/* Meal Header */}
      <View style={styles.mealHeader}>
        <View style={[styles.mealIconBox, { 
          backgroundColor: index % 2 === 0 
            ? theme.colors.primaryLight 
            : (theme.colors.accent || theme.colors.GREEN) + '20' 
        }]}>
          <MaterialCommunityIcons 
            name={getMealIcon(item.name)} 
            size={20} 
            color={index % 2 === 0 ? theme.colors.primary : theme.colors.accent || theme.colors.GREEN} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
            {item.name || `Meal ${index + 1}`}
          </Txt>
          <Txt size={theme.fontSize.sm} bold color={theme.colors.primary}>
            {item.calories || 0} kcal
          </Txt>
        </View>
        <View style={[styles.mealNumber, { backgroundColor: theme.colors.primaryLight }]}>
          <Txt size={theme.fontSize.sm} bold color={theme.colors.primary}>
            #{index + 1}
          </Txt>
        </View>
      </View>

      {/* Macros Grid */}
      <View style={[styles.macrosGrid, { backgroundColor: theme.colors.inputBg }]}>
        <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary} style={{ marginBottom: 10 }}>
          Nutrition per serving
        </Txt>
        
        <View style={styles.macrosRow}>
          {[
            { label: 'Protein', value: item.macros?.protein || 0, unit: 'g', color: '#FF8C42' },
            { label: 'Carbs', value: item.macros?.carbs || 0, unit: 'g', color: '#FFD93D' },
            { label: 'Fats', value: item.macros?.fat || 0, unit: 'g', color: '#66BB6A' },
          ].map((macro) => (
            <View key={macro.label} style={styles.macroItem}>
              <View style={[styles.macroDot, { backgroundColor: macro.color }]} />
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                {macro.label}
              </Txt>
              <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                {macro.value}
              </Txt>
              <Txt size={10} color={theme.colors.textSecondary}>
                {macro.unit}
              </Txt>
            </View>
          ))}
        </View>
      </View>

      {/* Foods/Ingredients if available */}
      {item.foods?.length > 0 && (
        <View style={styles.foodsContainer}>
          <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary} style={{ marginBottom: 8 }}>
            Recommended Foods
          </Txt>
          <View style={styles.foodsList}>
            {item.foods.map((food, idx) => (
              <View 
                key={idx}
                style={[styles.foodTag, { 
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.primary + '30',
                }]}
              >
                <Txt size={11} color={theme.colors.primary}>
                  {food}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Instructions if available */}
      {item.instructions && (
        <View style={{ marginTop: 12 }}>
          <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary} style={{ marginBottom: 6 }}>
            Instructions
          </Txt>
          <Txt size={theme.fontSize.sm} color={theme.colors.text} style={{ lineHeight: 20 }}>
            {item.instructions}
          </Txt>
        </View>
      )}
    </Card>
  );

  const getMealIcon = (mealName) => {
    const name = mealName?.toLowerCase() || '';
    if (name.includes('breakfast')) return 'weather-sunny';
    if (name.includes('lunch')) return 'white-balance-sunny';
    if (name.includes('dinner')) return 'weather-night';
    if (name.includes('snack')) return 'food-apple';
    return 'food';
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Box style={[styles.header, { 
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.divider,
      }]}>
        <View style={[styles.headerIcon, { backgroundColor: theme.colors.primaryLight }]}>
          <MaterialCommunityIcons name="clipboard-text" size={28} color={theme.colors.primary} />
        </View>
        <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
          Expert Diet Plan
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
          Your personalized nutrition plan
        </Txt>
      </Box>

      {/* Total Macros Summary */}
      <Card style={[styles.summaryCard, { 
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary + '30',
      }]}>
        <Txt size={theme.fontSize.sm} bold color={theme.colors.primary} style={{ marginBottom: 12 }}>
          Daily Total Nutrition
        </Txt>
        
        <View style={styles.macrosRow}>
          {macroItems.map((macro) => (
            <View key={macro.label} style={styles.summaryMacro}>
              <MaterialCommunityIcons name={macro.icon} size={18} color={macro.color} />
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                {macro.value}
              </Txt>
              <Txt size={10} color={theme.colors.textSecondary}>
                {macro.unit}
              </Txt>
              <Txt size={10} color={theme.colors.textSecondary}>
                {macro.label}
              </Txt>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.content}>
        {/* Meals List */}
        {!plan?.meals || plan.meals.length === 0 ? (
          <Card style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="food-off" 
              size={40} 
              color={theme.colors.textSecondary} 
            />
            <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
              No meals in plan yet
            </Txt>
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              Your nutritionist will add meals soon
            </Txt>
          </Card>
        ) : (
          <>
            <View style={styles.mealCount}>
              <Ionicons name="restaurant" size={16} color={theme.colors.primary} />
              <Txt size={theme.fontSize.sm} color={theme.colors.text}>
                {plan.meals.length} {plan.meals.length === 1 ? 'Meal' : 'Meals'} Planned
              </Txt>
            </View>

            <FlatList
              data={plan.meals}
              renderItem={renderMealCard}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 12 }}
            />
          </>
        )}

        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backButton, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          }]}
        >
          <Ionicons name="arrow-back" size={16} color={theme.colors.textSecondary} />
          <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
            Go Back
          </Txt>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    padding: 20,
    paddingTop: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
  },
  summaryMacro: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  content: {
    padding: 20,
  },
  mealCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  mealCard: {
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 0,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mealIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealNumber: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  macrosGrid: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    gap: 2,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  foodsContainer: {
    marginTop: 12,
  },
  foodsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  foodTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    marginBottom: 40,
  },
});