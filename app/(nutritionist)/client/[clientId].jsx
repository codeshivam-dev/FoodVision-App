import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserContext } from '../../../context/UserContext';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../components/UIComponents';
import { Ionicons } from '@expo/vector-icons';

export default function ClientProfile() {
  const { clientId } = useLocalSearchParams();
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [client, setClient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'nutritionist') {
      router.replace('/(tabs)');
      return;
    }
    getClientData();
  }, [clientId, user]);

  const getClientData = async () => {
    try {
      const nutritionists = await convex.query(api.Nutritionists.getAllNutritionists);
      const nutri = nutritionists.find(n => n.userId === user._id);

      if (nutri) {
        const allConsultations = await convex.query(
          api.Consultations.getNutritionistConsultations,
          { nutritionistId: nutri._id }
        );

        const clientConsultations = allConsultations.filter(
          c => c.user._id === clientId
        );

        // Sort by date (newest first)
        clientConsultations.sort((a, b) => 
          new Date(b.slot?.date) - new Date(a.slot?.date)
        );

        setConsultations(clientConsultations);

        if (clientConsultations.length > 0) {
          setClient(clientConsultations[0].user);
        }
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate client stats
  const clientStats = useMemo(() => {
    const completed = consultations.filter(c => c.status === 'completed').length;
    const upcoming = consultations.filter(c => 
      c.status === 'confirmed' || c.status === 'upcoming'
    ).length;
    const hasPlan = consultations.some(c => c.expertDietPlan);
    const latestConsultation = consultations[0];

    return {
      totalSessions: consultations.length,
      completedSessions: completed,
      upcomingSessions: upcoming,
      hasDietPlan: hasPlan,
      lastConsultationDate: latestConsultation?.slot?.date || null,
      lastConsultationStatus: latestConsultation?.status || null,
    };
  }, [consultations]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return theme.colors.accent || theme.colors.GREEN;
      case 'confirmed': return theme.colors.primary;
      case 'pending': return theme.colors.warning;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'checkmark-circle';
      case 'confirmed': return 'calendar';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'ellipse';
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading client profile...
        </Txt>
      </Box>
    );
  }

  // Not found state
  if (!client) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="person-outline" size={48} color={theme.colors.textSecondary} />
        <Txt bold color={theme.colors.text} style={{ marginTop: 12 }}>
          Client Not Found
        </Txt>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: theme.colors.primary }]}
        >
          <Txt color={theme.colors.primary}>Go Back</Txt>
        </TouchableOpacity>
      </Box>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* Client Header */}
      <Box style={[styles.header, { 
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.divider,
      }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backArrow}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.clientHeaderContent}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Txt size={theme.fontSize.xl} bold color={theme.colors.white}>
              {client?.name?.charAt(0)?.toUpperCase() || '?'}
            </Txt>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
              {client?.name || 'Unknown Client'}
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
              {client?.email || 'No email'}
            </Txt>
          </View>
        </View>

        {/* Client Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Sessions', value: clientStats.totalSessions, icon: 'calendar' },
            { label: 'Completed', value: clientStats.completedSessions, icon: 'checkmark-circle', color: theme.colors.accent || theme.colors.GREEN },
            { label: 'Upcoming', value: clientStats.upcomingSessions, icon: 'time', color: theme.colors.primary },
            { label: 'Diet Plan', value: clientStats.hasDietPlan ? 'Yes' : 'No', icon: 'document-text', color: clientStats.hasDietPlan ? theme.colors.accent || theme.colors.GREEN : theme.colors.textSecondary },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statItem, { 
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.border,
            }]}>
              <Ionicons name={stat.icon} size={16} color={stat.color || theme.colors.textSecondary} />
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                {stat.value}
              </Txt>
              <Txt size={10} color={theme.colors.textSecondary}>
                {stat.label}
              </Txt>
            </View>
          ))}
        </View>

        {/* Client Info */}
        {client?.preferences && (
          <View style={[styles.infoBar, { 
            backgroundColor: theme.colors.primaryLight,
            borderColor: theme.colors.primary + '30',
          }]}>
            <Ionicons name="information-circle" size={16} color={theme.colors.primary} />
            <Txt size={theme.fontSize.xs} color={theme.colors.primary} style={{ flex: 1 }}>
              {client.preferences?.goal && `Goal: ${client.preferences.goal}`}
              {client.preferences?.weight && ` • Weight: ${client.preferences.weight}kg`}
            </Txt>
          </View>
        )}
      </Box>

      <View style={styles.content}>
        {/* Action Buttons */}
        {clientStats.upcomingSessions > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              const upcoming = consultations.find(c => 
                c.status === 'confirmed' || c.status === 'upcoming'
              );
              if (upcoming) {
                router.push(`/consultation/${upcoming._id}/start`);
              }
            }}
          >
            <Ionicons name="play-circle" size={20} color={theme.colors.white} />
            <Txt size={theme.fontSize.md} bold color={theme.colors.white}>
              Start Next Session
            </Txt>
          </TouchableOpacity>
        )}

        {/* Consultation History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                Consultation History
              </Txt>
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                {consultations.length} {consultations.length === 1 ? 'session' : 'sessions'} total
              </Txt>
            </View>
          </View>

          {consultations.length === 0 ? (
            <Card style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={40} color={theme.colors.textSecondary} />
              <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
                No consultations yet
              </Txt>
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                Schedule a consultation to get started
              </Txt>
            </Card>
          ) : (
            consultations.map((item, index) => (
              <TouchableOpacity
                key={item._id}
                style={[styles.consultationCard, { 
                  backgroundColor: theme.colors.card,
                  borderLeftColor: getStatusColor(item.status),
                  ...theme.shadows.small,
                }]}
                onPress={() => router.push(`/consultation/${item._id}/start`)}
                activeOpacity={0.7}
              >
                <View style={styles.consultationHeader}>
                  {/* Date & Time */}
                  <View style={{ flex: 1 }}>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                      <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                        {item?.slot?.date || 'N/A'}
                      </Txt>
                    </View>
                    <View style={styles.dateRow}>
                      <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                      <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
                        {item?.slot?.time || 'N/A'}
                      </Txt>
                    </View>
                  </View>

                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { 
                    backgroundColor: getStatusColor(item.status) + '20',
                    borderColor: getStatusColor(item.status) + '40',
                  }]}>
                    <Ionicons 
                      name={getStatusIcon(item.status)} 
                      size={12} 
                      color={getStatusColor(item.status)} 
                    />
                    <Txt 
                      size={10} 
                      bold 
                      color={getStatusColor(item.status)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {item.status || 'Unknown'}
                    </Txt>
                  </View>
                </View>

                {/* Consultation Details */}
                <View style={styles.consultationDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons 
                      name={item?.consultationType === 'online' ? 'videocam' : 'people'} 
                      size={13} 
                      color={theme.colors.textSecondary} 
                    />
                    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                      {item?.consultationType === 'online' ? 'Online' : 'In-Person'}
                    </Txt>
                  </View>

                  {item?.preConsultationForm && (
                    <View style={styles.detailItem}>
                      <Ionicons name="document-text" size={13} color={theme.colors.primary} />
                      <Txt size={theme.fontSize.xs} color={theme.colors.primary}>
                        Form submitted
                      </Txt>
                    </View>
                  )}

                  {item?.expertDietPlan && (
                    <View style={styles.detailItem}>
                      <Ionicons name="nutrition" size={13} color={theme.colors.accent || theme.colors.GREEN} />
                      <Txt size={theme.fontSize.xs} color={theme.colors.accent || theme.colors.GREEN}>
                        Plan created
                      </Txt>
                    </View>
                  )}
                </View>

                {/* Arrow */}
                <View style={styles.arrowRight}>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))
          )}
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
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  header: {
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
  },
  backArrow: {
    marginBottom: 12,
    padding: 4,
  },
  clientHeaderContent: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  content: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consultationCard: {
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    gap: 10,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  consultationDetails: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowRight: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
});