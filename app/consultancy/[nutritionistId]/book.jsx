import { View, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserContext } from '../../../context/UserContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../components/UIComponents';
import Button from '../../../components/shared/Button';

export default function BookConsultation() {
  const { nutritionistId } = useLocalSearchParams();
  const convex = useConvex();
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { theme } = useTheme();
  
  const [profile, setProfile] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultationType, setConsultationType] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    getProfile();
  }, [nutritionistId]);

  const getProfile = async () => {
    try {
      const result = await convex.query(api.Nutritionists.getNutritionistProfile, { 
        nutritionistId 
      });
      setProfile(result);
      
      // Set default consultation type
      if (result?.consultationModes?.offline) {
        setConsultationType('offline');
      } else if (result?.consultationModes?.online) {
        setConsultationType('online');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBook = async () => {
    if (!selectedSlot) {
      Alert.alert(
        'Select a Slot',
        'Please choose a date and time for your consultation',
        [{ text: 'OK' }]
      );
      return;
    }

    setBooking(true);

    try {
      const consultationId = await convex.mutation(api.Consultations.createConsultation, {
        userId: user._id,
        nutritionistId,
        consultationType,
        slot: {
          date: selectedSlot.date,
          time: selectedSlot.time,
        },
      });

      router.replace(`/consultancy/confirmation/${consultationId}`);
    } catch (error) {
      Alert.alert(
        'Booking Failed',
        error.message || 'Unable to book consultation. Please try again.'
      );
    } finally {
      setBooking(false);
    }
  };

  const getNext7Days = () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Group slots by date
  const groupSlotsByDate = (slots) => {
    const grouped = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading available slots...
        </Txt>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Txt bold color={theme.colors.error} style={{ marginTop: 12 }}>
          Profile not found
        </Txt>
        <Button 
          title="Go Back" 
          variant="outline" 
          onPress={() => router.back()} 
          style={{ marginTop: 20, width: '60%' }} 
        />
      </Box>
    );
  }

  const next7Days = getNext7Days();
  const availableSlots = (profile.availableSlots || [])
    .filter(s => !s.isBooked && next7Days.includes(s.date));
  
  const groupedSlots = groupSlotsByDate(availableSlots);
  const datesWithSlots = Object.keys(groupedSlots).sort();

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Box style={[styles.header, { 
        backgroundColor: theme.colors.background,
        borderBottomColor: theme.colors.divider 
      }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIcon, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="calendar" size={28} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
              Book Consultation
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
              Select your preferred date and time
            </Txt>
          </View>
        </View>
      </Box>

      <View style={styles.content}>
        {/* Consultation Type */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="video-check" size={20} color={theme.colors.primary} />
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
              Consultation Type
            </Txt>
          </View>

          <View style={styles.typeRow}>
            <TouchableOpacity
              onPress={() => {
                setConsultationType('offline');
                setSelectedSlot(null);
              }}
              disabled={!profile?.consultationModes?.offline}
              style={[styles.typeCard, {
                backgroundColor: consultationType === 'offline' 
                  ? theme.colors.primary 
                  : theme.colors.inputBg,
                borderColor: consultationType === 'offline' 
                  ? theme.colors.primary 
                  : theme.colors.border,
                opacity: profile?.consultationModes?.offline ? 1 : 0.5,
              }]}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="people" 
                size={24} 
                color={consultationType === 'offline' ? theme.colors.white : theme.colors.textSecondary} 
              />
              <Txt 
                size={theme.fontSize.sm} 
                bold 
                color={consultationType === 'offline' ? theme.colors.white : theme.colors.textSecondary}
              >
                In-Person
              </Txt>
              {!profile?.consultationModes?.offline && (
                <Txt size={10} color={theme.colors.error}>Unavailable</Txt>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setConsultationType('online');
                setSelectedSlot(null);
              }}
              disabled={!profile?.consultationModes?.online}
              style={[styles.typeCard, {
                backgroundColor: consultationType === 'online' 
                  ? theme.colors.primary 
                  : theme.colors.inputBg,
                borderColor: consultationType === 'online' 
                  ? theme.colors.primary 
                  : theme.colors.border,
                opacity: profile?.consultationModes?.online ? 1 : 0.5,
              }]}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="videocam" 
                size={24} 
                color={consultationType === 'online' ? theme.colors.white : theme.colors.textSecondary} 
              />
              <Txt 
                size={theme.fontSize.sm} 
                bold 
                color={consultationType === 'online' ? theme.colors.white : theme.colors.textSecondary}
              >
                Online
              </Txt>
              {!profile?.consultationModes?.online && (
                <Txt size={10} color={theme.colors.error}>Unavailable</Txt>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* Selected Slot Preview */}
        {selectedSlot && (
          <Card style={[styles.selectedCard, { 
            backgroundColor: theme.colors.primaryLight,
            borderColor: theme.colors.primary + '30',
          }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Txt size={theme.fontSize.md} bold color={theme.colors.primary}>
                Selected Slot
              </Txt>
              <Txt size={theme.fontSize.sm} color={theme.colors.primary}>
                {new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })} at {selectedSlot.time}
              </Txt>
            </View>
            <TouchableOpacity onPress={() => setSelectedSlot(null)}>
              <Ionicons name="close-circle" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Book Button (Top) */}
        <Button 
          title={selectedSlot ? 'Confirm Booking' : 'Select a Slot to Continue'}
          onPress={handleBook}
          loading={booking}
          disabled={!selectedSlot}
        />

        {/* Available Slots */}
        <View style={{ marginTop: 24 }}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
              Available Slots
            </Txt>
            <View style={[styles.slotCountBadge, { backgroundColor: theme.colors.primaryLight }]}>
              <Txt size={theme.fontSize.xs} color={theme.colors.primary}>
                {availableSlots.length} slots
              </Txt>
            </View>
          </View>

          {availableSlots.length === 0 ? (
            <Card style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={40} color={theme.colors.textSecondary} />
              <Txt color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
                No available slots at the moment
              </Txt>
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                Please check back later
              </Txt>
            </Card>
          ) : (
            datesWithSlots.map((date) => (
              <View key={date} style={styles.dateGroup}>
                {/* Date Header */}
                <View style={[styles.dateHeader, { 
                  backgroundColor: theme.colors.inputBg,
                  borderColor: theme.colors.border,
                }]}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
                  <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Txt>
                  <View style={[styles.dayBadge, { backgroundColor: theme.colors.primaryLight }]}>
                    <Txt size={10} color={theme.colors.primary}>
                      {groupedSlots[date].length} slots
                    </Txt>
                  </View>
                </View>

                {/* Time Slots */}
                <View style={styles.timeSlots}>
                  {groupedSlots[date].map((slot, index) => {
                    const isSelected = selectedSlot?.date === slot.date && 
                                     selectedSlot?.time === slot.time;
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSelectSlot(slot)}
                        activeOpacity={0.7}
                        style={[styles.timeSlot, {
                          backgroundColor: isSelected 
                            ? theme.colors.primary 
                            : theme.colors.card,
                          borderColor: isSelected 
                            ? theme.colors.primary 
                            : theme.colors.border,
                        }]}
                      >
                        <Ionicons 
                          name="time-outline" 
                          size={14} 
                          color={isSelected ? theme.colors.white : theme.colors.textSecondary} 
                        />
                        <Txt 
                          size={theme.fontSize.sm} 
                          bold 
                          color={isSelected ? theme.colors.white : theme.colors.text}
                        >
                          {slot.time}
                        </Txt>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Book Button (Bottom) */}
        <View style={{ marginTop: 24, marginBottom: 40 }}>
          <Button 
            title={selectedSlot ? 'Confirm Booking' : 'Select a Slot Above'}
            onPress={handleBook}
            loading={booking}
            disabled={!selectedSlot}
          />
          <Txt 
            size={theme.fontSize.xs} 
            color={theme.colors.textSecondary}
            style={{ textAlign: 'center', marginTop: 8 }}
          >
            Consultation fee: ${profile?.consultationFee || '--'} per session
          </Txt>
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
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  slotCountBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    gap: 8,
  },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  dayBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
});