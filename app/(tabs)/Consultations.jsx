import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useRouter } from 'expo-router';
import { UserContext } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { Txt, Box, Card } from '../../components/UIComponents';
import Button from '../../components/shared/Button';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

export default function Consultations() {
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | past | all

  useEffect(() => {
    if (user?._id) {
      fetchConsultations();
    }
  }, [user]);

  const fetchConsultations = async () => {
    try {
      const result = await convex.query(api.Consultations.getUserConsultations, {
        userId: user._id,
      });
      
      // Sort by date (newest first)
      const sorted = (result || []).sort((a, b) => {
        const dateA = moment(a.slot?.date, 'DD/MM/YYYY');
        const dateB = moment(b.slot?.date, 'DD/MM/YYYY');
        return dateB - dateA;
      });
      
      setConsultations(sorted);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConsultations();
    setRefreshing(false);
  }, [user]);

  // Filter consultations based on active tab
  const filteredConsultations = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return consultations.filter(c => 
          c.status === 'confirmed' || c.status === 'upcoming' || c.status === 'pending'
        );
      case 'past':
        return consultations.filter(c => 
          c.status === 'completed' || c.status === 'cancelled'
        );
      default:
        return consultations;
    }
  }, [consultations, activeTab]);

  // Stats calculations
  const stats = useMemo(() => {
    const upcoming = consultations.filter(c => 
      c.status === 'confirmed' || c.status === 'upcoming'
    ).length;
    const completed = consultations.filter(c => c.status === 'completed').length;
    const cancelled = consultations.filter(c => c.status === 'cancelled').length;
    const total = consultations.length;

    return { upcoming, completed, cancelled, total };
  }, [consultations]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return theme.colors.primary;
      case 'upcoming': return theme.colors.blue;
      case 'pending': return theme.colors.warning;
      case 'completed': return theme.colors.accent || theme.colors.GREEN;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'calendar';
      case 'upcoming': return 'calendar-outline';
      case 'pending': return 'time';
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      default: return 'ellipse';
    }
  };

  const getStatusBg = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return theme.colors.primary + '15';
      case 'upcoming': return theme.colors.blue + '15';
      case 'pending': return theme.colors.warning + '15';
      case 'completed': return (theme.colors.accent || theme.colors.GREEN) + '15';
      case 'cancelled': return theme.colors.error + '15';
      default: return theme.colors.inputBg;
    }
  };

  const tabOptions = [
    { key: 'upcoming', label: 'Upcoming', count: stats.upcoming, icon: 'calendar' },
    { key: 'past', label: 'Past', count: stats.completed, icon: 'checkmark-circle' },
    { key: 'all', label: 'All', count: stats.total, icon: 'list' },
  ];

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading consultations...
        </Txt>
      </Box>
    );
  }

  const renderConsultation = ({ item, index }) => {
    const consultationDate = moment(item?.slot?.date, 'DD/MM/YYYY');
    const isPast = consultationDate.isBefore(moment(), 'day');
    const statusColor = getStatusColor(item.status);
    const statusBg = getStatusBg(item.status);

    return (
      <TouchableOpacity
        style={[styles.consultationCard, { 
          backgroundColor: theme.colors.card,
          borderLeftColor: statusColor,
          ...theme.shadows.small,
        }]}
        onPress={() => router.push(`/consultancy/details/${item._id}`)}
        activeOpacity={0.7}
      >
        {/* Nutritionist Info */}
        <View style={styles.nutritionistRow}>
          <View style={[styles.nutritionistAvatar, { backgroundColor: theme.colors.primary }]}>
            <Txt size={theme.fontSize.md} bold color={theme.colors.white}>
              {item?.nutritionist?.user?.name?.charAt(0)?.toUpperCase() || 'N'}
            </Txt>
          </View>
          
          <View style={{ flex: 1 }}>
            <Txt size={theme.fontSize.md} bold color={theme.colors.text} numberOfLines={1}>
              {item?.nutritionist?.user?.name || 'Nutritionist'}
            </Txt>
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              {item?.nutritionist?.degree || 'Nutrition Expert'}
            </Txt>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { 
            backgroundColor: statusBg,
            borderColor: statusColor + '40',
          }]}>
            <Ionicons name={getStatusIcon(item.status)} size={12} color={statusColor} />
            <Txt size={10} bold color={statusColor} style={{ textTransform: 'capitalize' }}>
              {item.status}
            </Txt>
          </View>
        </View>

        {/* Consultation Details */}
        <View style={[styles.detailsRow, { backgroundColor: theme.colors.inputBg }]}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              {item?.slot?.date || 'N/A'}
            </Txt>
          </View>

          <View style={[styles.detailDivider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              {item?.slot?.time || 'N/A'}
            </Txt>
          </View>

          <View style={[styles.detailDivider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.detailItem}>
            <Ionicons 
              name={item?.consultationType === 'online' ? 'videocam-outline' : 'people-outline'} 
              size={14} 
              color={theme.colors.textSecondary} 
            />
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              {item?.consultationType === 'online' ? 'Online' : 'In-Person'}
            </Txt>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {item.status === 'confirmed' || item.status === 'upcoming' ? (
            <>
              {item?.meetLink && item.consultationType === 'online' && (
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.colors.primary + '15' }]}
                  onPress={() => Linking.openURL(item.meetLink)}
                >
                  <Ionicons name="videocam" size={14} color={theme.colors.primary} />
                  <Txt size={theme.fontSize.xs} color={theme.colors.primary}>Join</Txt>
                </TouchableOpacity>
              )}
            </>
          ) : item.status === 'completed' && item.expertDietPlan ? (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: (theme.colors.accent || theme.colors.GREEN) + '15' }]}
              onPress={() => router.push(`/consultancy/plan/${item._id}`)}
            >
              <Ionicons name="document-text" size={14} color={theme.colors.accent || theme.colors.GREEN} />
              <Txt size={theme.fontSize.xs} color={theme.colors.accent || theme.colors.GREEN}>View Plan</Txt>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.inputBg }]}
            onPress={() => router.push(`/consultancy/details/${item._id}`)}
          >
            <Ionicons name="information-circle-outline" size={14} color={theme.colors.textSecondary} />
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Details</Txt>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
          My Consultations
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
          Track your nutritionist appointments
        </Txt>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          {[
            { label: 'Upcoming', value: stats.upcoming, icon: 'calendar', color: theme.colors.primary },
            { label: 'Completed', value: stats.completed, icon: 'checkmark-circle', color: theme.colors.accent || theme.colors.GREEN },
            { label: 'Cancelled', value: stats.cancelled, icon: 'close-circle', color: theme.colors.error },
            { label: 'Total', value: stats.total, icon: 'list', color: theme.colors.textSecondary },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon} size={14} color={stat.color} />
              </View>
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
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
      <View style={styles.tabsContainer}>
        {tabOptions.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, {
              backgroundColor: activeTab === tab.key 
                ? theme.colors.primary 
                : theme.colors.inputBg,
              borderColor: activeTab === tab.key 
                ? theme.colors.primary 
                : theme.colors.border,
            }]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={tab.icon} 
              size={14} 
              color={activeTab === tab.key ? theme.colors.white : theme.colors.textSecondary} 
            />
            <Txt 
              size={theme.fontSize.xs} 
              bold 
              color={activeTab === tab.key ? theme.colors.white : theme.colors.textSecondary}
            >
              {tab.label}
            </Txt>
            {tab.count > 0 && (
              <View style={[styles.tabCount, {
                backgroundColor: activeTab === tab.key 
                  ? 'rgba(255,255,255,0.3)' 
                  : theme.colors.primaryLight,
              }]}>
                <Txt 
                  size={9} 
                  bold 
                  color={activeTab === tab.key ? theme.colors.white : theme.colors.primary}
                >
                  {tab.count}
                </Txt>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {/* Consultations List */}
        {filteredConsultations.length === 0 ? (
          <Card style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="calendar-blank" 
              size={48} 
              color={theme.colors.textSecondary} 
            />
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text} style={{ marginTop: 12 }}>
              {activeTab === 'upcoming' 
                ? 'No Upcoming Consultations' 
                : activeTab === 'past' 
                  ? 'No Past Consultations' 
                  : 'No Consultations Yet'}
            </Txt>
            <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
              {activeTab === 'upcoming'
                ? 'Book a consultation with a nutritionist to get started'
                : activeTab === 'past'
                  ? 'Your completed consultations will appear here'
                  : 'Start your health journey with a professional nutritionist'}
            </Txt>
            {activeTab === 'upcoming' && (
              <Button
                title="Find a Nutritionist"
                onPress={() => router.push('/consultancy')}
                style={{ marginTop: 16, width: '70%' }}
              />
            )}
          </Card>
        ) : (
          <FlatList
            data={filteredConsultations}
            renderItem={renderConsultation}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 12 }}
          />
        )}

        {/* Book New Consultation Button */}
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <Button
            title="Book New Consultation"
            onPress={() => router.push('/consultancy')}
          />
        </View>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  tabCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  content: {
    padding: 16,
    paddingTop: 4,
  },
  consultationCard: {
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    gap: 12,
  },
  nutritionistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nutritionistAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  detailDivider: {
    width: 1,
    height: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
  },
});