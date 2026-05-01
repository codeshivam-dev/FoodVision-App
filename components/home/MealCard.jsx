import { View, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from '../../context/ThemeContext';
import { Txt } from '../UIComponents';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import * as Haptics from 'expo-haptics';

export default function MealCard({ mealPlanInfo, refreshData }) {
  const { theme } = useTheme();
  const updateStatus = useMutation(api.MealPlan.UpdateMealPlanStatus);
  const [loading, setLoading] = useState(false);

  const mealPlan = mealPlanInfo?.mealPlan;
  const recipe = mealPlanInfo?.recipe;
  const isCompleted = mealPlan?.completed;

  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast': return 'sunny-outline';
      case 'lunch': return 'sunny';
      case 'dinner': return 'moon-outline';
      case 'snacks': return 'cafe-outline';
      default: return 'restaurant-outline';
    }
  };

  const onToggleComplete = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLoading(true);

      await updateStatus({
        id: mealPlan?._id,
        completed: !isCompleted,
      });

      Haptics.notificationAsync(
        !isCompleted 
          ? Haptics.NotificationFeedbackType.Success 
          : Haptics.NotificationFeedbackType.Warning
      );

      Alert.alert(
        !isCompleted ? 'Meal Completed! 🎉' : 'Marked Incomplete',
        !isCompleted 
          ? 'Great job staying on track!' 
          : 'Meal marked as incomplete',
        [{ text: 'OK' }]
      );

      refreshData?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to update meal status');
      console.error('Meal update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.card, { 
      backgroundColor: theme.colors.card,
      borderColor: isCompleted ? theme.colors.accent || theme.colors.GREEN + '30' : theme.colors.border,
      ...theme.shadows.small,
    }]}>
      {/* Recipe Image */}
      <Image 
        source={{ uri: recipe?.imageURI }} 
        style={styles.image}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.info}>
          {/* Meal Type Badge */}
          <View style={styles.mealTypeRow}>
            <View style={[styles.mealTypeBadge, { 
              backgroundColor: isCompleted 
                ? (theme.colors.accent || theme.colors.GREEN) + '20' 
                : theme.colors.primaryLight 
            }]}>
              <Ionicons 
                name={getMealIcon(mealPlan?.mealType)} 
                size={12} 
                color={isCompleted ? theme.colors.accent || theme.colors.GREEN : theme.colors.primary} 
              />
              <Txt 
                size={theme.fontSize.xs} 
                bold 
                color={isCompleted ? theme.colors.accent || theme.colors.GREEN : theme.colors.primary}
              >
                {mealPlan?.mealType || 'Meal'}
              </Txt>
            </View>

            {/* Status Label */}
            {isCompleted && (
              <View style={[styles.completedBadge, { 
                backgroundColor: (theme.colors.accent || theme.colors.GREEN) + '15' 
              }]}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={10} 
                  color={theme.colors.accent || theme.colors.GREEN} 
                />
                <Txt 
                  size={9} 
                  color={theme.colors.accent || theme.colors.GREEN}
                >
                  Done
                </Txt>
              </View>
            )}
          </View>

          {/* Recipe Name */}
          <Txt 
            size={theme.fontSize.md} 
            bold 
            color={theme.colors.text}
            style={styles.recipeName}
            numberOfLines={1}
          >
            {recipe?.recipeName || 'Unnamed Recipe'}
          </Txt>

          {/* Calories & Time */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons 
                name="fire" 
                size={14} 
                color={theme.colors.accent || theme.colors.GREEN} 
              />
              <Txt 
                size={theme.fontSize.xs} 
                bold 
                color={theme.colors.accent || theme.colors.GREEN}
              >
                {recipe?.jsonData?.calories || '--'} kcal
              </Txt>
            </View>

            {recipe?.jsonData?.cookTime && (
              <View style={styles.metaItem}>
                <Ionicons 
                  name="time-outline" 
                  size={12} 
                  color={theme.colors.textSecondary} 
                />
                <Txt 
                  size={theme.fontSize.xs} 
                  color={theme.colors.textSecondary}
                >
                  {recipe.jsonData.cookTime} min
                </Txt>
              </View>
            )}
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          onPress={onToggleComplete}
          disabled={loading}
          activeOpacity={0.7}
          style={[
            styles.checkButton,
            {
              backgroundColor: isCompleted 
                ? theme.colors.accent || theme.colors.GREEN 
                : 'transparent',
              borderColor: isCompleted 
                ? theme.colors.accent || theme.colors.GREEN 
                : theme.colors.border,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color={isCompleted ? theme.colors.white : theme.colors.primary} 
            />
          ) : isCompleted ? (
            <Ionicons name="checkmark" size={18} color={theme.colors.white} />
          ) : (
            <View style={[styles.emptyCheck, { borderColor: theme.colors.border }]} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: 90,
    height: 90,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  mealTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recipeName: {
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  checkButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCheck: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 2,
  },
});