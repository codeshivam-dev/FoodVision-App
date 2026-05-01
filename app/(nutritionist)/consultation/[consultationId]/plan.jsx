import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserContext } from '../../../../context/UserContext';
import { useTheme } from '../../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../../components/UIComponents';
import Button from '../../../../components/shared/Button';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function CreateDietPlan() {
  const params = useLocalSearchParams();
  const consultationId = Array.isArray(params.consultationId)
    ? params.consultationId[0]
    : params.consultationId;

  const { user } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [meals, setMeals] = useState([]);
  const [plan, setPlan] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'nutritionist') {
      router.replace('/(tabs)');
      return;
    }
    getPlanData();
  }, [consultationId, user]);

  const getPlanData = async () => {
    try {
      // Get existing plan if any
      const planResult = await convex.query(api.ExpertDietPlans.getExpertDietPlan, {
        consultationId,
      });
      
      if (planResult) {
        setPlan(planResult);
        setMeals(planResult.meals || []);
      }

      // Get consultation details for context
      const consultationResult = await convex.query(
        api.Consultations.getConsultationDetails,
        { consultationId }
      );
      setConsultation(consultationResult);
    } catch (error) {
      console.error('Error fetching plan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        name: '',
        calories: '',
        macros: { protein: '', carbs: '', fat: '' },
        foods: [],
        instructions: '',
      },
    ]);
  };

  const updateMeal = (index, field, value, subField = null) => {
    const updated = [...meals];
    if (subField) {
      updated[index][field] = {
        ...updated[index][field],
        [subField]: value,
      };
    } else {
      updated[index][field] = value;
    }
    setMeals(updated);
  };

  const removeMeal = (index) => {
    Alert.alert(
      'Remove Meal',
      `Are you sure you want to remove Meal ${index + 1}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setMeals(meals.filter((_, i) => i !== index)),
        },
      ]
    );
  };

  const validateMeals = () => {
    if (meals.length === 0) {
      Alert.alert('No Meals', 'Please add at least one meal to the diet plan');
      return false;
    }

    for (let i = 0; i < meals.length; i++) {
      const meal = meals[i];
      if (!meal.name?.trim()) {
        Alert.alert('Missing Name', `Please enter a name for Meal ${i + 1}`);
        return false;
      }

      const calories = parseFloat(meal.calories);
      const protein = parseFloat(meal.macros?.protein);
      const carbs = parseFloat(meal.macros?.carbs);
      const fat = parseFloat(meal.macros?.fat);

      if (isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
        Alert.alert(
          'Invalid Values',
          `Please enter valid numbers for calories and macros in Meal ${i + 1}`
        );
        return false;
      }

      if (calories <= 0 || protein < 0 || carbs < 0 || fat < 0) {
        Alert.alert(
          'Invalid Values',
          `Calories and macros must be positive numbers in Meal ${i + 1}`
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateMeals()) return;

    setSaving(true);

    try {
      const normalizedMeals = meals.map((m) => ({
        name: m.name.trim(),
        calories: parseFloat(m.calories),
        macros: {
          protein: parseFloat(m.macros.protein),
          carbs: parseFloat(m.macros.carbs),
          fat: parseFloat(m.macros.fat),
        },
        foods: m.foods || [],
        instructions: m.instructions?.trim() || '',
      }));

      if (plan) {
        await convex.mutation(api.ExpertDietPlans.updateExpertDietPlan, {
          planId: plan._id,
          meals: normalizedMeals,
        });
      } else {
        const consultationData = await convex.query(
          api.Consultations.getConsultationDetails,
          { consultationId }
        );

        await convex.mutation(api.ExpertDietPlans.createExpertDietPlan, {
          consultationId,
          userId: consultationData.user._id,
          meals: normalizedMeals,
        });
      }

      Alert.alert(
        'Success! 🎉',
        `Diet plan ${plan ? 'updated' : 'created'} successfully`,
        [
          {
            text: 'View Dashboard',
            onPress: () => router.replace('/(nutritionist)/(tabs)/Dashboard'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save diet plan');
    } finally {
      setSaving(false);
    }
  };

  // Calculate total macros
  const totalMacros = meals.reduce((acc, meal) => ({
    calories: acc.calories + (parseFloat(meal.calories) || 0),
    protein: acc.protein + (parseFloat(meal.macros?.protein) || 0),
    carbs: acc.carbs + (parseFloat(meal.macros?.carbs) || 0),
    fat: acc.fat + (parseFloat(meal.macros?.fat) || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading plan...
        </Txt>
      </Box>
    );
  }

  const renderMeal = ({ item, index }) => (
    <Card style={[styles.mealCard, { 
      borderLeftColor: index % 2 === 0 
        ? theme.colors.primary 
        : theme.colors.accent || theme.colors.GREEN,
    }]}>
      {/* Meal Header */}
      <View style={styles.mealHeader}>
        <View style={styles.mealHeaderLeft}>
          <View style={[styles.mealNumber, { backgroundColor: theme.colors.primaryLight }]}>
            <Txt size={theme.fontSize.sm} bold color={theme.colors.primary}>
              {index + 1}
            </Txt>
          </View>
          <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
            Meal {index + 1}
          </Txt>
        </View>

        <TouchableOpacity
          onPress={() => removeMeal(index)}
          style={[styles.removeButton, { backgroundColor: theme.colors.error + '15' }]}
        >
          <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
          <Txt size={theme.fontSize.xs} color={theme.colors.error}>Remove</Txt>
        </TouchableOpacity>
      </View>

      {/* Meal Name */}
      <View style={styles.fieldGroup}>
        <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary} style={styles.fieldLabel}>
          Meal Name
        </Txt>
        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.inputBg,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.text,
          }]}
          placeholder="e.g., Breakfast, Post-Workout Meal"
          placeholderTextColor={theme.colors.textSecondary}
          value={item.name}
          onChangeText={(v) => updateMeal(index, 'name', v)}
        />
      </View>

      {/* Calories */}
      <View style={styles.fieldGroup}>
        <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary} style={styles.fieldLabel}>
          Calories (kcal)
        </Txt>
        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.inputBg,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.text,
          }]}
          placeholder="e.g., 450"
          placeholderTextColor={theme.colors.textSecondary}
          value={item.calories}
          onChangeText={(v) => updateMeal(index, 'calories', v)}
          keyboardType="numeric"
        />
      </View>

      {/* Macros */}
      <View style={styles.macrosSection}>
        <View style={styles.macrosHeader}>
          <MaterialCommunityIcons name="nutrition" size={16} color={theme.colors.primary} />
          <Txt size={theme.fontSize.sm} bold color={theme.colors.primary}>
            Macronutrients (grams)
          </Txt>
        </View>

        <View style={styles.macrosGrid}>
          {[
            { key: 'protein', label: 'Protein', icon: 'food-drumstick', color: '#FF6B6B' },
            { key: 'carbs', label: 'Carbs', icon: 'bread-slice', color: '#FFD93D' },
            { key: 'fat', label: 'Fats', icon: 'oil', color: '#66BB6A' },
          ].map((macro) => (
            <View key={macro.key} style={styles.macroField}>
              <Txt size={10} color={theme.colors.textSecondary} style={{ marginBottom: 4 }}>
                {macro.label}
              </Txt>
              <TextInput
                style={[styles.macroInput, {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.inputBorder,
                  color: theme.colors.text,
                }]}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                value={item.macros[macro.key]}
                onChangeText={(v) => updateMeal(index, 'macros', v, macro.key)}
                keyboardType="numeric"
              />
            </View>
          ))}
        </View>
      </View>

      {/* Optional: Foods list */}
      <View style={styles.fieldGroup}>
        <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary} style={styles.fieldLabel}>
          Recommended Foods (comma separated)
        </Txt>
        <TextInput
          style={[styles.input, {
            backgroundColor: theme.colors.inputBg,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.text,
          }]}
          placeholder="e.g., Eggs, Oats, Banana"
          placeholderTextColor={theme.colors.textSecondary}
          value={item.foods?.join(', ') || ''}
          onChangeText={(v) => updateMeal(index, 'foods', v.split(',').map(s => s.trim()).filter(Boolean))}
        />
      </View>

      {/* Optional: Instructions */}
      <View style={styles.fieldGroup}>
        <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary} style={styles.fieldLabel}>
          Instructions (optional)
        </Txt>
        <TextInput
          style={[styles.input, styles.textArea, {
            backgroundColor: theme.colors.inputBg,
            borderColor: theme.colors.inputBorder,
            color: theme.colors.text,
          }]}
          placeholder="Any specific preparation instructions..."
          placeholderTextColor={theme.colors.textSecondary}
          value={item.instructions}
          onChangeText={(v) => updateMeal(index, 'instructions', v)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Box style={[styles.header, { 
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.divider,
        }]}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
              {plan ? 'Edit Diet Plan' : 'Create Diet Plan'}
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
              {consultation?.user?.name 
                ? `Prescribed for ${consultation.user.name}` 
                : 'Prescribe a structured meal plan'}
            </Txt>
          </View>
        </Box>

        <View style={styles.content}>
          {/* Total Macros Summary */}
          {meals.length > 0 && (
            <Card style={[styles.summaryCard, { 
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.primary + '30',
            }]}>
              <Txt size={theme.fontSize.sm} bold color={theme.colors.primary} style={{ marginBottom: 10 }}>
                Daily Total Nutrition
              </Txt>
              <View style={styles.summaryGrid}>
                {[
                  { label: 'Calories', value: totalMacros.calories, unit: 'kcal', color: '#FF6B6B' },
                  { label: 'Protein', value: totalMacros.protein, unit: 'g', color: '#FF8C42' },
                  { label: 'Carbs', value: totalMacros.carbs, unit: 'g', color: '#FFD93D' },
                  { label: 'Fats', value: totalMacros.fat, unit: 'g', color: '#66BB6A' },
                ].map((item) => (
                  <View key={item.label} style={styles.summaryItem}>
                    <View style={[styles.summaryDot, { backgroundColor: item.color }]} />
                    <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                      {item.value}
                    </Txt>
                    <Txt size={9} color={theme.colors.textSecondary}>
                      {item.unit}
                    </Txt>
                    <Txt size={9} color={theme.colors.textSecondary}>
                      {item.label}
                    </Txt>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Meals Count */}
          <View style={styles.mealsCountRow}>
            <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
              Meals ({meals.length})
            </Txt>
            <TouchableOpacity
              style={[styles.addMealButton, { backgroundColor: theme.colors.primary }]}
              onPress={addMeal}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color={theme.colors.white} />
              <Txt size={theme.fontSize.sm} bold color={theme.colors.white}>
                Add Meal
              </Txt>
            </TouchableOpacity>
          </View>

          {/* Meals List */}
          {meals.length === 0 ? (
            <Card style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="food-off" 
                size={40} 
                color={theme.colors.textSecondary} 
              />
              <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
                No meals added yet
              </Txt>
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                Tap "Add Meal" to start creating the diet plan
              </Txt>
            </Card>
          ) : (
            <FlatList
              data={meals}
              renderItem={renderMeal}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 14 }}
            />
          )}

          {/* Save Button */}
          {meals.length > 0 && (
            <View style={styles.saveContainer}>
              <Button 
                title={plan ? 'Update Diet Plan' : 'Save Diet Plan'}
                onPress={handleSave}
                loading={saving}
              />
              <Txt 
                size={theme.fontSize.xs} 
                color={theme.colors.textSecondary}
                style={{ textAlign: 'center', marginTop: 8 }}
              >
                Plan will be available to the client immediately
              </Txt>
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  summaryCard: {
    padding: 14,
    borderWidth: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  mealsCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mealCard: {
    padding: 16,
    borderLeftWidth: 4,
    gap: 14,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealNumber: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    marginBottom: 2,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  macrosSection: {
    gap: 8,
  },
  macrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  macroField: {
    flex: 1,
  },
  macroInput: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  saveContainer: {
    marginTop: 8,
  },
});