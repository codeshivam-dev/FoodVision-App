import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter } from 'expo-router';
import { UserContext } from '../../../context/UserContext';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box } from '../../../components/UIComponents';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Plans() {
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, recent, pending

  useEffect(() => {
    if (user?.role === 'nutritionist') {
      getPlans();
    }
  }, [user]);

  const getPlans = async () => {
    try {
      const nutritionists = await convex.query(api.Nutritionists.getAllNutritionists);
      const nutri = nutritionists.find(n => n.userId === user._id);
      
      if (nutri) {
        const consultations = await convex.query(
          api.Consultations.getNutritionistConsultations,
          { nutritionistId: nutri._id }
        );

        const planPromises = consultations.map(async (c) => {
          try {
            const plan = await convex.query(api.ExpertDietPlans.getExpertDietPlan, {
              consultationId: c._id,
            });
            return plan ? { ...plan, consultation: c } : null;
          } catch (error) {
            return null;
          }
        });

        const results = await Promise.all(planPromises);
        const validPlans = results.filter(p => p);
        
        // Sort by date (newest first)
        validPlans.sort((a, b) => 
          new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        
        setPlans(validPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getPlans();
    setRefreshing(false);
  }, [user]);

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    if (selectedFilter === 'recent') {
      const daysDiff = (new Date() - new Date(plan.publishedAt)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }
    if (selectedFilter === 'pending') {
      return plan.consultation?.status === 'completed' && plan.meals?.length === 0;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: plans.length,
    thisWeek: plans.filter(p => {
      const daysDiff = (new Date() - new Date(p.publishedAt)) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length,
    totalMeals: plans.reduce((sum, p) => sum + (p.meals?.length || 0), 0),
    activeClients: [...new Set(plans.map(p => p.consultation?.user?._id))].length,
  };

  const filterOptions = [
    { key: 'all', label: 'All Plans' },
    { key: 'recent', label: 'This Week' },
    { key: 'pending', label: 'Drafts' },
  ];

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading plans...
        </Txt>
      </Box>
    );
  }

  const renderPlan = ({ item, index }) => {
    const mealCount = item?.meals?.length || 0;
    const clientName = item?.consultation?.user?.name || 'Unknown Client';
    const publishedDate = item?.publishedAt 
      ? new Date(item.publishedAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      : 'N/A';
    
    // Calculate total calories
    const totalCalories = item?.meals?.reduce((sum, meal) => 
      sum + (meal.calories || 0), 0
    ) || 0;

    return (
      <TouchableOpacity
        style={[styles.planCard, { 
          backgroundColor: theme.colors.card,
          borderLeftColor: mealCount > 0 
            ? theme.colors.accent || theme.colors.GREEN 
            : theme.colors.warning,
          ...theme.shadows.small,
        }]}
        onPress={() => router.push(`/consultation/${item.consultationId}/plan`)}
        activeOpacity={0.7}
      >
        {/* Plan Header */}
        <View style={styles.planHeader}>
          <View style={[styles.clientAvatar, { backgroundColor: theme.colors.primary }]}>
            <Txt size={theme.fontSize.md} bold color={theme.colors.white}>
              {clientName.charAt(0).toUpperCase()}
            </Txt>
          </View>

          <View style={{ flex: 1 }}>
            <Txt size={theme.fontSize.md} bold color={theme.colors.text} numberOfLines={1}>
              {clientName}
            </Txt>
            <View style={styles.planMeta}>
              <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                {publishedDate}
              </Txt>
            </View>
          </View>

          {/* Meal Count Badge */}
          <View style={[styles.mealBadge, { 
            backgroundColor: mealCount > 0 
              ? (theme.colors.accent || theme.colors.GREEN) + '20' 
              : theme.colors.warning + '20'
          }]}>
            <MaterialCommunityIcons 
              name="food-apple" 
              size={14} 
              color={mealCount > 0 ? theme.colors.accent || theme.colors.GREEN : theme.colors.warning} 
            />
            <Txt 
              size={theme.fontSize.sm} 
              bold 
              color={mealCount > 0 ? theme.colors.accent || theme.colors.GREEN : theme.colors.warning}
            >
              {mealCount}
            </Txt>
          </View>
        </View>

        {/* Plan Stats */}
        {mealCount > 0 && (
          <View style={[styles.planStats, { backgroundColor: theme.colors.inputBg }]}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="fire" size={14} color="#FF6B6B" />
              <Txt size={theme.fontSize.xs} color={theme.colors.text}>
                {totalCalories} kcal
              </Txt>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="restaurant-outline" size={14} color={theme.colors.textSecondary} />
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                {mealCount} meals
              </Txt>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color={theme.colors.accent || theme.colors.GREEN} />
              <Txt size={theme.fontSize.xs} color={theme.colors.accent || theme.colors.GREEN}>
                Active
              </Txt>
            </View>
          </View>
        )}

        {/* Empty Plan Message */}
        {mealCount === 0 && (
          <View style={[styles.emptyPlan, { backgroundColor: theme.colors.warning + '10' }]}>
            <Ionicons name="alert-circle-outline" size={14} color={theme.colors.warning} />
            <Txt size={theme.fontSize.xs} color={theme.colors.warning}>
              No meals added yet - Tap to create
            </Txt>
          </View>
        )}

        {/* Arrow */}
        <View style={styles.arrowIcon}>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Box style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Box style={[styles.header, { 
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.divider,
      }]}>
        <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
          Diet Plans
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
          Manage your client meal plans
        </Txt>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total Plans', value: stats.total, icon: 'document-text' },
            { label: 'This Week', value: stats.thisWeek, icon: 'calendar' },
            { label: 'Meals', value: stats.totalMeals, icon: 'restaurant' },
            { label: 'Clients', value: stats.activeClients, icon: 'people' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statBox}>
              <Ionicons name={stat.icon} size={16} color={theme.colors.primary} />
              <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                {stat.value}
              </Txt>
              <Txt size={9} color={theme.colors.textSecondary}>
                {stat.label}
              </Txt>
            </View>
          ))}
        </View>
      </Box>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterTab, {
              backgroundColor: selectedFilter === option.key 
                ? theme.colors.primary 
                : theme.colors.inputBg,
              borderColor: selectedFilter === option.key 
                ? theme.colors.primary 
                : theme.colors.border,
            }]}
            onPress={() => setSelectedFilter(option.key)}
            activeOpacity={0.7}
          >
            <Txt 
              size={theme.fontSize.xs} 
              bold 
              color={selectedFilter === option.key 
                ? theme.colors.white 
                : theme.colors.textSecondary}
            >
              {option.label}
            </Txt>
          </TouchableOpacity>
        ))}
      </View>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="clipboard-text-outline" 
            size={48} 
            color={theme.colors.textSecondary} 
          />
          <Txt size={theme.fontSize.lg} bold color={theme.colors.text} style={{ marginTop: 16 }}>
            No Plans Found
          </Txt>
          <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
            {selectedFilter === 'all' 
              ? 'Create your first diet plan for a client'
              : selectedFilter === 'recent'
                ? 'No plans created this week'
                : 'No draft plans pending'}
          </Txt>
        </View>
      ) : (
        <FlatList
          data={filteredPlans}
          renderItem={renderPlan}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      )}
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
  header: {
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingBottom: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  planCard: {
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    gap: 10,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  mealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderRadius: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyPlan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
  },
  arrowIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});