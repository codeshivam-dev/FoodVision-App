import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../components/UIComponents';
import Button from '../../../components/shared/Button';

export default function BookingConfirmation() {
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
      console.error('Error fetching consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFillForm = () => {
    router.push(`/consultancy/${consultation?.nutritionistId}/form?consultationId=${consultationId}`);
  };

  const handleViewDetails = () => {
    router.push(`/consultancy/details/${consultationId}`);
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/Home');
  };

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading confirmation...
        </Txt>
      </Box>
    );
  }

  // Not found state
  if (!consultation) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
        <Txt bold color={theme.colors.error} style={{ marginTop: 12 }}>
          Booking not found
        </Txt>
        <Button 
          title="Go Home" 
          onPress={handleGoHome} 
          style={{ marginTop: 20, width: '60%' }} 
        />
      </Box>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Box style={styles.container}>
        {/* Success Icon */}
        <View style={styles.successSection}>
          <View style={[styles.successCircle, { 
            backgroundColor: theme.colors.accent || theme.colors.GREEN + '15',
            borderColor: theme.colors.accent || theme.colors.GREEN + '30',
          }]}>
            <View style={[styles.checkCircle, { 
              backgroundColor: theme.colors.accent || theme.colors.GREEN 
            }]}>
              <Ionicons name="checkmark" size={48} color={theme.colors.white} />
            </View>
          </View>

          <Txt size={theme.fontSize.xxxl} bold color={theme.colors.text} style={{ marginTop: 20 }}>
            Booking Confirmed!
          </Txt>
          <Txt 
            size={theme.fontSize.md} 
            color={theme.colors.textSecondary} 
            style={styles.successText}
          >
            Your consultation has been successfully scheduled
          </Txt>
        </View>

        {/* Appointment Details Card */}
        <Card style={[styles.detailsCard, { 
          borderColor: theme.colors.accent || theme.colors.GREEN + '30',
        }]}>
          <View style={styles.detailHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
              Appointment Details
            </Txt>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            {/* Nutritionist */}
            <View style={[styles.detailItem, { borderBottomColor: theme.colors.divider }]}>
              <View style={[styles.detailIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <FontAwesome5 name="user-md" size={16} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Nutritionist</Txt>
                <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                  {consultation?.nutritionist?.user?.name || 'N/A'}
                </Txt>
              </View>
            </View>

            {/* Date */}
            <View style={[styles.detailItem, { borderBottomColor: theme.colors.divider }]}>
              <View style={[styles.detailIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Date</Txt>
                <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                  {consultation?.slot?.date || 'N/A'}
                </Txt>
              </View>
            </View>

            {/* Time */}
            <View style={[styles.detailItem, { borderBottomColor: theme.colors.divider }]}>
              <View style={[styles.detailIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name="time-outline" size={16} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Time</Txt>
                <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                  {consultation?.slot?.time || 'N/A'}
                </Txt>
              </View>
            </View>

            {/* Type */}
            <View style={[styles.detailItem, { borderBottomColor: theme.colors.divider }]}>
              <View style={[styles.detailIcon, { backgroundColor: theme.colors.primaryLight }]}>
                <MaterialCommunityIcons 
                  name={consultation?.consultationType === 'online' ? 'videocam' : 'account-group'} 
                  size={16} 
                  color={theme.colors.primary} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Type</Txt>
                <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                  {consultation?.consultationType === 'online' ? 'Online Consultation' : 'In-Person Visit'}
                </Txt>
              </View>
            </View>

            {/* Payment */}
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: theme.colors.accent + '20' || theme.colors.primaryLight }]}>
                <Ionicons 
                  name="card-outline" 
                  size={16} 
                  color={theme.colors.accent || theme.colors.GREEN} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Payment</Txt>
                <Txt size={theme.fontSize.md} bold color={theme.colors.accent || theme.colors.GREEN}>
                  Pay at consultation
                </Txt>
              </View>
            </View>
          </View>
        </Card>

        {/* Next Steps */}
        <Card style={styles.nextSteps}>
          <View style={styles.detailHeader}>
            <Ionicons name="list-outline" size={20} color={theme.colors.primary} />
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
              Next Steps
            </Txt>
          </View>

          <View style={styles.stepsList}>
            {[
              { 
                icon: 'document-text-outline', 
                text: 'Fill out pre-consultation form to help your nutritionist prepare',
                action: handleFillForm,
                buttonText: 'Fill Form',
              },
              { 
                icon: 'notifications-outline', 
                text: 'You will receive a reminder before your appointment',
              },
              { 
                icon: 'chatbubbles-outline', 
                text: 'Prepare any questions or concerns to discuss',
              },
            ].map((step, index) => (
              <View key={index} style={[styles.stepItem, { 
                borderBottomColor: theme.colors.divider,
              }]}>
                <View style={[styles.stepIcon, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name={step.icon} size={18} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ lineHeight: 20 }}>
                    {step.text}
                  </Txt>
                  {step.action && (
                    <TouchableOpacity onPress={step.action} style={{ marginTop: 8 }}>
                      <Txt size={theme.fontSize.sm} bold color={theme.colors.primary}>
                        {step.buttonText} →
                      </Txt>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button 
            title="Fill Pre-Consultation Form"
            onPress={handleFillForm}
          />
          
          <Button 
            title="View Full Details"
            variant="outline"
            onPress={handleViewDetails}
          />

          <TouchableOpacity 
            onPress={handleGoHome}
            style={[styles.homeButton, { borderColor: theme.colors.border }]}
          >
            <Ionicons name="home-outline" size={18} color={theme.colors.textSecondary} />
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
              Back to Home
            </Txt>
          </TouchableOpacity>
        </View>
      </Box>
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
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  successSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  detailsCard: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 0,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextSteps: {
    width: '100%',
    padding: 20,
    marginBottom: 24,
  },
  stepsList: {
    gap: 0,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actions: {
    width: '100%',
    gap: 12,
    paddingBottom: 40,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
});