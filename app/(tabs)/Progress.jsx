import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { UserContext } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { Txt, Box, Card } from '../../components/UIComponents';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function Progress() {
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Real data states
  const [progressData, setProgressData] = useState(null);
  const [mealHistory, setMealHistory] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [consultationStats, setConsultationStats] = useState({
    total: 0,

    
    completed: 0,
    upcoming: 0,
  });
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (user?._id) {
      fetchAllProgressData();
    }
  }, [user, selectedPeriod]);

  const fetchAllProgressData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [progress, mealData, weeklyData, consultationData] = await Promise.all([
        convex.query(api.Users.GetUserProgress, { userId: user._id }),
        convex.query(api.MealPlan.GetMealHistory, {
          uid: user._id,
          period: selectedPeriod,
        }),
        convex.query(api.MealPlan.GetWeeklyStats, {
          uid: user._id,
        }),
        convex.query(api.Consultations.getUserConsultations, {
          userId: user._id,
        }),
      ]);

      setProgressData(progress);
      setMealHistory(mealData || []);
      setWeeklyStats(weeklyData || []);

      // Calculate consultation stats
      const consultations = consultationData || [];
      setConsultationStats({
        total: consultations.length,
        completed: consultations.filter(c => c.status === 'completed').length,
        upcoming: consultations.filter(c =>
          c.status === 'upcoming' || c.status === 'confirmed'
        ).length,
      });

      // Generate achievements based on real data
      generateAchievements(mealData || [], consultations);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAchievements = (meals, consultations) => {
    const achievementsList = [];

    // Streak achievement
    const streakDays = calculateStreak(meals);
    if (streakDays >= 3) {
      achievementsList.push({
        id: 1,
        title: `${streakDays}-Day Streak!`,
        description: `Logged meals for ${streakDays} days straight`,
        emoji: '🔥',
        bgColor: '#FF6B6B',
      });
    }

    // Consultation achievement
    const completedConsultations = consultations.filter(c => c.status === 'completed').length;
    if (completedConsultations >= 1) {
      achievementsList.push({
        id: 2,
        title: 'Professional Guidance',
        description: `${completedConsultations} consultation${completedConsultations > 1 ? 's' : ''} completed`,
        emoji: '👨‍⚕️',
        bgColor: '#2196F3',
      });
    }

    // Meal variety achievement
    const uniqueRecipes = new Set(meals.map(m => m?.recipe?._id).filter(Boolean)).size;
    if (uniqueRecipes >= 5) {
      achievementsList.push({
        id: 3,
        title: 'Meal Explorer',
        description: `Tried ${uniqueRecipes} different recipes`,
        emoji: '🌟',
        bgColor: '#9C27B0',
      });
    }

    // Perfect day achievement (all meals completed in a day)
    const dayCompletion = {};
    meals.forEach(m => {
      const date = m?.mealPlan?.date;
      if (date) {
        if (!dayCompletion[date]) dayCompletion[date] = { total: 0, completed: 0 };
        dayCompletion[date].total++;
        if (m?.mealPlan?.completed) dayCompletion[date].completed++;
      }
    });

    const perfectDays = Object.values(dayCompletion).filter(
      d => d.total > 0 && d.total === d.completed
    ).length;

    if (perfectDays >= 1) {
      achievementsList.push({
        id: 4,
        title: 'Perfect Day!',
        description: `${perfectDays} day${perfectDays > 1 ? 's' : ''} with all meals completed`,
        emoji: '⭐',
        bgColor: '#FFD700',
      });
    }

    // Total meals logged
    if (meals.length >= 10) {
      achievementsList.push({
        id: 5,
        title: 'Dedicated Tracker',
        description: `Logged ${meals.length} meals in total`,
        emoji: '📝',
        bgColor: '#4CAF50',
      });
    }

    setAchievements(achievementsList);
  };

  const calculateStreak = (meals) => {
    if (!meals || meals.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const dateStr = `${String(checkDate.getDate()).padStart(2, '0')}/${String(checkDate.getMonth() + 1).padStart(2, '0')}/${checkDate.getFullYear()}`;
      
      const hasMeals = meals.some(m => m?.mealPlan?.date === dateStr);
      
      if (hasMeals) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllProgressData();
    setRefreshing(false);
  }, [user, selectedPeriod]);

  // Calculate today's nutrition from meals
  const todayNutrition = useMemo(() => {
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    const todayMeals = mealHistory.filter(m => m?.mealPlan?.date === todayStr);

    return {
      calories: todayMeals.reduce((sum, m) => sum + (m?.mealPlan?.calories || 0), 0),
      protein: todayMeals.reduce((sum, m) => sum + (parseFloat(m?.recipe?.jsonData?.protien || m?.recipe?.jsonData?.protein) || 0), 0),
      carbs: todayMeals.reduce((sum, m) => sum + (parseFloat(m?.recipe?.jsonData?.carbs) || 0), 0),
      fats: todayMeals.reduce((sum, m) => sum + (parseFloat(m?.recipe?.jsonData?.fats) || 0), 0),
    };
  }, [mealHistory]);

  // Calculate weight change
  const bodyMeasurements = useMemo(() => {
    const currentWeight = parseFloat(user?.weight) || 0;
    const currentHeight = parseFloat(user?.height) || 0;
    const heightInMeters = currentHeight / 100;

    const bmi = heightInMeters > 0
      ? (currentWeight / (heightInMeters * heightInMeters)).toFixed(1)
      : '--';

    return {
      weight: currentWeight || '--',
      height: currentHeight || '--',
      bmi,
    };
  }, [user]);

  const periodOptions = [
    { key: 'week', label: 'Week', icon: 'calendar-outline' },
    { key: 'month', label: 'Month', icon: 'calendar' },
    { key: 'year', label: 'Year', icon: 'trending-up' },
  ];

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading your progress...
        </Txt>
      </Box>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
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
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.divider,
      }]}>
        <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
          Your Progress
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
          Keep up the great work! 💪
        </Txt>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periodOptions.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[styles.periodTab, {
                backgroundColor: selectedPeriod === period.key
                  ? theme.colors.primary
                  : theme.colors.inputBg,
                borderColor: selectedPeriod === period.key
                  ? theme.colors.primary
                  : theme.colors.border,
              }]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Ionicons
                name={period.icon}
                size={12}
                color={selectedPeriod === period.key ? theme.colors.white : theme.colors.textSecondary}
              />
              <Txt
                size={theme.fontSize.xs}
                color={selectedPeriod === period.key ? theme.colors.white : theme.colors.textSecondary}
              >
                {period.label}
              </Txt>
            </TouchableOpacity>
          ))}
        </View>
      </Box>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.statIcon}>
              <FontAwesome5 name="weight" size={16} color="#FFF" />
            </View>
            <Txt size={20} bold color="#FFF">
              {bodyMeasurements.weight}
            </Txt>
            <Txt size={theme.fontSize.xs} color="rgba(255,255,255,0.8)">
              kg
            </Txt>
            <Txt size={10} color="rgba(255,255,255,0.9)">
              Current
            </Txt>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.accent || '#0D9E71' }]}>
            <View style={styles.statIcon}>
              <Ionicons name="flame" size={16} color="#FFF" />
            </View>
            <Txt size={20} bold color="#FFF">
              {calculateStreak(mealHistory)}
            </Txt>
            <Txt size={theme.fontSize.xs} color="rgba(255,255,255,0.8)">
              day streak
            </Txt>
            <Txt size={10} color="rgba(255,255,255,0.9)">
              🔥 Keep going!
            </Txt>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
            <View style={styles.statIcon}>
              <Ionicons name="restaurant" size={16} color="#FFF" />
            </View>
            <Txt size={20} bold color="#FFF">
              {mealHistory.length}
            </Txt>
            <Txt size={theme.fontSize.xs} color="rgba(255,255,255,0.8)">
              meals logged
            </Txt>
            <Txt size={10} color="rgba(255,255,255,0.9)">
              {selectedPeriod === 'week' ? 'This week' : selectedPeriod === 'month' ? 'This month' : 'This year'}
            </Txt>
          </View>
        </View>

        {/* Weekly Adherence Chart */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
              Weekly Adherence
            </Txt>
            <Txt size={theme.fontSize.sm} bold color={theme.colors.primary}>
              {weeklyStats.length > 0
                ? Math.round(weeklyStats.reduce((sum, d) => sum + d.value, 0) / weeklyStats.length)
                : 0}% avg
            </Txt>
          </View>

          {weeklyStats.length === 0 ? (
            <View style={styles.emptyChart}>
              <Ionicons name="bar-chart-outline" size={32} color={theme.colors.textSecondary} />
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                No data yet. Start logging meals!
              </Txt>
            </View>
          ) : (
            <View style={styles.barChart}>
              {weeklyStats.map((data, index) => (
                <View key={data.day + index} style={styles.barContainer}>
                  <Txt size={10} color={theme.colors.textSecondary} style={{ marginBottom: 4 }}>
                    {data.value}%
                  </Txt>
                  <View style={[styles.barTrack, { backgroundColor: theme.colors.inputBg }]}>
                    <View style={[styles.bar, {
                      height: `${Math.max(data.value, 4)}%`,
                      backgroundColor: data.value >= 80
                        ? theme.colors.accent || '#0D9E71'
                        : data.value >= 50
                          ? theme.colors.primary
                          : theme.colors.warning,
                    }]} />
                  </View>
                  <Txt size={10} color={theme.colors.textSecondary} style={{ marginTop: 6 }}>
                    {data.day}
                  </Txt>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Today's Nutrition */}
        <Card style={styles.nutritionCard}>
          <Txt size={theme.fontSize.lg} bold color={theme.colors.text} style={{ marginBottom: 16 }}>
            Today's Nutrition
          </Txt>

          <View style={styles.nutritionGrid}>
            {[
              {
                label: 'Calories',
                value: todayNutrition.calories,
                goal: user?.calories || 2000,
                unit: 'kcal',
                color: '#FF6B6B',
                icon: 'fire',
              },
              {
                label: 'Protein',
                value: todayNutrition.protein,
                goal: 150,
                unit: 'g',
                color: '#FF8C42',
                icon: 'food-drumstick',
              },
              {
                label: 'Carbs',
                value: todayNutrition.carbs,
                goal: 250,
                unit: 'g',
                color: '#FFD93D',
                icon: 'bread-slice',
              },
              {
                label: 'Fats',
                value: todayNutrition.fats,
                goal: 65,
                unit: 'g',
                color: '#66BB6A',
                icon: 'oil',
              },
            ].map((nutrient) => {
              const percentage = Math.min((nutrient.value / nutrient.goal) * 100, 100);

              return (
                <View key={nutrient.label} style={styles.nutrientItem}>
                  <View style={styles.nutrientHeader}>
                    <MaterialCommunityIcons name={nutrient.icon} size={16} color={nutrient.color} />
                    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                      {nutrient.label}
                    </Txt>
                    <Txt size={10} color={theme.colors.textSecondary} style={{ marginLeft: 'auto' }}>
                      {Math.round(percentage)}%
                    </Txt>
                  </View>

                  <View style={styles.nutrientValueRow}>
                    <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                      {Math.round(nutrient.value)}
                    </Txt>
                    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                      / {nutrient.goal} {nutrient.unit}
                    </Txt>
                  </View>

                  <View style={[styles.nutrientBar, { backgroundColor: theme.colors.inputBg }]}>
                    <View style={[styles.nutrientFill, {
                      width: `${percentage}%`,
                      backgroundColor: nutrient.color,
                    }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Achievements */}
        {achievements.length > 0 && (
          <View style={styles.section}>
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text} style={{ marginBottom: 12 }}>
              Achievements
            </Txt>

            {achievements.map((achievement) => (
              <Card key={achievement.id} style={styles.achievementCard}>
                <View style={[styles.achievementIcon, { backgroundColor: achievement.bgColor + '20' }]}>
                  <Txt size={24}>{achievement.emoji}</Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
                    {achievement.title}
                  </Txt>
                  <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                    {achievement.description}
                  </Txt>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={achievement.bgColor} />
              </Card>
            ))}
          </View>
        )}

        {/* Body Measurements */}
        <Card style={styles.section}>
          <Txt size={theme.fontSize.lg} bold color={theme.colors.text} style={{ marginBottom: 16 }}>
            Body Measurements
          </Txt>

          <View style={styles.measurementsGrid}>
            {[
              { label: 'BMI', value: bodyMeasurements.bmi, icon: 'human', color: '#FF6B6B' },
              { label: 'Weight', value: `${bodyMeasurements.weight} kg`, icon: 'scale-bathroom', color: '#4CAF50' },
              { label: 'Height', value: `${bodyMeasurements.height} cm`, icon: 'human-male-height', color: '#2196F3' },
              { label: 'Goal', value: user?.goal || '--', icon: 'target', color: '#FF9800' },
            ].map((measure) => (
              <View key={measure.label} style={[styles.measureItem, {
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.border,
              }]}>
                <MaterialCommunityIcons name={measure.icon} size={20} color={measure.color} />
                <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                  {measure.value}
                </Txt>
                <Txt size={10} color={theme.colors.textSecondary}>
                  {measure.label}
                </Txt>
              </View>
            ))}
          </View>
        </Card>

        {/* Consultation Progress */}
        {consultationStats.total > 0 && (
          <Card style={styles.section}>
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text} style={{ marginBottom: 16 }}>
              Consultation Progress
            </Txt>

            <View style={styles.consultGrid}>
              <View style={styles.consultItem}>
                <Txt size={theme.fontSize.xxl} bold color={theme.colors.primary}>
                  {consultationStats.total}
                </Txt>
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Total</Txt>
              </View>
              <View style={[styles.consultDivider, { backgroundColor: theme.colors.divider }]} />
              <View style={styles.consultItem}>
                <Txt size={theme.fontSize.xxl} bold color={theme.colors.accent || '#0D9E71'}>
                  {consultationStats.completed}
                </Txt>
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Completed</Txt>
              </View>
              <View style={[styles.consultDivider, { backgroundColor: theme.colors.divider }]} />
              <View style={styles.consultItem}>
                <Txt size={theme.fontSize.xxl} bold color="#FF9800">
                  {consultationStats.upcoming}
                </Txt>
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Upcoming</Txt>
              </View>
            </View>
          </Card>
        )}

        <View style={{ height: 40 }} />
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
    borderBottomWidth: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  periodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  chartCard: {
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyChart: {
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 24,
    height: 100,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    minHeight: 4,
  },
  nutritionCard: {
    padding: 16,
  },
  nutritionGrid: {
    gap: 14,
  },
  nutrientItem: {
    gap: 6,
  },
  nutrientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nutrientValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  nutrientBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  nutrientFill: {
    height: '100%',
    borderRadius: 3,
  },
  section: {
    marginTop: 4,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 8,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  measureItem: {
    width: '47%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  consultGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consultItem: {
    flex: 1,
    alignItems: 'center',
  },
  consultDivider: {
    width: 1,
    height: 30,
  },
});