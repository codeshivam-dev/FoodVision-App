import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter } from 'expo-router';
import { UserContext } from '../../../context/UserContext';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../components/UIComponents';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({
    todayConsultations: 0,
    totalClients: 0,
    pendingPlans: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nutritionistProfile, setNutritionistProfile] = useState(null);

  useEffect(() => {
    if (user?.role === 'nutritionist') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const nutritionists = await convex.query(
        api.Nutritionists.getAllNutritionists
      );
      const nutri = nutritionists.find(n => n.userId === user._id);

      if (nutri) {
        setNutritionistProfile(nutri);

        const result = await convex.query(
          api.Consultations.getNutritionistConsultations,
          { nutritionistId: nutri._id }
        );

        // Filter consultations by status
        const allConsultations = result || [];
        const upcoming = allConsultations.filter(c => 
          c.status === 'confirmed' || c.status === 'pending' || c.status === 'upcoming'
        );
        const completedToday = allConsultations.filter(c => 
          c.status === 'completed'
        );

        setConsultations(upcoming);

        // Calculate stats
        setStats({
          todayConsultations: upcoming.length,
          totalClients: [...new Set(allConsultations.map(c => c.user?._id))].length,
          pendingPlans: allConsultations.filter(c => 
            c.status === 'completed' && !c.expertDietPlan
          ).length,
          completedToday: completedToday.length,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [user]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return theme.colors.primary;
      case 'pending': return theme.colors.warning;
      case 'upcoming': return theme.colors.blue;
      case 'completed': return theme.colors.accent || theme.colors.GREEN;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'upcoming': return 'calendar';
      default: return 'ellipse';
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading dashboard...
        </Txt>
      </Box>
    );
  }

  // Stats cards data
  const statCards = [
    {
      label: 'Upcoming',
      value: stats.todayConsultations,
      icon: <Ionicons name="calendar" size={22} color={theme.colors.primary} />,
      bgColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary + '30',
    },
    {
      label: 'Total Clients',
      value: stats.totalClients,
      icon: <Ionicons name="people" size={22} color={theme.colors.blue} />,
      bgColor: theme.colors.blue + '15',
      borderColor: theme.colors.blue + '30',
    },
    {
      label: 'Pending Plans',
      value: stats.pendingPlans,
      icon: <Ionicons name="document-text" size={22} color={theme.colors.warning} />,
      bgColor: theme.colors.warning + '15',
      borderColor: theme.colors.warning + '30',
    },
    {
      label: 'Completed',
      value: stats.completedToday,
      icon: <Ionicons name="checkmark-done" size={22} color={theme.colors.accent || theme.colors.GREEN} />,
      bgColor: (theme.colors.accent || theme.colors.GREEN) + '15',
      borderColor: (theme.colors.accent || theme.colors.GREEN) + '30',
    },
  ];

  const renderConsultation = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.consultationCard, { 
        backgroundColor: theme.colors.card,
        borderLeftColor: index % 2 === 0 
          ? theme.colors.primary 
          : theme.colors.accent || theme.colors.GREEN,
        ...theme.shadows.small,
      }]}
      onPress={() => router.push(`/consultancy/consultation/${item._id}/start`)}
      activeOpacity={0.7}
    >
      {/* Client Avatar & Info */}
      <View style={styles.clientInfo}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Txt size={theme.fontSize.lg} bold color={theme.colors.white}>
            {item?.user?.name?.charAt(0)?.toUpperCase() || '?'}
          </Txt>
        </View>

        <View style={{ flex: 1 }}>
          <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
            {item?.user?.name || 'Unknown Client'}
          </Txt>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              {item?.slot?.date || 'N/A'}
            </Txt>
            <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              {item?.slot?.time || 'N/A'}
            </Txt>
          </View>
        </View>
      </View>

      {/* Status & Type Badges */}
      <View style={styles.badgesRow}>
        <View style={[styles.statusBadge, { 
          backgroundColor: getStatusColor(item?.status) + '20',
          borderColor: getStatusColor(item?.status) + '40',
        }]}>
          <Ionicons 
            name={getStatusIcon(item?.status)} 
            size={12} 
            color={getStatusColor(item?.status)} 
          />
          <Txt 
            size={10} 
            bold 
            color={getStatusColor(item?.status)}
            style={{ textTransform: 'capitalize' }}
          >
            {item?.status || 'Unknown'}
          </Txt>
        </View>

        <View style={[styles.typeBadge, {
          backgroundColor: item?.consultationType === 'online' 
            ? theme.colors.blue + '20' 
            : (theme.colors.accent || theme.colors.GREEN) + '20',
          borderColor: item?.consultationType === 'online' 
            ? theme.colors.blue + '40' 
            : (theme.colors.accent || theme.colors.GREEN) + '40',
        }]}>
          <Ionicons 
            name={item?.consultationType === 'online' ? 'videocam' : 'people'} 
            size={12} 
            color={item?.consultationType === 'online' ? theme.colors.blue : theme.colors.accent || theme.colors.GREEN} 
          />
          <Txt 
            size={10} 
            bold 
            color={item?.consultationType === 'online' ? theme.colors.blue : theme.colors.accent || theme.colors.GREEN}
          >
            {item?.consultationType === 'online' ? 'Online' : 'In-Person'}
          </Txt>
        </View>

        {/* Has Pre-Consultation Form */}
        {item?.preConsultationForm && (
          <View style={[styles.formBadge, { 
            backgroundColor: theme.colors.primaryLight,
            borderColor: theme.colors.primary + '40',
          }]}>
            <Ionicons name="document-text" size={12} color={theme.colors.primary} />
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push(`/consultancy/consultation/${item._id}/start`)}
        >
          <Txt size={theme.fontSize.xs} bold color={theme.colors.white}>
            Start Session
          </Txt>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: theme.colors.inputBg,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }]}
          onPress={() => router.push(`/client/${item?.user?._id}`)}
        >
          <Txt size={theme.fontSize.xs} bold color={theme.colors.text}>
            View Client
          </Txt>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              Welcome back,
            </Txt>
            <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
              Dr. {user?.name || 'Nutritionist'}
            </Txt>
          </View>
          
          {/* Today's Date */}
          <View style={[styles.dateBadge, { backgroundColor: theme.colors.primaryLight }]}>
            <Txt size={theme.fontSize.xs} color={theme.colors.primary}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Txt>
          </View>
        </View>
      </Box>

      <View style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <View 
              key={stat.label}
              style={[styles.statCard, { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                ...theme.shadows.small,
              }]}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.bgColor }]}>
                {stat.icon}
              </View>
              <Txt size={theme.fontSize.xl} bold color={theme.colors.text}>
                {stat.value}
              </Txt>
              <Txt size={11} color={theme.colors.textSecondary}>
                {stat.label}
              </Txt>
            </View>
          ))}
        </View>

        {/* Consultations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                Upcoming Consultations
              </Txt>
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                Manage your client sessions
              </Txt>
            </View>
            
            {consultations.length > 0 && (
              <View style={[styles.countBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Txt size={theme.fontSize.xs} bold color={theme.colors.primary}>
                  {consultations.length}
                </Txt>
              </View>
            )}
          </View>

          {consultations.length === 0 ? (
            <Card style={styles.emptyState}>
              <MaterialCommunityIcons 
                name="calendar-blank" 
                size={40} 
                color={theme.colors.textSecondary} 
              />
              <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
                No upcoming consultations
              </Txt>
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                New bookings will appear here
              </Txt>
            </Card>
          ) : (
            <FlatList
              data={consultations}
              renderItem={renderConsultation}
              keyExtractor={item => item._id}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 12 }}
            />
          )}
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity 
            style={[styles.quickLink, { backgroundColor: theme.colors.card, ...theme.shadows.small }]}
            onPress={() => router.push('/Clients')}
          >
            <Ionicons name="people" size={20} color={theme.colors.primary} />
            <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>All Clients</Txt>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickLink, { backgroundColor: theme.colors.card, ...theme.shadows.small }]}
            onPress={() => router.push('/Plans')}
          >
            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>Diet Plans</Txt>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickLink, { backgroundColor: theme.colors.card, ...theme.shadows.small }]}
            onPress={() => router.push('/Profile')}
          >
            <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
            <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>Settings</Txt>
          </TouchableOpacity>
        </View>

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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  consultationCard: {
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    gap: 10,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  formBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  quickLinks: {
    flexDirection: 'row',
    gap: 10,
  },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
});