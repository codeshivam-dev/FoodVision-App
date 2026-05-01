import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useState, useEffect } from "react";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../../services/FirebasConfig";
import { UserContext } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Txt, Card } from "../../components/UIComponents";

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();
  const convex = useConvex();
  const { theme } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    goal: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        gender: user.gender || '',
        goal: user.goal || '',
      });
    }
  }, [user]);

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.replace("/auth/SignIn");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original user data
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        age: user.age || '',
        height: user.height || '',
        weight: user.weight || '',
        gender: user.gender || '',
        goal: user.goal || '',
      });
    }
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.email?.trim()) {
      Alert.alert("Required", "Name and email are required");
      return;
    }

    setSaving(true);
    try {
      await convex.mutation(api.Users.UpdateUserProfile, {
        uid: user._id,
        ...form,
      });
      
      setUser({ ...user, ...form });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const menuOptions = [
    {
      title: "My Progress",
      icon: "analytics-outline",
      iconLib: Ionicons,
      path: '/(tabs)/Progress'
    },
    {
      title: "Explore Recipes",
      icon: "restaurant-outline",
      iconLib: Ionicons,
      path: '/(tabs)/Meals'
    },
    {
      title: "AI Recipes",
      icon: "sparkles-outline",
      iconLib: Ionicons,
      path: '/generate-ai-recipe'
    },
    {
      title: "Privacy & Security",
      icon: "shield",
      iconLib: Feather,
      path: '/(tabs)/Home'
    },
    {
      title: "Help Center",
      icon: "help-circle",
      iconLib: Feather,
      path: '/(tabs)/Home'
    },
  ];

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.colors.surface }}
      showsVerticalScrollIndicator={false}
    >
      {/* Cover Photo */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
        }}
        style={styles.cover}
      />

      {/* Profile Card */}
      <Card style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: theme.colors.accent || theme.colors.GREEN }]}>
          <Txt 
            size={theme.fontSize.xxxl} 
            bold 
            color={theme.colors.white}
          >
            {(form.name || "U")[0].toUpperCase()}
          </Txt>
        </View>

        {isEditing ? (
          <View style={{ width: '100%', gap: 10 }}>
            <ProfileInput
              placeholder="Name"
              value={form.name}
              onChangeText={(value) => updateForm('name', value)}
              theme={theme}
            />
            <ProfileInput
              placeholder="Email"
              value={form.email}
              onChangeText={(value) => updateForm('email', value)}
              keyboardType="email-address"
              theme={theme}
            />
            <ProfileInput
              placeholder="Age"
              value={form.age}
              onChangeText={(value) => updateForm('age', value)}
              keyboardType="numeric"
              theme={theme}
            />
            <ProfileInput
              placeholder="Gender"
              value={form.gender}
              onChangeText={(value) => updateForm('gender', value)}
              theme={theme}
            />
            <ProfileInput
              placeholder="Goal (e.g., Weight Loss, Muscle Gain)"
              value={form.goal}
              onChangeText={(value) => updateForm('goal', value)}
              theme={theme}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: theme.colors.accent || theme.colors.GREEN }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.white} size="small" />
                ) : (
                  <Txt size={theme.fontSize.md} bold color={theme.colors.white}>
                    Save
                  </Txt>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.cancelBtn, { backgroundColor: theme.colors.textSecondary }]}
                onPress={handleCancel}
                disabled={saving}
              >
                <Txt size={theme.fontSize.md} bold color={theme.colors.white}>
                  Cancel
                </Txt>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
              {user?.name || "User"}
            </Txt>
            <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary} style={{ marginBottom: 8 }}>
              {user?.email || "user@email.com"}
            </Txt>
            
            {user?.gender && (
              <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
                Gender: {user.gender}
              </Txt>
            )}
            {user?.goal && (
              <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
                Goal: {user.goal}
              </Txt>
            )}

            <TouchableOpacity 
              style={[styles.editBtn, { 
                borderColor: theme.colors.accent || theme.colors.GREEN,
                marginTop: 12,
              }]}
              onPress={handleEdit}
            >
              <Txt size={theme.fontSize.sm} bold color={theme.colors.accent || theme.colors.GREEN}>
                Edit Profile
              </Txt>
            </TouchableOpacity>
          </>
        )}
      </Card>

      {/* Stats Card */}
      <Card style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
        <StatItem 
          label="Weight" 
          value={isEditing ? null : `${user?.weight || '--'} kg`}
          editValue={form.weight}
          isEditing={isEditing}
          onChangeText={(value) => updateForm('weight', value)}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
        <StatItem 
          label="Height" 
          value={isEditing ? null : `${user?.height || '--'} cm`}
          editValue={form.height}
          isEditing={isEditing}
          onChangeText={(value) => updateForm('height', value)}
          theme={theme}
        />
        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
        <StatItem 
          label="Age" 
          value={isEditing ? null : user?.age || '--'}
          editValue={form.age}
          isEditing={isEditing}
          onChangeText={(value) => updateForm('age', value)}
          theme={theme}
        />
      </Card>

      {/* Premium Plan Card */}
      <View style={[styles.planCard, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.planHeader}>
          <View>
            <Txt size={theme.fontSize.lg} bold color={theme.colors.white}>
              Premium Plan
            </Txt>
            <Txt size={theme.fontSize.xs} color="rgba(255,255,255,0.7)">
              Unlimited AI recommendations
            </Txt>
          </View>
          <View style={styles.activeBadge}>
            <Txt size={theme.fontSize.xs} color={theme.colors.white}>
              Active
            </Txt>
          </View>
        </View>

        <TouchableOpacity style={styles.manageBtn}>
          <Txt size={theme.fontSize.sm} bold color={theme.colors.white}>
            Manage Subscription
          </Txt>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <Card style={[styles.menuCard, { backgroundColor: theme.colors.card }]}>
        {menuOptions.map((item, index) => {
          const IconComponent = item.iconLib;
          return (
            <TouchableOpacity
              key={item.title}
              onPress={() => router.push(item.path)}
              style={[
                styles.menuItem,
                index !== menuOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
              ]}
            >
              <IconComponent name={item.icon} size={22} color={theme.colors.textSecondary} />
              <Txt size={theme.fontSize.md} color={theme.colors.text} style={{ flex: 1 }}>
                {item.title}
              </Txt>
              <MaterialIcons name="chevron-right" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </Card>

      {/* Logout Button */}
      <TouchableOpacity 
        style={[styles.logoutBtn, { backgroundColor: theme.colors.card }]}
        onPress={logOut}
      >
        <Ionicons name="log-out-outline" size={22} color="#E63946" />
        <Txt size={theme.fontSize.md} bold color="#E63946">
          Log Out
        </Txt>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Extracted Components

const ProfileInput = ({ theme, ...props }) => (
  <TextInput
    style={[styles.input, {
      backgroundColor: theme.colors.inputBg,
      borderColor: theme.colors.inputBorder,
      color: theme.colors.text,
      fontSize: theme.fontSize.md,
    }]}
    placeholderTextColor={theme.colors.textSecondary}
    {...props}
  />
);

const StatItem = ({ label, value, editValue, isEditing, onChangeText, theme }) => (
  <View style={styles.statBox}>
    {isEditing ? (
      <TextInput
        style={[styles.statInput, {
          backgroundColor: theme.colors.inputBg,
          borderColor: theme.colors.inputBorder,
          color: theme.colors.text,
          fontSize: theme.fontSize.sm,
        }]}
        placeholder={label}
        value={editValue}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholderTextColor={theme.colors.textSecondary}
      />
    ) : (
      <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
        {value}
      </Txt>
    )}
    <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
      {label}
    </Txt>
  </View>
);

const styles = StyleSheet.create({
  cover: {
    height: 200,
    width: "100%",
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: -50,
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  editBtn: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  statsCard: {
    margin: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
  },
  statBox: { 
    alignItems: "center",
    gap: 4,
  },
  statInput: {
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
    borderWidth: 1,
    width: 70,
  },
  divider: {
    width: 1,
  },
  planCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  manageBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  menuCard: {
    margin: 20,
    overflow: "hidden",
    padding: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
});