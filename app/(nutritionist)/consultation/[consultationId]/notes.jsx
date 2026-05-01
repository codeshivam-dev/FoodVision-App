import {
  View,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserContext } from '../../../../context/UserContext';
import { useTheme } from '../../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../../components/UIComponents';
import Button from '../../../../components/shared/Button';
import { Ionicons } from '@expo/vector-icons';

export default function SessionNotes() {
  const { consultationId } = useLocalSearchParams();
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [notes, setNotes] = useState('');
  const [session, setSession] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role !== 'nutritionist') {
      router.replace('/(tabs)');
      return;
    }
    getSessionData();
  }, [consultationId, user]);

  const getSessionData = async () => {
    try {
      // Get session data
      const sessionResult = await convex.query(api.Sessions.getSession, {
        consultationId,
      });
      setSession(sessionResult);
      
      if (sessionResult?.notes) {
        setNotes(sessionResult.notes);
      }

      // Get consultation details for context
      const consultationResult = await convex.query(
        api.Consultations.getConsultationDetails,
        { consultationId }
      );
      setConsultation(consultationResult);
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?._id) {
      Alert.alert('Error', 'Session not found');
      return;
    }

    if (!notes.trim()) {
      Alert.alert(
        'Empty Notes',
        'Are you sure you want to save without notes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save Anyway', onPress: saveNotes },
        ]
      );
      return;
    }

    saveNotes();
  };

  const saveNotes = async () => {
    setSaving(true);

    try {
      await convex.mutation(api.Sessions.saveSessionNotes, {
        sessionId: session._id,
        notes: notes.trim(),
      });

      Alert.alert(
        'Session Complete! 🎉',
        'Notes saved successfully. Would you like to create a diet plan for this client?',
        [
          {
            text: 'Create Plan',
            onPress: () => router.push(`/consultation/${consultationId}/plan`),
          },
          {
            text: 'Later',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  // Quick note templates
  const noteTemplates = [
    {
      icon: 'checkmark-circle-outline',
      label: 'Good Progress',
      text: 'Client is showing good progress. Following diet plan well. Recommend continuing current plan with minor adjustments.',
    },
    {
      icon: 'fitness-outline',
      label: 'Needs Motivation',
      text: 'Client needs additional motivation. Discussed importance of consistency. Suggested meal prep strategies.',
    },
    {
      icon: 'warning-outline',
      label: 'Concerns',
      text: 'Client reported some concerns:\n- \n- \n\nRecommendations:\n- ',
    },
  ];

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading session...
        </Txt>
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
        keyboardShouldPersistTaps="handled"
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
              Session Notes
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
              Document your consultation findings
            </Txt>
          </View>
        </Box>

        <View style={styles.content}>
          {/* Client & Session Info */}
          {consultation && (
            <Card style={styles.infoCard}>
              <View style={styles.clientRow}>
                <View style={[styles.clientAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Txt size={theme.fontSize.md} bold color={theme.colors.white}>
                    {consultation?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                    {consultation?.user?.name || 'Client'}
                  </Txt>
                  <View style={styles.sessionMeta}>
                    <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
                    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                      {consultation?.slot?.date || 'N/A'} at {consultation?.slot?.time || 'N/A'}
                    </Txt>
                  </View>
                </View>
                <View style={[styles.typeBadge, {
                  backgroundColor: consultation?.consultationType === 'online' 
                    ? theme.colors.blue + '20' 
                    : (theme.colors.accent || theme.colors.GREEN) + '20',
                }]}>
                  <Ionicons 
                    name={consultation?.consultationType === 'online' ? 'videocam' : 'people'} 
                    size={14} 
                    color={consultation?.consultationType === 'online' ? theme.colors.blue : theme.colors.accent || theme.colors.GREEN} 
                  />
                </View>
              </View>

              {/* Pre-consultation form summary */}
              {consultation?.preConsultationForm && (
                <View style={[styles.formSummary, { 
                  backgroundColor: theme.colors.primaryLight,
                  borderColor: theme.colors.primary + '30',
                }]}>
                  <Ionicons name="document-text" size={14} color={theme.colors.primary} />
                  <Txt size={theme.fontSize.xs} color={theme.colors.primary} style={{ flex: 1 }}>
                    Goals: {consultation.preConsultationForm.goals || 'N/A'} • 
                    Diet: {consultation.preConsultationForm.dietPreference || 'N/A'}
                  </Txt>
                </View>
              )}
            </Card>
          )}

          {/* Quick Templates */}
          <View style={styles.templatesSection}>
            <Txt size={theme.fontSize.sm} bold color={theme.colors.textSecondary} style={{ marginBottom: 8 }}>
              Quick Templates
            </Txt>
            <View style={styles.templatesRow}>
              {noteTemplates.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.templateChip, { 
                    backgroundColor: theme.colors.inputBg,
                    borderColor: theme.colors.border,
                  }]}
                  onPress={() => setNotes(template.text)}
                >
                  <Ionicons name={template.icon} size={14} color={theme.colors.primary} />
                  <Txt size={theme.fontSize.xs} color={theme.colors.text}>
                    {template.label}
                  </Txt>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes Input */}
          <Card style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
              <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                Consultation Notes
              </Txt>
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                {notes.length} characters
              </Txt>
            </View>

            <TextInput
              style={[styles.notesInput, {
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.inputBorder,
                color: theme.colors.text,
                fontSize: theme.fontSize.md,
              }]}
              placeholder="Enter detailed session notes, observations, recommendations..."
              placeholderTextColor={theme.colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </Card>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button 
              title="Save Notes & Complete Session"
              onPress={handleSave}
              loading={saving}
            />

            <TouchableOpacity 
              onPress={() => router.back()}
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
            >
              <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
                Save as Draft
              </Txt>
            </TouchableOpacity>
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
  infoCard: {
    padding: 14,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  typeBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  templatesSection: {
    gap: 6,
  },
  templatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  notesCard: {
    padding: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    minHeight: 200,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});