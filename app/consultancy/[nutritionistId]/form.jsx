import { View, TextInput, ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useContext } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserContext } from '../../../context/UserContext';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../components/UIComponents';
import Button from '../../../components/shared/Button';
import LoadingDialog from '../../../components/shared/LoadingDialog';

export default function PreConsultationForm() {
  const { consultationId } = useLocalSearchParams();
  const { user } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    goals: '',
    medicalConditions: '',
    allergies: '',
    dietPreference: '',
    currentIssues: '',
  });

  const [errors, setErrors] = useState({});

  const formFields = [
    {
      key: 'goals',
      label: 'Health Goals',
      required: true,
      icon: <Ionicons name="flag-outline" size={20} color={theme.colors.primary} />,
      placeholder: 'What are your health and fitness goals?',
      multiline: true,
      numberOfLines: 3,
      hint: 'e.g., Lose 10kg, Build muscle, Improve energy levels',
    },
    {
      key: 'dietPreference',
      label: 'Diet Preference',
      required: true,
      icon: <MaterialCommunityIcons name="food-apple-outline" size={20} color={theme.colors.primary} />,
      placeholder: 'What type of diet do you prefer?',
      hint: 'e.g., Vegetarian, Vegan, Keto, Mediterranean, Balanced',
    },
    {
      key: 'medicalConditions',
      label: 'Medical Conditions',
      required: false,
      icon: <FontAwesome5 name="notes-medical" size={18} color={theme.colors.primary} />,
      placeholder: 'Any existing medical conditions?',
      multiline: true,
      numberOfLines: 2,
      hint: 'e.g., Diabetes, Thyroid, PCOS, Hypertension',
    },
    {
      key: 'allergies',
      label: 'Allergies',
      required: false,
      icon: <Ionicons name="warning-outline" size={20} color={theme.colors.primary} />,
      placeholder: 'Any food or medication allergies?',
      multiline: true,
      numberOfLines: 2,
      hint: 'e.g., Peanuts, Dairy, Gluten, Shellfish',
    },
    {
      key: 'currentIssues',
      label: 'Current Health Concerns',
      required: false,
      icon: <Ionicons name="fitness-outline" size={20} color={theme.colors.primary} />,
      placeholder: 'Any current health concerns or challenges?',
      multiline: true,
      numberOfLines: 3,
      hint: 'e.g., Digestive issues, Low energy, Poor sleep',
    },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.goals.trim()) {
      newErrors.goals = 'Health goals are required';
    }
    if (!form.dietPreference.trim()) {
      newErrors.dietPreference = 'Diet preference is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Missing Information', 'Please fill in all required fields marked with *');
      return;
    }

    setLoading(true);

    try {
      await convex.mutation(api.PreConsultationForms.savePreConsultationForm, {
        consultationId,
        goals: form.goals.trim(),
        medicalConditions: form.medicalConditions.trim(),
        allergies: form.allergies.trim(),
        dietPreference: form.dietPreference.trim(),
        currentIssues: form.currentIssues.trim(),
      });

      Alert.alert(
        'Success! 🎉',
        'Your pre-consultation form has been submitted. The nutritionist will review your details.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        'Submission Failed',
        error.message || 'Unable to submit form. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm({ ...form, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Box style={[styles.header, { 
          backgroundColor: theme.colors.background,
          borderBottomColor: theme.colors.divider 
        }]}>
          <View style={styles.headerIcon}>
            <Ionicons name="document-text-outline" size={28} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
              Pre-Consultation Form
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
              Help your nutritionist prepare better by sharing your details
            </Txt>
          </View>
        </Box>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.inputBg }]}>
            <View style={[styles.progressFill, { 
              backgroundColor: theme.colors.primary,
              width: `${(Object.values(form).filter(v => v.trim()).length / formFields.length) * 100}%`,
            }]} />
          </View>
          <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
            {Object.values(form).filter(v => v.trim()).length} of {formFields.length} fields completed
          </Txt>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Card style={styles.formCard}>
            {formFields.map((field, index) => (
              <View key={field.key} style={{ marginBottom: index < formFields.length - 1 ? 20 : 0 }}>
                {/* Label */}
                <View style={styles.labelRow}>
                  <View style={styles.labelLeft}>
                    {field.icon}
                    <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
                      {field.label}
                    </Txt>
                    {field.required && (
                      <Txt size={theme.fontSize.sm} color={theme.colors.error}>*</Txt>
                    )}
                  </View>
                  
                  {/* Optional Badge */}
                  {!field.required && (
                    <View style={[styles.optionalBadge, { 
                      backgroundColor: theme.colors.inputBg,
                      borderColor: theme.colors.border,
                    }]}>
                      <Txt size={10} color={theme.colors.textSecondary}>Optional</Txt>
                    </View>
                  )}
                </View>

                {/* Input Field */}
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.colors.inputBg,
                    borderColor: errors[field.key] 
                      ? theme.colors.error 
                      : theme.colors.inputBorder,
                    color: theme.colors.text,
                    fontSize: theme.fontSize.md,
                  }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={form[field.key]}
                  onChangeText={(value) => updateForm(field.key, value)}
                  multiline={field.multiline}
                  numberOfLines={field.numberOfLines}
                  textAlignVertical={field.multiline ? 'top' : 'center'}
                />

                {/* Hint Text */}
                {field.hint && (
                  <View style={styles.hintRow}>
                    <Ionicons name="bulb-outline" size={12} color={theme.colors.textSecondary} />
                    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                      {field.hint}
                    </Txt>
                  </View>
                )}

                {/* Error Text */}
                {errors[field.key] && (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
                    <Txt size={theme.fontSize.xs} color={theme.colors.error}>
                      {errors[field.key]}
                    </Txt>
                  </View>
                )}
              </View>
            ))}
          </Card>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button 
              title="Submit Form"
              onPress={handleSubmit}
              loading={loading}
            />
            <Txt 
              size={theme.fontSize.xs} 
              color={theme.colors.textSecondary}
              style={{ textAlign: 'center', marginTop: 8 }}
            >
              Your information is kept confidential and secure
            </Txt>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <LoadingDialog loading={loading} message="Submitting form..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  formContainer: {
    padding: 20,
  },
  formCard: {
    padding: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 50,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingLeft: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  submitContainer: {
    marginTop: 24,
  },
});