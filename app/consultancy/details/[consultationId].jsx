import { View, ScrollView, TouchableOpacity, Linking, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../components/UIComponents';
import Button from '../../../components/shared/Button';

export default function ConsultationDetails() {
  const { consultationId } = useLocalSearchParams();
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();
  
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConsultation();
  }, [consultationId]);

  const getConsultation = async () => {
    try {
      const result = await convex.query(api.Consultations.getConsultationDetails, {
        consultationId,
      });
      setConsultation(result);
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlan = () => {
    if (consultation?.expertDietPlan) {
      router.push(`/consultancy/plan/${consultationId}`);
    }
  };

  const handleJoinMeeting = () => {
    if (consultation?.meetLink) {
      Linking.openURL(consultation.meetLink);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return theme.colors.primary;
      case 'completed': return theme.colors.accent || theme.colors.GREEN;
      case 'cancelled': return theme.colors.error;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'checkmark-circle';
      case 'completed': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle';
      case 'pending': return 'time';
      default: return 'ellipse';
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading details...
        </Txt>
      </Box>
    );
  }

  // Not found state
  if (!consultation) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="document-outline" size={48} color={theme.colors.textSecondary} />
        <Txt bold color={theme.colors.text} style={{ marginTop: 12 }}>
          Consultation not found
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

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Status */}
      <Box style={[styles.header, { 
        backgroundColor: theme.colors.card,
        borderBottomColor: theme.colors.divider,
      }]}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { 
          backgroundColor: getStatusColor(consultation.status) + '20',
          borderColor: getStatusColor(consultation.status) + '40',
        }]}>
          <Ionicons 
            name={getStatusIcon(consultation.status)} 
            size={16} 
            color={getStatusColor(consultation.status)} 
          />
          <Txt 
            size={theme.fontSize.xs} 
            bold 
            color={getStatusColor(consultation.status)}
            style={{ textTransform: 'capitalize' }}
          >
            {consultation.status || 'Unknown'}
          </Txt>
        </View>

        <Txt size={theme.fontSize.xxl} bold color={theme.colors.text} style={{ marginTop: 8 }}>
          Consultation Details
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
          Track your appointment and access information
        </Txt>
      </Box>

      <View style={styles.content}>
        {/* Appointment Info */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
              Appointment Info
            </Txt>
          </View>

          <View style={styles.infoGrid}>
            {[
              { 
                label: 'Nutritionist', 
                value: consultation?.nutritionist?.user?.name || 'N/A',
                icon: <FontAwesome5 name="user-md" size={16} color={theme.colors.primary} />,
              },
              { 
                label: 'Date', 
                value: consultation?.slot?.date || 'N/A',
                icon: <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />,
              },
              { 
                label: 'Time', 
                value: consultation?.slot?.time || 'N/A',
                icon: <Ionicons name="time-outline" size={16} color={theme.colors.primary} />,
              },
              { 
                label: 'Type', 
                value: consultation?.consultationType === 'online' ? 'Online' : 'In-Person',
                icon: <MaterialCommunityIcons 
                  name={consultation?.consultationType === 'online' ? 'videocam' : 'account-group'} 
                  size={16} 
                  color={theme.colors.primary} 
                />,
              },
            ].map((item, index) => (
              <View 
                key={item.label}
                style={[styles.infoItem, { 
                  borderBottomColor: theme.colors.divider,
                  borderBottomWidth: index < 3 ? 1 : 0,
                }]}
              >
                <View style={[styles.infoIcon, { backgroundColor: theme.colors.primaryLight }]}>
                  {item.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                    {item.label}
                  </Txt>
                  <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                    {item.value}
                  </Txt>
                </View>
              </View>
            ))}
          </View>

          {/* Join Meeting Button */}
          {consultation?.meetLink && (
            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleJoinMeeting}
              activeOpacity={0.8}
            >
              <Ionicons name="videocam" size={20} color={theme.colors.white} />
              <Txt size={theme.fontSize.md} bold color={theme.colors.white}>
                Join Meeting
              </Txt>
            </TouchableOpacity>
          )}

          {consultation?.meetLink && (
            <TouchableOpacity 
              onPress={() => Linking.openURL(consultation.meetLink)}
              style={{ marginTop: 10 }}
            >
              <Txt 
                size={theme.fontSize.xs} 
                color={theme.colors.primary} 
                style={{ textAlign: 'center' }}
                numberOfLines={1}
              >
                {consultation.meetLink}
              </Txt>
            </TouchableOpacity>
          )}
        </Card>

        {/* Pre-Consultation Form */}
        {consultation?.preConsultationForm && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.primary} />
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                Your Form
              </Txt>
            </View>

            <View style={styles.formFields}>
              {[
                { label: 'Goals', value: consultation.preConsultationForm.goals, icon: 'flag-outline' },
                { label: 'Diet Preference', value: consultation.preConsultationForm.dietPreference, icon: 'nutrition-outline' },
                ...(consultation.preConsultationForm.medicalConditions 
                  ? [{ label: 'Medical Conditions', value: consultation.preConsultationForm.medicalConditions, icon: 'medkit-outline' }] 
                  : []),
                ...(consultation.preConsultationForm.allergies 
                  ? [{ label: 'Allergies', value: consultation.preConsultationForm.allergies, icon: 'warning-outline' }] 
                  : []),
                ...(consultation.preConsultationForm.currentIssues 
                  ? [{ label: 'Current Issues', value: consultation.preConsultationForm.currentIssues, icon: 'fitness-outline' }] 
                  : []),
              ].map((field, index) => (
                <View key={field.label} style={{ marginBottom: index < 4 ? 14 : 0 }}>
                  <View style={styles.formLabel}>
                    <Ionicons name={field.icon} size={14} color={theme.colors.primary} />
                    <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary}>
                      {field.label}
                    </Txt>
                  </View>
                  <Txt size={theme.fontSize.sm} color={theme.colors.text} style={{ marginTop: 4, lineHeight: 20 }}>
                    {field.value}
                  </Txt>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Session Notes */}
        {consultation?.session?.notes && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="clipboard-outline" size={20} color={theme.colors.primary} />
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                Session Notes
              </Txt>
            </View>
            
            <View style={[styles.notesBox, { 
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.border,
            }]}>
              <Txt size={theme.fontSize.sm} color={theme.colors.text} style={{ lineHeight: 22 }}>
                {consultation.session.notes}
              </Txt>
            </View>
          </Card>
        )}

        {/* Expert Diet Plan */}
        {consultation?.expertDietPlan && (
          <View style={{ marginTop: 8, marginBottom: 40 }}>
            <Button 
              title="View Expert Diet Plan"
              onPress={handleViewPlan}
            />
            <Txt 
              size={theme.fontSize.xs} 
              color={theme.colors.textSecondary}
              style={{ textAlign: 'center', marginTop: 8 }}
            >
              Your personalized diet plan from the nutritionist
            </Txt>
          </View>
        )}

        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backButton, { borderColor: theme.colors.border }]}
        >
          <Ionicons name="arrow-back" size={16} color={theme.colors.textSecondary} />
          <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
            Go Back
          </Txt>
        </TouchableOpacity>
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 0,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  formFields: {
    gap: 0,
  },
  formLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notesBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 40,
  },
});