import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect, useCallback, useContext } from "react";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { UserContext } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Txt, Box, Card } from "../../components/UIComponents";

export default function Progress() {
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const { theme } = useTheme();
  
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch progress data
  const fetchProgressData = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const data = await convex.query(api.Users.GetUserProgress, {
        userId: user._id,
      });
      setProgressData(data);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProgressData();
    setRefreshing(false);
  }, [fetchProgressData]);

  // Dynamic data with fallbacks
  const userStats = {
    weight: user?.weight || progressData?.weight || '--',
    initialWeight: progressData?.initialWeight || user?.initialWeight,
    streak: progressData?.streak || 0,
    bmi: user?.weight && user?.height 
      ? (parseFloat(user.weight) / ((parseFloat(user.height) / 100) ** 2)).toFixed(1)
      : '--',
    bodyFat: progressData?.bodyFat || '--',
    muscleMass: progressData?.muscleMass || '--',
    waterPercentage: progressData?.waterPercentage || '--',
  };

  // Calculate weight change
  const weightChange = userStats.weight !== '--' && userStats.initialWeight
    ? (parseFloat(userStats.weight) - parseFloat(userStats.initialWeight)).toFixed(1)
    : null;

  // Weekly adherence data (dynamic or fallback)
  const weeklyData = progressData?.weeklyAdherence || [
    { day: "Mon", value: 85 },
    { day: "Tue", value: 78 },
    { day: "Wed", value: 92 },
    { day: "Thu", value: 88 },
    { day: "Fri", value: 95 },
    { day: "Sat", value: 75 },
    { day: "Sun", value: 82 },
  ];

  const maxValue = Math.max(...weeklyData.map((d) => d.value));
  const avgAdherence = Math.round(
    weeklyData.reduce((sum, d) => sum + d.value, 0) / weeklyData.length
  );

  // Achievements (dynamic or fallback)
  const [achievements, setAchievements] = useState(
    progressData?.achievements || [
      {
        id: 1,
        title: "7-Day Streak",
        description: "Logged meals for 7 days straight",
        emoji: "🔥",
        bgColor: "#ff9c6a",
      },
      {
        id: 2,
        title: "Protein Goal",
        description: "Hit protein target 5 days this week",
        emoji: "💪",
        bgColor: "#6ab7ff",
      },
      {
        id: 3,
        title: "Calorie Champion",
        description: "Stayed within calorie range",
        emoji: "⭐",
        bgColor: "#ffd966",
      },
    ]
  );

  const measurements = [
    { label: "Body Fat %", value: userStats.bodyFat, unit: "%", icon: "body" },
    { label: "Muscle Mass", value: userStats.muscleMass, unit: "kg", icon: "arm-flex" },
    { label: "BMI", value: userStats.bmi, unit: "", icon: "scale-bathroom" },
    { label: "Water %", value: userStats.waterPercentage, unit: "%", icon: "water" },
  ];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading your progress...
        </Txt>
      </View>
    );
  }

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
          Your Progress
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
          Keep up the great work! 💪
        </Txt>
      </Box>

      {/* Stats Cards */}
      <View style={styles.cards}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.accent || theme.colors.GREEN }]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Feather name="trending-down" size={16} color="#fff" />
            </View>
            <Txt size={theme.fontSize.xs} color="rgba(255,255,255,0.9)">
              Weight
            </Txt>
          </View>
          <Txt size={theme.fontSize.xl} bold color="#fff">
            {userStats.weight} kg
          </Txt>
          {weightChange && (
            <Txt size={theme.fontSize.xs} color="rgba(255,255,255,0.9)" style={{ marginTop: 4 }}>
              {weightChange > 0 ? '+' : ''}{weightChange} kg total
            </Txt>
          )}
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Feather name="trending-up" size={16} color="#fff" />
            </View>
            <Txt size={theme.fontSize.xs} color="rgba(255,255,255,0.9)">
              Streak
            </Txt>
          </View>
          <Txt size={theme.fontSize.xl} bold color="#fff">
            {userStats.streak} days
          </Txt>
          <Txt size={theme.fontSize.xs} color="rgba(255,255,255,0.9)" style={{ marginTop: 4 }}>
            {userStats.streak > 7 ? '🔥 Personal best!' : 'Keep going!'}
          </Txt>
        </View>
      </View>

      {/* Weekly Adherence Chart */}
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
            Weekly Adherence
          </Txt>
          <TouchableOpacity style={[styles.chartBtn, { borderColor: theme.colors.accent || theme.colors.GREEN }]}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.accent || theme.colors.GREEN} />
            <Txt size={theme.fontSize.xs} color={theme.colors.accent || theme.colors.GREEN}>
              This Week
            </Txt>
          </TouchableOpacity>
        </View>

        <View style={styles.barContainer}>
          {weeklyData.map((d, index) => (
            <View key={d.day} style={styles.barBox}>
              <Txt 
                size={theme.fontSize.xs} 
                color={theme.colors.textSecondary}
                style={{ marginBottom: 4 }}
              >
                {d.value}%
              </Txt>
              <View style={[styles.barTrack, { backgroundColor: theme.colors.inputBg }]}>
                <View style={[
                  styles.bar, 
                  { 
                    height: `${(d.value / maxValue) * 100}%`,
                    backgroundColor: index >= 5 
                      ? theme.colors.accent || theme.colors.GREEN 
                      : theme.colors.primary 
                  }
                ]} />
              </View>
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary} style={{ marginTop: 6 }}>
                {d.day}
              </Txt>
            </View>
          ))}
        </View>

        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
          <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
            {avgAdherence}%
          </Txt> average adherence
        </Txt>
      </Card>

      {/* Achievements */}
      <View style={{ paddingHorizontal: 20 }}>
        <Txt 
          size={theme.fontSize.lg} 
          bold 
          color={theme.colors.text}
          style={{ marginTop: 24, marginBottom: 12 }}
        >
          Recent Achievements
        </Txt>
        
        {achievements.length === 0 ? (
          <Card style={[styles.emptyState, { padding: 24 }]}>
            <MaterialCommunityIcons 
              name="trophy-outline" 
              size={40} 
              color={theme.colors.textSecondary} 
            />
            <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
              No achievements yet. Keep tracking your meals!
            </Txt>
          </Card>
        ) : (
          achievements.map((a) => (
            <Card key={a.id} style={[styles.achievementRow, { padding: 14 }]}>
              <View style={[styles.emojiBox, { backgroundColor: a.bgColor }]}>
                <Txt size={theme.fontSize.xl}>{a.emoji}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
                  {a.title}
                </Txt>
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                  {a.description}
                </Txt>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Body Measurements */}
      <Card style={[styles.measureCard, { marginTop: 20, marginBottom: 50 }]}>
        <Txt size={theme.fontSize.md} bold color={theme.colors.text} style={{ marginBottom: 14 }}>
          Body Measurements
        </Txt>
        
        {measurements.map((item, i) => (
          <View
            key={item.label}
            style={[
              styles.measureRow,
              i !== measurements.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialCommunityIcons 
                name={item.icon} 
                size={18} 
                color={theme.colors.textSecondary} 
              />
              <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
                {item.label}
              </Txt>
            </View>
            <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
              {item.value !== '--' ? `${item.value}${item.unit}` : '--'}
            </Txt>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  cards: {
    marginTop: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
  },
  cardHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
    marginBottom: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  chartCard: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 150,
    marginBottom: 12,
    gap: 4,
  },
  barBox: { 
    alignItems: "center", 
    flex: 1,
  },
  barTrack: {
    width: "100%",
    height: 100,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: "100%",
    borderRadius: 6,
    minHeight: 4,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
  },
  achievementRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  emojiBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  measureCard: {
    marginHorizontal: 20,
    padding: 16,
  },
  measureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingVertical: 12,
  },
});