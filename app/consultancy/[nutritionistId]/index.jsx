import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useTheme } from "../../../context/ThemeContext";
import { Txt, Box, Card } from "../../../components/UIComponents";
import Button from "../../../components/shared/Button";

export default function NutritionistProfile() {
  const { nutritionistId } = useLocalSearchParams();
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile();
  }, [nutritionistId]);

  const getProfile = async () => {
    try {
      const result = await convex.query(
        api.Nutritionists.getNutritionistProfile,
        {
          nutritionistId,
        },
      );
      setProfile(result);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookConsultation = () => {
    router.push(`/consultancy/${nutritionistId}/book`);
  };

  const getNext7Days = () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const next7Days = getNext7Days();
  const availableSlots = (profile?.availableSlots || [])
    .filter((s) => !s.isBooked && next7Days.includes(s.date))
    .slice(0, 8);

  // Loading state
  if (loading) {
    return (
      <Box
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Txt color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading profile...
        </Txt>
      </Box>
    );
  }

  // Not found state
  if (!profile) {
    return (
      <Box
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons
          name="person-outline"
          size={48}
          color={theme.colors.textSecondary}
        />
        <Txt size={18} bold color={theme.colors.text} style={{ marginTop: 12 }}>
          Profile Not Found
        </Txt>
        <Button
          title="Go Back"
          variant="outline"
          onPress={() => router.back()}
          style={{ marginTop: 20, width: "60%" }}
        />
      </Box>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <Box
        style={[styles.profileHeader, { backgroundColor: theme.colors.card }]}
      >
        <Image
          source={
            profile?.user?.picture
              ? { uri: profile.user.picture }
              : require("../../../assets/images/user.png")
          }
          style={[styles.avatar, { borderColor: theme.colors.primary }]}
        />
        <Txt
          size={theme.fontSize.xxl}
          bold
          color={theme.colors.text}
          style={{ marginTop: 12 }}
        >
          {profile?.user?.name || "Unknown"}
        </Txt>

        <View
          style={[
            styles.degreeBadge,
            { backgroundColor: theme.colors.primaryLight },
          ]}
        >
          <MaterialIcons name="school" size={14} color={theme.colors.primary} />
          <Txt size={theme.fontSize.sm} bold color={theme.colors.primary}>
            {profile?.degree || "Nutritionist"}
          </Txt>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Txt size={theme.fontSize.xl} bold color={theme.colors.text}>
              {profile?.experienceYears || 0}
            </Txt>
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              Years Exp
            </Txt>
          </View>
          <View
            style={[
              styles.statDivider,
              { backgroundColor: theme.colors.divider },
            ]}
          />
          <View style={styles.statItem}>
            <Txt size={theme.fontSize.xl} bold color={theme.colors.text}>
              ${profile?.consultationFee || "--"}
            </Txt>
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              Per Session
            </Txt>
          </View>
          <View
            style={[
              styles.statDivider,
              { backgroundColor: theme.colors.divider },
            ]}
          />
          <View style={styles.statItem}>
            <Txt size={theme.fontSize.xl} bold color={theme.colors.text}>
              {availableSlots.length}
            </Txt>
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              Slots Open
            </Txt>
          </View>
        </View>
      </Box>

      {/* About Section */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
            About
          </Txt>
        </View>

        {profile?.bio && (
          <Txt
            size={theme.fontSize.md}
            color={theme.colors.textSecondary}
            style={styles.bio}
          >
            {profile.bio}
          </Txt>
        )}

        <View style={styles.infoGrid}>
          {profile?.experienceYears && (
            <View style={styles.infoItem}>
              <MaterialIcons
                name="work-history"
                size={18}
                color={theme.colors.primary}
              />
              <View>
                <Txt
                  size={theme.fontSize.xs}
                  color={theme.colors.textSecondary}
                >
                  Experience
                </Txt>
                <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
                  {profile.experienceYears} years
                </Txt>
              </View>
            </View>
          )}

          {profile?.dietPhilosophy && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="food-apple"
                size={18}
                color={theme.colors.primary}
              />
              <View>
                <Txt
                  size={theme.fontSize.xs}
                  color={theme.colors.textSecondary}
                >
                  Philosophy
                </Txt>
                <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
                  {profile.dietPhilosophy}
                </Txt>
              </View>
            </View>
          )}

          {profile?.clinicAddress && (
            <View style={styles.infoItem}>
              <Ionicons
                name="location-outline"
                size={18}
                color={theme.colors.primary}
              />
              <View>
                <Txt
                  size={theme.fontSize.xs}
                  color={theme.colors.textSecondary}
                >
                  Clinic
                </Txt>
                <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
                  {profile.clinicAddress}
                </Txt>
              </View>
            </View>
          )}

          {profile?.specialization?.length > 0 && (
            <View style={styles.infoItem}>
              <Ionicons
                name="ribbon-outline"
                size={18}
                color={theme.colors.primary}
              />
              <View>
                <Txt
                  size={theme.fontSize.xs}
                  color={theme.colors.textSecondary}
                >
                  Specialization
                </Txt>
                <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
                  {profile.specialization.join(", ")}
                </Txt>
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Consultation Modes */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="videocam-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
            Consultation Modes
          </Txt>
        </View>

        <View style={styles.modesRow}>
          <View
            style={[
              styles.modeCard,
              {
                backgroundColor: profile?.consultationModes?.online
                  ? theme.colors.primaryLight
                  : theme.colors.inputBg,
                borderColor: profile?.consultationModes?.online
                  ? theme.colors.primary + "40"
                  : theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name={
                profile?.consultationModes?.online
                  ? "videocam"
                  : "videocam-outline"
              }
              size={28}
              color={
                profile?.consultationModes?.online
                  ? theme.colors.primary
                  : theme.colors.textSecondary
              }
            />
            <Txt
              size={theme.fontSize.sm}
              bold
              color={
                profile?.consultationModes?.online
                  ? theme.colors.primary
                  : theme.colors.textSecondary
              }
            >
              Online
            </Txt>
            <Txt size={10} color={theme.colors.textSecondary}>
              {profile?.consultationModes?.online ? "Available" : "Unavailable"}
            </Txt>
          </View>

          <View
            style={[
              styles.modeCard,
              {
                backgroundColor: profile?.consultationModes?.offline
                  ? theme.colors.primaryLight
                  : theme.colors.inputBg,
                borderColor: profile?.consultationModes?.offline
                  ? theme.colors.primary + "40"
                  : theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name={
                profile?.consultationModes?.offline
                  ? "people"
                  : "people-outline"
              }
              size={28}
              color={
                profile?.consultationModes?.offline
                  ? theme.colors.primary
                  : theme.colors.textSecondary
              }
            />
            <Txt
              size={theme.fontSize.sm}
              bold
              color={
                profile?.consultationModes?.offline
                  ? theme.colors.primary
                  : theme.colors.textSecondary
              }
            >
              In-Person
            </Txt>
            <Txt size={10} color={theme.colors.textSecondary}>
              {profile?.consultationModes?.offline
                ? "Available"
                : "Unavailable"}
            </Txt>
          </View>
        </View>
      </Card>

      {/* Available Slots */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
            Available Slots
          </Txt>
          <View
            style={[
              styles.slotCount,
              { backgroundColor: theme.colors.primaryLight },
            ]}
          >
            <Txt size={theme.fontSize.xs} color={theme.colors.primary}>
              Next 7 days
            </Txt>
          </View>
        </View>

        {availableSlots.length === 0 ? (
          <View style={styles.emptySlots}>
            <Ionicons
              name="calendar-outline"
              size={32}
              color={theme.colors.textSecondary}
            />
            <Txt color={theme.colors.textSecondary}>
              No available slots at the moment
            </Txt>
          </View>
        ) : (
          <View style={styles.slotsGrid}>
            {availableSlots.map((slot, index) => (
              <View
                key={index}
                style={[
                  styles.slotBadge,
                  {
                    backgroundColor:
                      index === 0
                        ? theme.colors.primary
                        : theme.colors.primaryLight,
                    borderColor:
                      index === 0
                        ? theme.colors.primary
                        : theme.colors.primary + "30",
                  },
                ]}
              >
                <Txt
                  size={theme.fontSize.xs}
                  bold
                  color={
                    index === 0 ? theme.colors.white : theme.colors.primary
                  }
                >
                  {new Date(slot.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Txt>
                <Txt
                  size={11}
                  color={
                    index === 0 ? "rgba(255,255,255,0.8)" : theme.colors.primary
                  }
                >
                  {slot.time}
                </Txt>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Book Button */}
      <View style={styles.bookButton}>
        <Button title="Book Consultation" onPress={handleBookConsultation} />
        <Txt
          size={theme.fontSize.xs}
          color={theme.colors.textSecondary}
          style={{ textAlign: "center", marginTop: 8 }}
        >
          Choose your preferred date and time
        </Txt>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  profileHeader: {
    alignItems: "center",
    padding: 24,
    paddingTop: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  degreeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  quickStats: {
    flexDirection: "row",
    marginTop: 20,
    gap: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statDivider: {
    width: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  slotCount: {
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bio: {
    lineHeight: 24,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  modesRow: {
    flexDirection: "row",
    gap: 12,
  },
  modeCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  emptySlots: {
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  bookButton: {
    marginHorizontal: 20,
    marginTop: 24,
  },
});
