import {
  View,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useRouter } from 'expo-router';
import { UserContext } from '../../../context/UserContext';
import { useTheme } from '../../../context/ThemeContext';
import { Txt, Box, Card } from '../../../components/UIComponents';
import Button from '../../../components/shared/Button';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../../services/FirebasConfig';

export default function NutritionistProfile() {
  const { user, setUser } = useContext(UserContext);
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    phone: '',
    bio: '',
    degree: '',
    dietPhilosophy: '',
    experienceYears: '',
    specialization: [],
    clinicAddress: '',
    consultationModes: { online: false, offline: true },
    languagesSpoken: [],
    consultationFee: '',
  });

  useEffect(() => {
    if (user?.role !== 'nutritionist') {
      router.replace('/(tabs)');
      return;
    }
    getProfile();
  }, [user]);

  const getProfile = async () => {
    try {
      const nutritionists = await convex.query(api.Nutritionists.getAllNutritionists);
      const nutri = nutritionists.find(n => n.userId === user._id);
      
      if (nutri) {
        setProfile(nutri);
        setForm({
          phone: nutri.phone || '',
          bio: nutri.bio || '',
          degree: nutri.degree || '',
          dietPhilosophy: nutri.dietPhilosophy || '',
          experienceYears: nutri.experienceYears?.toString() || '',
          specialization: nutri.specialization || [],
          clinicAddress: nutri.clinicAddress || '',
          consultationModes: nutri.consultationModes || { online: false, offline: true },
          languagesSpoken: nutri.languagesSpoken || [],
          consultationFee: nutri.consultationFee?.toString() || '',
        });
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    if (!form.degree || !form.experienceYears || !form.consultationFee) {
      Alert.alert('Required Fields', 'Please fill in degree, experience, and consultation fee');
      return;
    }

    setSaving(true);

    try {
      const mutation = profile
        ? api.Nutritionists.updateNutritionistProfile
        : api.Nutritionists.createNutritionistProfile;

      await convex.mutation(mutation, {
        ...(profile && { nutritionistId: profile._id }),
        userId: user._id,
        ...form,
        experienceYears: Number(form.experienceYears),
        consultationFee: Number(form.consultationFee),
      });

      Alert.alert('Success', 'Profile saved successfully');
      setIsEditing(false);
      await getProfile();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut(auth);
            setUser(null);
            router.replace('/auth/SignIn');
          },
        },
      ]
    );
  };

  const renderChips = (items = []) => {
    if (items.length === 0) return null;
    
    return (
      <View style={styles.chipContainer}>
        {items.map((item, index) => (
          <View 
            key={index} 
            style={[styles.chip, { 
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.primary + '30',
            }]}
          >
            <Txt size={theme.fontSize.xs} color={theme.colors.primary}>
              {item}
            </Txt>
          </View>
        ))}
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading profile...
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Box style={[styles.header, { 
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.divider,
        }]}>
          <View style={{ flex: 1 }}>
            <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
              My Profile
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginTop: 4 }}>
              {profile ? 'Manage your professional profile' : 'Complete your profile to get started'}
            </Txt>
          </View>

          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={[styles.editButton, { 
              backgroundColor: isEditing 
                ? theme.colors.error + '15' 
                : theme.colors.primaryLight,
              borderColor: isEditing 
                ? theme.colors.error + '30' 
                : theme.colors.primary + '30',
            }]}
          >
            <Ionicons 
              name={isEditing ? 'close' : 'create-outline'} 
              size={18} 
              color={isEditing ? theme.colors.error : theme.colors.primary} 
            />
            <Txt 
              size={theme.fontSize.xs} 
              bold 
              color={isEditing ? theme.colors.error : theme.colors.primary}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Txt>
          </TouchableOpacity>
        </Box>

        <View style={styles.content}>
          {isEditing ? (
            /* ============= EDIT MODE ============= */
            <View style={{ gap: 16 }}>
              {/* Personal Info */}
              <Card style={styles.formCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
                  <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                    Personal Information
                  </Txt>
                </View>

                <FormField label="Phone" value={form.phone} onChangeText={v => updateForm('phone', v)} theme={theme} keyboardType="phone-pad" />
                <FormField label="Bio" value={form.bio} onChangeText={v => updateForm('bio', v)} theme={theme} multiline placeholder="Tell clients about yourself..." />
              </Card>

              {/* Professional Details */}
              <Card style={styles.formCard}>
                <View style={styles.sectionHeader}>
                  <FontAwesome5 name="graduation-cap" size={18} color={theme.colors.primary} />
                  <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                    Professional Details
                  </Txt>
                </View>

                <FormField label="Degree *" value={form.degree} onChangeText={v => updateForm('degree', v)} theme={theme} placeholder="e.g., Ph.D. in Nutrition" />
                <FormField label="Diet Philosophy" value={form.dietPhilosophy} onChangeText={v => updateForm('dietPhilosophy', v)} theme={theme} multiline />
                <FormField label="Experience (Years) *" value={form.experienceYears} onChangeText={v => updateForm('experienceYears', v)} theme={theme} keyboardType="numeric" />
                <FormField label="Clinic Address" value={form.clinicAddress} onChangeText={v => updateForm('clinicAddress', v)} theme={theme} />
                
                <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary} style={{ marginBottom: 6, marginTop: 4 }}>
                  Specializations
                </Txt>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.colors.inputBg,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.text,
                  }]}
                  value={form.specialization.join(', ')}
                  onChangeText={v => updateForm('specialization', v.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="e.g., Weight Loss, Sports Nutrition, Diabetes"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </Card>

              {/* Consultation Settings */}
              <Card style={styles.formCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
                  <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
                    Consultation Settings
                  </Txt>
                </View>

                <View style={[styles.switchRow, { borderBottomColor: theme.colors.divider }]}>
                  <View style={{ flex: 1 }}>
                    <Txt size={theme.fontSize.md} color={theme.colors.text}>Offline Consultation</Txt>
                    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>In-person visits</Txt>
                  </View>
                  <Switch
                    value={form.consultationModes.offline}
                    onValueChange={v => updateForm('consultationModes', { ...form.consultationModes, offline: v })}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + '60' }}
                    thumbColor={form.consultationModes.offline ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>

                <View style={[styles.switchRow, { borderBottomColor: theme.colors.divider }]}>
                  <View style={{ flex: 1 }}>
                    <Txt size={theme.fontSize.md} color={theme.colors.text}>Online Consultation</Txt>
                    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>Video consultations</Txt>
                  </View>
                  <Switch
                    value={form.consultationModes.online}
                    onValueChange={v => updateForm('consultationModes', { ...form.consultationModes, online: v })}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + '60' }}
                    thumbColor={form.consultationModes.online ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </View>

                <Txt size={theme.fontSize.xs} bold color={theme.colors.textSecondary} style={{ marginBottom: 6, marginTop: 12 }}>
                  Languages Spoken
                </Txt>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.colors.inputBg,
                    borderColor: theme.colors.inputBorder,
                    color: theme.colors.text,
                  }]}
                  value={form.languagesSpoken.join(', ')}
                  onChangeText={v => updateForm('languagesSpoken', v.split(',').map(s => s.trim()).filter(Boolean))}
                  placeholder="e.g., English, Hindi, Spanish"
                  placeholderTextColor={theme.colors.textSecondary}
                />

                <FormField 
                  label="Consultation Fee ($) *" 
                  value={form.consultationFee} 
                  onChangeText={v => updateForm('consultationFee', v)} 
                  theme={theme} 
                  keyboardType="numeric" 
                  placeholder="e.g., 50"
                />
              </Card>

              {/* Save Button */}
              <Button 
                title="Save Profile"
                onPress={handleSave}
                loading={saving}
              />
            </View>
          ) : profile ? (
            /* ============= VIEW MODE ============= */
            <View style={{ gap: 16 }}>
              {/* Doctor Header Card */}
              <Card style={styles.profileCard}>
                <View style={styles.doctorHeader}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                    <Txt size={theme.fontSize.xl} bold color={theme.colors.white}>
                      Dr
                    </Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt size={theme.fontSize.xl} bold color={theme.colors.text}>
                      {user?.name || 'Nutritionist'}
                    </Txt>
                    <Txt size={theme.fontSize.sm} color={theme.colors.primary}>
                      {profile.degree}
                    </Txt>
                  </View>
                  <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.accent + '20' || theme.colors.primaryLight }]}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.accent || theme.colors.GREEN} />
                    <Txt size={10} color={theme.colors.accent || theme.colors.GREEN}>Verified</Txt>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={[styles.statBox, { backgroundColor: theme.colors.primaryLight }]}>
                    <Txt size={theme.fontSize.lg} bold color={theme.colors.primary}>
                      {profile.experienceYears}+
                    </Txt>
                    <Txt size={11} color={theme.colors.primary}>Years Exp</Txt>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: theme.colors.accent + '15' || theme.colors.primaryLight }]}>
                    <Txt size={theme.fontSize.lg} bold color={theme.colors.accent || theme.colors.GREEN}>
                      ${profile.consultationFee}
                    </Txt>
                    <Txt size={11} color={theme.colors.accent || theme.colors.GREEN}>Per Session</Txt>
                  </View>
                </View>
              </Card>

              {/* Bio */}
              {profile.bio && (
                <Card>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
                    <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>About</Txt>
                  </View>
                  <Txt size={theme.fontSize.sm} color={theme.colors.text} style={{ lineHeight: 22 }}>
                    {profile.bio}
                  </Txt>
                  {profile.dietPhilosophy && (
                    <View style={[styles.philosophyBox, { backgroundColor: theme.colors.primaryLight }]}>
                      <MaterialCommunityIcons name="food-apple" size={16} color={theme.colors.primary} />
                      <Txt size={theme.fontSize.sm} color={theme.colors.primary} style={{ flex: 1 }}>
                        {profile.dietPhilosophy}
                      </Txt>
                    </View>
                  )}
                </Card>
              )}

              {/* Specializations */}
              {profile.specialization?.length > 0 && (
                <Card>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="ribbon-outline" size={20} color={theme.colors.primary} />
                    <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>Specializations</Txt>
                  </View>
                  {renderChips(profile.specialization)}
                </Card>
              )}

              {/* Languages */}
              {profile.languagesSpoken?.length > 0 && (
                <Card>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="language-outline" size={20} color={theme.colors.primary} />
                    <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>Languages</Txt>
                  </View>
                  {renderChips(profile.languagesSpoken)}
                </Card>
              )}

              {/* Contact & Consultation Modes */}
              <Card>
                <View style={styles.sectionHeader}>
                  <Ionicons name="call-outline" size={20} color={theme.colors.primary} />
                  <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>Contact & Modes</Txt>
                </View>
                
                {profile.phone && (
                  <View style={styles.contactRow}>
                    <Ionicons name="call" size={16} color={theme.colors.primary} />
                    <Txt size={theme.fontSize.sm} color={theme.colors.text}>{profile.phone}</Txt>
                  </View>
                )}
                {profile.clinicAddress && (
                  <View style={styles.contactRow}>
                    <Ionicons name="location" size={16} color={theme.colors.primary} />
                    <Txt size={theme.fontSize.sm} color={theme.colors.text}>{profile.clinicAddress}</Txt>
                  </View>
                )}
                
                <View style={styles.modesRow}>
                  <View style={[styles.modeBadge, { 
                    backgroundColor: profile.consultationModes?.offline 
                      ? theme.colors.accent + '20' || theme.colors.primaryLight 
                      : theme.colors.inputBg 
                  }]}>
                    <Ionicons 
                      name="people" 
                      size={14} 
                      color={profile.consultationModes?.offline ? theme.colors.accent || theme.colors.GREEN : theme.colors.textSecondary} 
                    />
                    <Txt size={11} color={profile.consultationModes?.offline ? theme.colors.accent || theme.colors.GREEN : theme.colors.textSecondary}>
                      {profile.consultationModes?.offline ? 'Offline' : 'No Offline'}
                    </Txt>
                  </View>
                  <View style={[styles.modeBadge, { 
                    backgroundColor: profile.consultationModes?.online 
                      ? theme.colors.blue + '20' 
                      : theme.colors.inputBg 
                  }]}>
                    <Ionicons 
                      name="videocam" 
                      size={14} 
                      color={profile.consultationModes?.online ? theme.colors.blue : theme.colors.textSecondary} 
                    />
                    <Txt size={11} color={profile.consultationModes?.online ? theme.colors.blue : theme.colors.textSecondary}>
                      {profile.consultationModes?.online ? 'Online' : 'No Online'}
                    </Txt>
                  </View>
                </View>
              </Card>

              {/* Logout */}
              <TouchableOpacity 
                style={[styles.logoutButton, { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
                <Txt size={theme.fontSize.md} color={theme.colors.error}>Logout</Txt>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Reusable Form Field Component
const FormField = ({ label, theme, ...props }) => (
  <View style={{ marginBottom: 12 }}>
    <Txt size={13} bold color={theme.colors.textSecondary} style={{ marginBottom: 6 }}>
      {label}
    </Txt>
    <TextInput
      style={{
        backgroundColor: theme.colors.inputBg,
        borderColor: theme.colors.inputBorder,
        color: theme.colors.text,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        fontSize: theme.fontSize.md,
      }}
      placeholderTextColor={theme.colors.textSecondary}
      {...props}
    />
  </View>
);

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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  content: {
    padding: 16,
  },
  formCard: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  profileCard: {
    padding: 16,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 4,
  },
  philosophyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  modesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modeBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
  },
  chipContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 40,
  },
});