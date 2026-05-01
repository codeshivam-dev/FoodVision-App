import {
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserContext } from '../../../../context/UserContext';
import { useTheme } from '../../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../../components/UIComponents';
import Button from '../../../../components/shared/Button';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function StartConsultation() {
  const { consultationId } = useLocalSearchParams();
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [consultation, setConsultation] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'nutritionist') {
      router.replace('/(tabs)');
      return;
    }
    getConsultation();
  }, [consultationId, user]);

  const getConsultation = async () => {
    try {
      const result = await convex.query(
        api.Consultations.getConsultationDetails,
        { consultationId }
      );
      setConsultation(result);
      setMeetLink(result.meetLink || '');
    } catch (error) {
      console.error('Error fetching consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    // Validate online meeting link
    if (
      consultation?.consultationType === 'online' &&
      (!meetLink || meetLink === 'coming soon')
    ) {
      Alert.alert(
        'Meeting Link Required',
        'Please provide a valid Google Meet or Zoom link for the online consultation.',
        [{ text: 'OK' }]
      );
      return;
    }

    setStarting(true);

    try {
      // Save meet link if changed
      if (meetLink && meetLink !== consultation.meetLink) {
        await convex.mutation(api.Consultations.setConsultationMeetLink, {
          consultationId,
          meetLink: meetLink.trim(),
        });
      }

      // Start the session
      await convex.mutation(api.Sessions.startSession, { consultationId });
      
      // Navigate to session notes
      router.push(`/consultation/${consultationId}/notes`);
    } catch (error) {
      const errorMsg = error?.message || String(error);
      
      // If session already started
      if (errorMsg.includes('Session already started') || errorMsg.includes('already exists')) {
        Alert.alert(
          'Session In Progress',
          'This session has already been started. Would you like to continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Continue',
              onPress: () => router.push(`/consultation/${consultationId}/notes`),
            },
          ]
        );
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setStarting(false);
    }
  };

  const handleOpenLink = () => {
    if (meetLink && meetLink !== 'coming soon') {
      Linking.openURL(meetLink);
    }
  };

  // Check if session is ready to start (all checks passed)
  const checks = {
    hasPreForm: !!consultation?.preConsultationForm,
    hasMeetLink: consultation?.consultationType === 'offline' || 
                 (meetLink && meetLink !== 'coming soon'),
    isConfirmed: consultation?.status === 'confirmed' || consultation?.status === 'upcoming',
  };

  const allChecksPassed = Object.values(checks).every(Boolean);

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading consultation...
        </Txt>
      </Box>
    );
  }

  // Not found state
  if (!consultation) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
        <Txt bold color={theme.colors.text} style={{ marginTop: 12 }}>
          Consultation Not Found
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Box style={[styles.header, { 
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.divider,
        }]}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
              Start Consultation
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
              Review details and begin the session
            </Txt>
          </View>
        </Box>

        <View style={styles.content}>
          {/* Client Header Card */}
          <Card style={styles.clientCard}>
            <View style={styles.clientRow}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                <Txt size={theme.fontSize.xl} bold color={theme.colors.white}>
                  {consultation?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                </Txt>
              </View>

              <View style={{ flex: 1 }}>
                <Txt size={theme.fontSize.xl} bold color={theme.colors.text}>
                  {consultation?.user?.name || 'Client'}
                </Txt>
                <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
                  {consultation?.user?.email || 'No email'}
                </Txt>
              </View>

              <View style={[styles.statusBadge, { 
                backgroundColor: theme.colors.accent + '20' || theme.colors.primaryLight,
                borderColor: theme.colors.accent + '40' || theme.colors.primary + '30',
              }]}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={14} 
                  color={theme.colors.accent || theme.colors.primary} 
                />
                <Txt size={11} color={theme.colors.accent || theme.colors.primary}>
                  Scheduled
                </Txt>
              </View>
            </View>
          </Card>

          {/* Appointment Details */}
          <Card style={styles.detailsCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={18} color={theme.colors.primary} />
              <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                Appointment Details
              </Txt>
            </View>

            <View style={styles.detailsGrid}>
              {[
                { 
                  label: 'Date', 
                  value: consultation?.slot?.date || 'N/A',
                  icon: 'calendar-outline',
                  color: theme.colors.primary,
                },
                { 
                  label: 'Time', 
                  value: consultation?.slot?.time || 'N/A',
                  icon: 'time-outline',
                  color: theme.colors.blue,
                },
                { 
                  label: 'Type', 
                  value: consultation?.consultationType === 'online' ? 'Online' : 'In-Person',
                  icon: consultation?.consultationType === 'online' ? 'videocam-outline' : 'people-outline',
                  color: consultation?.consultationType === 'online' ? theme.colors.primary : theme.colors.accent || theme.colors.GREEN,
                },
                { 
                  label: 'Status', 
                  value: consultation?.status || 'Unknown',
                  icon: 'flag-outline',
                  color: theme.colors.warning,
                },
              ].map((detail) => (
                <View key={detail.label} style={[styles.detailItem, { 
                  borderBottomColor: theme.colors.divider,
                }]}>
                  <View style={[styles.detailIcon, { backgroundColor: detail.color + '15' }]}>
                    <Ionicons name={detail.icon} size={16} color={detail.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                      {detail.label}
                    </Txt>
                    <Txt size={theme.fontSize.md} bold color={theme.colors.text} style={{ textTransform: 'capitalize' }}>
                      {detail.value}
                    </Txt>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          {/* Online Meeting Link */}
          {consultation?.consultationType === 'online' && (
            <Card style={styles.meetCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="videocam" size={18} color={theme.colors.primary} />
                <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                  Meeting Link
                </Txt>
              </View>

              <TextInput
                style={[styles.meetInput, {
                  backgroundColor: theme.colors.inputBg,
                  borderColor: meetLink ? theme.colors.accent || theme.colors.GREEN : theme.colors.inputBorder,
                  color: theme.colors.text,
                }]}
                placeholder="Paste Google Meet or Zoom link"
                placeholderTextColor={theme.colors.textSecondary}
                value={meetLink}
                onChangeText={setMeetLink}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {meetLink && meetLink !== 'coming soon' && (
                <TouchableOpacity
                  style={[styles.testLinkButton, { 
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primary + '30',
                  }]}
                  onPress={handleOpenLink}
                >
                  <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
                  <Txt size={theme.fontSize.sm} color={theme.colors.primary}>
                    Test Link
                  </Txt>
                </TouchableOpacity>
              )}
            </Card>
          )}

          {/* Pre-Consultation Form */}
          {consultation?.preConsultationForm && (
            <Card style={styles.formCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="document-text" size={18} color={theme.colors.primary} />
                <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                  Client Information
                </Txt>
              </View>

              <View style={styles.formGrid}>
                {[
                  { label: 'Goals', value: consultation.preConsultationForm.goals, icon: 'flag' },
                  { label: 'Diet Preference', value: consultation.preConsultationForm.dietPreference, icon: 'nutrition' },
                  ...(consultation.preConsultationForm.medicalConditions 
                    ? [{ label: 'Medical Conditions', value: consultation.preConsultationForm.medicalConditions, icon: 'medkit' }] 
                    : []),
                  ...(consultation.preConsultationForm.allergies 
                    ? [{ label: 'Allergies', value: consultation.preConsultationForm.allergies, icon: 'warning' }] 
                    : []),
                ].map((item, index) => (
                  <View key={index} style={[styles.formItem, { 
                    backgroundColor: theme.colors.inputBg,
                    borderColor: theme.colors.border,
                  }]}>
                    <View style={styles.formLabel}>
                      <Ionicons name={item.icon} size={14} color={theme.colors.primary} />
                      <Txt size={theme.fontSize.xs} bold color={theme.colors.primary}>
                        {item.label}
                      </Txt>
                    </View>
                    <Txt size={theme.fontSize.sm} color={theme.colors.text} style={{ lineHeight: 20 }}>
                      {item.value}
                    </Txt>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* Readiness Checklist */}
          <Card style={[styles.checklistCard, { 
            borderColor: allChecksPassed 
              ? theme.colors.accent || theme.colors.GREEN + '40' 
              : theme.colors.warning + '40',
          }]}>
            <Txt size={theme.fontSize.sm} bold color={theme.colors.textSecondary} style={{ marginBottom: 10 }}>
              Session Readiness
            </Txt>
            
            {[
              { 
                label: 'Client form received', 
                passed: checks.hasPreForm,
                icon: checks.hasPreForm ? 'checkmark-circle' : 'alert-circle',
              },
              { 
                label: checks.hasMeetLink ? 'Meeting link ready' : 'Meeting link needed', 
                passed: checks.hasMeetLink,
                icon: checks.hasMeetLink ? 'checkmark-circle' : 'alert-circle',
              },
              { 
                label: 'Consultation confirmed', 
                passed: checks.isConfirmed,
                icon: checks.isConfirmed ? 'checkmark-circle' : 'alert-circle',
              },
            ].map((check, index) => (
              <View key={index} style={styles.checkItem}>
                <Ionicons 
                  name={check.icon} 
                  size={16} 
                  color={check.passed ? theme.colors.accent || theme.colors.GREEN : theme.colors.warning} 
                />
                <Txt 
                  size={theme.fontSize.xs} 
                  color={check.passed ? theme.colors.text : theme.colors.warning}
                >
                  {check.label}
                </Txt>
              </View>
            ))}
          </Card>

          {/* Start Button */}
          <View style={styles.startSection}>
            <Button 
              title="Start Consultation Session"
              onPress={handleStart}
              loading={starting}
            />

            <Txt 
              size={theme.fontSize.xs} 
              color={theme.colors.textSecondary}
              style={{ textAlign: 'center', marginTop: 8 }}
            >
              {allChecksPassed 
                ? "You're all set! Starting will take you to session notes."
                : "Please complete all checks before starting."}
            </Txt>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  clientCard: {
    padding: 16,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  detailsCard: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  detailsGrid: {
    gap: 0,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetCard: {
    padding: 16,
  },
  meetInput: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    fontSize: 15,
  },
  testLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  formCard: {
    padding: 16,
  },
  formGrid: {
    gap: 10,
  },
  formItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  formLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  checklistCard: {
    padding: 14,
    borderWidth: 1,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  startSection: {
    marginTop: 8,
  },
});