// components/home/TodayProgress.jsx
import { View, StyleSheet } from "react-native";
import { MaterialIcons, Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Txt, Card } from "../UIComponents";
import { UserContext } from "../../context/UserContext";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import moment from "moment";

export default function TodayProgress() {
  const { theme } = useTheme();
  const { user } = useContext(UserContext);
  const convex = useConvex();
  
  const [totalCalories, setTotalCalories] = useState(0);
  const [macros, setMacros] = useState({
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  useEffect(() => {
    if (user?._id) {
      fetchTodayData();
    }
  }, [user]);

  const fetchTodayData = async () => {
    try {
      // Fetch total calories
      const caloriesResult = await convex.query(api.MealPlan.GetTotalCaloriesByDate, {
        uid: user._id,
        date: moment().format('DD/MM/YYYY'),
      });
      setTotalCalories(caloriesResult || 0);

      // Fetch macros (if you have this query, otherwise calculate from meal plans)
      const mealPlans = await convex.query(api.MealPlan.GetTodaysMealPlan, {
        uid: user._id,
        date: moment().format('DD/MM/YYYY'),
      });

      // Calculate macros from today's meals
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      mealPlans?.forEach(meal => {
        const jsonData = meal?.recipe?.jsonData;
        if (jsonData) {
          totalProtein += parseFloat(jsonData.protien || jsonData.protein || 0);
          totalCarbs += parseFloat(jsonData.carbs || 0);
          totalFats += parseFloat(jsonData.fats || 0);
        }
      });

      setMacros({
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fats: Math.round(totalFats),
      });

    } catch (error) {
      console.error("Error fetching today's data:", error);
    }
  };

  const dailyGoal = user?.calories || 2000;
  const progressPercent = Math.min((totalCalories / dailyGoal) * 100, 100);
  const today = moment().format('dddd, MMM D');

  // Progress bar color based on percentage
  const getProgressColor = () => {
    if (progressPercent >= 100) return theme.colors.error;
    if (progressPercent >= 80) return theme.colors.warning;
    return theme.colors.accent || theme.colors.GREEN;
  };

  const macroItems = [
    {
      icon: <MaterialCommunityIcons name="food-drumstick" size={18} color="#FF6B6B" />,
      label: 'Protein',
      value: macros.protein,
      unit: 'g',
      goal: user?.proteinGoal || 150,
      color: '#FF6B6B',
      bgColor: '#FFE8E8',
      iconBg: '#FFD1D1',
    },
    {
      icon: <MaterialCommunityIcons name="bread-slice" size={18} color="#FFA726" />,
      label: 'Carbs',
      value: macros.carbs,
      unit: 'g',
      goal: user?.carbsGoal || 250,
      color: '#FFA726',
      bgColor: '#FFF3E0',
      iconBg: '#FFE0B2',
    },
    {
      icon: <MaterialCommunityIcons name="oil" size={18} color="#66BB6A" />,
      label: 'Fats',
      value: macros.fats,
      unit: 'g',
      goal: user?.fatsGoal || 65,
      color: '#66BB6A',
      bgColor: '#E8F5E9',
      iconBg: '#C8E6C9',
    },
  ];

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
            Today's Progress
          </Txt>
          <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
            {today}
          </Txt>
        </View>
        
        {/* Remaining Calories */}
        <View style={[styles.remainingBadge, { 
          backgroundColor: theme.colors.primaryLight 
        }]}>
          <Txt size={theme.fontSize.xs} color={theme.colors.primary}>
            {dailyGoal - totalCalories > 0 
              ? `${dailyGoal - totalCalories} left` 
              : 'Goal reached'}
          </Txt>
        </View>
      </View>

      {/* Calories Display */}
      <View style={styles.calorieSection}>
        <View style={styles.calorieRow}>
          <Txt size={40} bold color={theme.colors.text}>
            {totalCalories}
          </Txt>
          <Txt size={theme.fontSize.md} color={theme.colors.textSecondary}>
            / {dailyGoal} kcal
          </Txt>
        </View>
        
        {/* Progress Percentage */}
        <Txt 
          size={theme.fontSize.sm} 
          bold 
          color={getProgressColor()}
          style={{ marginTop: 2 }}
        >
          {Math.round(progressPercent)}% of daily goal
        </Txt>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.colors.inputBg }]}>
        <View style={[
          styles.progressFill,
          {
            width: `${progressPercent}%`,
            backgroundColor: getProgressColor(),
            borderRadius: 8,
          }
        ]} />
      </View>

      {/* Macros Grid */}
      <View style={styles.macrosGrid}>
        {macroItems.map((macro) => {
          const macroPercent = Math.min((macro.value / macro.goal) * 100, 100);
          
          return (
            <View 
              key={macro.label}
              style={[styles.macroCard, { 
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.border,
              }]}
            >
              {/* Icon */}
              <View style={[styles.macroIcon, { backgroundColor: macro.iconBg }]}>
                {macro.icon}
              </View>

              {/* Value */}
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                {macro.value}
              </Txt>
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                {macro.unit}
              </Txt>

              {/* Mini Progress Bar */}
              <View style={[styles.miniProgress, { backgroundColor: theme.colors.border }]}>
                <View style={[
                  styles.miniProgressFill,
                  {
                    width: `${macroPercent}%`,
                    backgroundColor: macro.color,
                    borderRadius: 2,
                  }
                ]} />
              </View>

              {/* Label */}
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                {macro.label}
              </Txt>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  remainingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  calorieSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  progressBar: {
    height: 8,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    minWidth: 4,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  macroCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  macroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  miniProgress: {
    width: '80%',
    height: 3,
    borderRadius: 2,
    marginTop: 2,
  },
  miniProgressFill: {
    height: '100%',
  },
});