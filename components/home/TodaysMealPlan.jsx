import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Txt, Card } from '../UIComponents';
import MealCard from './MealCard';

export default function TodaysMealPlan({ mealPlan, refreshData }) {
  const { theme } = useTheme();

  // Empty state
  if (!mealPlan || mealPlan.length === 0) {
    return (
      <Card style={[styles.emptyContainer, { 
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
      }]}>
        <View style={[styles.emptyIcon, { 
          backgroundColor: theme.colors.primaryLight 
        }]}>
          <Ionicons 
            name="restaurant-outline" 
            size={32} 
            color={theme.colors.primary} 
          />
        </View>
        <Txt 
          size={theme.fontSize.md} 
          bold 
          color={theme.colors.text}
          style={{ textAlign: 'center' }}
        >
          No Meals Planned
        </Txt>
        <Txt 
          size={theme.fontSize.sm} 
          color={theme.colors.textSecondary}
          style={{ textAlign: 'center', lineHeight: 20 }}
        >
          Add meals to your plan for today
        </Txt>
      </Card>
    );
  }

  // Group meals by type
  const groupedMeals = mealPlan.reduce((acc, meal) => {
    const type = meal?.mealPlan?.mealType || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(meal);
    return acc;
  }, {});

  const mealOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  
  // Sort meals by time of day
  const sortedMealTypes = Object.keys(groupedMeals).sort((a, b) => {
    return mealOrder.indexOf(a) - mealOrder.indexOf(b);
  });

  return (
    <View style={styles.container}>
      {/* Meals Count Summary */}
      <View style={[styles.summaryBar, { 
        backgroundColor: theme.colors.inputBg,
        borderColor: theme.colors.border,
      }]}>
        <View style={styles.summaryItem}>
          <Ionicons 
            name="restaurant" 
            size={16} 
            color={theme.colors.primary} 
          />
          <Txt size={theme.fontSize.sm} color={theme.colors.text}>
            {mealPlan.length} {mealPlan.length === 1 ? 'Meal' : 'Meals'} Planned
          </Txt>
        </View>

        {/* Calorie Summary */}
        {mealPlan.reduce((sum, meal) => 
          sum + (parseFloat(meal?.recipe?.jsonData?.calories) || 0), 0
        ) > 0 && (
          <View style={styles.summaryItem}>
            <Ionicons 
              name="flame" 
              size={16} 
              color={theme.colors.accent || theme.colors.GREEN} 
            />
            <Txt 
              size={theme.fontSize.sm} 
              bold 
              color={theme.colors.accent || theme.colors.GREEN}
            >
              {mealPlan.reduce((sum, meal) => 
                sum + (parseFloat(meal?.recipe?.jsonData?.calories) || 0), 0
              )} kcal total
            </Txt>
          </View>
        )}
      </View>

      {/* Grouped Meals */}
      {sortedMealTypes.map((mealType) => (
        <View key={mealType} style={styles.mealGroup}>
          {/* Meal Type Header */}
          <View style={styles.mealTypeHeader}>
            <Txt 
              size={theme.fontSize.sm} 
              bold 
              color={theme.colors.textSecondary}
              style={{ textTransform: 'capitalize' }}
            >
              {mealType}
            </Txt>
            <View style={[styles.mealCount, { 
              backgroundColor: theme.colors.primaryLight 
            }]}>
              <Txt size={theme.fontSize.xs} color={theme.colors.primary}>
                {groupedMeals[mealType].length}
              </Txt>
            </View>
          </View>

          {/* Meal Cards */}
          {groupedMeals[mealType].map((meal) => (
            <MealCard 
              key={meal?.mealPlan?._id} 
              mealPlanInfo={meal} 
              refreshData={refreshData} 
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
    borderWidth: 1.5,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealGroup: {
    gap: 8,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  mealCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
});