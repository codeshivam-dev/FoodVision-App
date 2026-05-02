import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter } from 'expo-router';
import { UserContext } from '../../../context/UserContext';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../components/UIComponents';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Clients() {
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.role === 'nutritionist') {
      getConsultations();
    }
  }, [user]);

  const getConsultations = async () => {
    try {
      const nutritionists = await convex.query(api.Nutritionists.getAllNutritionists);
      const nutri = nutritionists.find(n => n.userId === user._id);
      
      if (nutri) {
        const result = await convex.query(api.Consultations.getNutritionistConsultations, {
          nutritionistId: nutri._id,
        });

        // Get unique clients with their latest consultation
        const uniqueUsers = [];
        const seen = new Set();
        const clientStats = {};

        result.forEach(c => {
          const clientId = c.user._id;
          
          // Track client stats
          if (!clientStats[clientId]) {
            clientStats[clientId] = {
              totalConsultations: 0,
              completedConsultations: 0,
              upcomingConsultations: 0,
              lastConsultation: null,
            };
          }
          
          clientStats[clientId].totalConsultations++;
          
          if (c.status === 'completed') {
            clientStats[clientId].completedConsultations++;
          } else if (c.status === 'confirmed' || c.status === 'upcoming') {
            clientStats[clientId].upcomingConsultations++;
          }
          
          if (!clientStats[clientId].lastConsultation || 
              new Date(c.slot?.date) > new Date(clientStats[clientId].lastConsultation?.slot?.date)) {
            clientStats[clientId].lastConsultation = c;
          }

          // Add unique client
          if (!seen.has(clientId)) {
            seen.add(clientId);
            uniqueUsers.push({
              ...c,
              stats: clientStats[clientId],
            });
          }
        });

        setConsultations(uniqueUsers);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getConsultations();
    setRefreshing(false);
  }, [user]);

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return consultations;
    
    const query = searchQuery.toLowerCase().trim();
    return consultations.filter(client => 
      client?.user?.name?.toLowerCase().includes(query) ||
      client?.user?.email?.toLowerCase().includes(query)
    );
  }, [consultations, searchQuery]);

  // Sort clients: upcoming first, then alphabetical
  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      // Clients with upcoming consultations first
      if (a.stats?.upcomingConsultations > 0 && b.stats?.upcomingConsultations === 0) return -1;
      if (a.stats?.upcomingConsultations === 0 && b.stats?.upcomingConsultations > 0) return 1;
      
      // Then sort by name
      return (a.user?.name || '').localeCompare(b.user?.name || '');
    });
  }, [filteredClients]);

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading clients...
        </Txt>
      </Box>
    );
  }

  const renderClient = ({ item, index }) => {
    const initial = item?.user?.name?.charAt(0)?.toUpperCase() || '?';
    const hasUpcoming = item.stats?.upcomingConsultations > 0;
    const totalSessions = item.stats?.totalConsultations || 0;

    return (
      <TouchableOpacity
        style={[styles.clientCard, { 
          backgroundColor: theme.colors.card,
          borderLeftColor: hasUpcoming 
            ? theme.colors.primary 
            : theme.colors.textSecondary,
          ...theme.shadows.small,
        }]}
        onPress={() => router.push(`/client/${item.user._id}`)}
        activeOpacity={0.7}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Txt size={theme.fontSize.lg} bold color={theme.colors.white}>
              {initial}
            </Txt>
          </View>
          
          {/* Upcoming indicator */}
          {hasUpcoming && (
            <View style={[styles.upcomingDot, { backgroundColor: theme.colors.accent || theme.colors.GREEN }]} />
          )}
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <View style={styles.nameRow}>
            <Txt size={theme.fontSize.md} bold color={theme.colors.text} numberOfLines={1}>
              {item?.user?.name || 'Unknown Client'}
            </Txt>
            
            {hasUpcoming && (
              <View style={[styles.upcomingBadge, { backgroundColor: theme.colors.primaryLight }]}>
                <Txt size={10} bold color={theme.colors.primary}>
                  Upcoming
                </Txt>
              </View>
            )}
          </View>

          <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary} numberOfLines={1}>
            {item?.user?.email || 'No email'}
          </Txt>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
              <Txt size={11} color={theme.colors.textSecondary}>
                {totalSessions} {totalSessions === 1 ? 'session' : 'sessions'}
              </Txt>
            </View>

            {item.stats?.completedConsultations > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle-outline" size={12} color={theme.colors.accent || theme.colors.GREEN} />
                <Txt size={11} color={theme.colors.accent || theme.colors.GREEN}>
                  {item.stats.completedConsultations} completed
                </Txt>
              </View>
            )}
          </View>

          {/* Last Consultation Date */}
          {item.stats?.lastConsultation && (
            <View style={styles.lastConsultRow}>
              <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
              <Txt size={11} color={theme.colors.textSecondary}>
                Last: {item.stats.lastConsultation?.slot?.date || 'N/A'}
              </Txt>
            </View>
          )}
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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
          My Clients
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
          {consultations.length} {consultations.length === 1 ? 'client' : 'clients'} under your care
        </Txt>

        {/* Search Bar */}
        {consultations.length > 0 && (
          <View style={[styles.searchBar, { 
            backgroundColor: theme.colors.inputBg,
            borderColor: theme.colors.inputBorder,
          }]}>
            <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} />
            <TextInput
              placeholder="Search clients by name or email..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: theme.colors.text }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </Box>

      {/* Clients List */}
      {sortedClients.length === 0 ? (
        <View style={styles.emptyContainer}>
          {searchQuery ? (
            <>
              <Ionicons name="search-outline" size={48} color={theme.colors.textSecondary} />
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text} style={{ marginTop: 16 }}>
                No Results Found
              </Txt>
              <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
                No clients match "{searchQuery}"
              </Txt>
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={[styles.clearButton, { borderColor: theme.colors.primary }]}
              >
                <Txt size={theme.fontSize.sm} color={theme.colors.primary}>Clear Search</Txt>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="account-group-outline" size={48} color={theme.colors.textSecondary} />
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text} style={{ marginTop: 16 }}>
                No Clients Yet
              </Txt>
              <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
                Once consultations are booked, your clients will appear here
              </Txt>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={sortedClients}
          renderItem={renderClient}
          keyExtractor={(item) => item.user._id}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  listContent: {
    padding: 16,
    paddingTop: 12,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    gap: 12,
  },
  avatarSection: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  clientInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upcomingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  lastConsultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  arrowContainer: {
    paddingLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});