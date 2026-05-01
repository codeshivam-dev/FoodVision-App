import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Txt, Box } from "../../components/UIComponents";

export default function ConsultancyHome() {
  const convex = useConvex();
  const router = useRouter();
  const { theme } = useTheme();

  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getNutritionists();
  }, []);

  const getNutritionists = async () => {
    try {
      const result = await convex.query(api.Nutritionists.getAllNutritionists);
      setNutritionists(result || []);
    } catch (error) {
      console.error("Error fetching nutritionists:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getNutritionists();
    setRefreshing(false);
  }, []);

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
          Finding nutritionists...
        </Txt>
      </Box>
    );
  }

  // Empty state
  if (nutritionists.length === 0) {
    return (
      <Box
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View
          style={[
            styles.emptyIcon,
            { backgroundColor: theme.colors.primaryLight },
          ]}
        >
          <FontAwesome5 name="user-md" size={40} color={theme.colors.primary} />
        </View>
        <Txt size={18} bold color={theme.colors.text} style={{ marginTop: 16 }}>
          No Nutritionists Available
        </Txt>
        <Txt
          color={theme.colors.textSecondary}
          style={{ textAlign: "center", marginTop: 8 }}
        >
          Check back later or explore AI-generated meal plans
        </Txt>
      </Box>
    );
  }

  const renderNutritionist = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderLeftColor:
            index % 2 === 0
              ? theme.colors.primary
              : theme.colors.accent || theme.colors.GREEN,
          ...theme.shadows.small,
        },
      ]}
      onPress={() => router.push(`/consultancy/${item._id}`)}
      activeOpacity={0.7}
    >
      {/* Profile Image */}
      <Image
        source={
          item?.user?.picture
            ? { uri: item.user.picture }
            : require("../../assets/images/user.png")
        }
        style={[
          styles.avatar,
          {
            borderColor:
              index % 2 === 0
                ? theme.colors.primaryLight
                : (theme.colors.accent || theme.colors.GREEN) + "30",
          },
        ]}
      />

      {/* Info Section */}
      <View style={styles.info}>
        {/* Name & Degree */}
        <Txt
          size={theme.fontSize.lg}
          bold
          color={theme.colors.text}
          style={{ marginBottom: 2 }}
        >
          {item?.user?.name || "Unknown"}
        </Txt>

        <View style={styles.degreeRow}>
          <MaterialIcons name="school" size={14} color={theme.colors.primary} />
          <Txt size={theme.fontSize.xs} bold color={theme.colors.primary}>
            {item?.degree || "Nutritionist"}
          </Txt>
        </View>

        {/* Experience & Specialization */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={13}
              color={theme.colors.textSecondary}
            />
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              {item?.experienceYears || 0} yrs exp
            </Txt>
          </View>

          {item?.specialization?.length > 0 && (
            <View style={styles.detailItem}>
              <Ionicons
                name="ribbon-outline"
                size={13}
                color={theme.colors.textSecondary}
              />
              <Txt
                size={theme.fontSize.xs}
                color={theme.colors.textSecondary}
                numberOfLines={1}
                style={{ flex: 1 }}
              >
                {item.specialization.slice(0, 2).join(", ")}
              </Txt>
            </View>
          )}
        </View>

        {/* Rating (if available) */}
        {item?.rating && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              {item.rating.toFixed(1)}
            </Txt>
            <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
              • {item?.reviewCount || 0} reviews
            </Txt>
          </View>
        )}
      </View>

      {/* Price & Arrow */}
      <View style={styles.priceSection}>
        <View
          style={[
            styles.priceBadge,
            {
              backgroundColor: theme.colors.primaryLight,
            },
          ]}
        >
          <Txt size={theme.fontSize.md} bold color={theme.colors.primary}>
            ${item?.consultationFee || "--"}
          </Txt>
          <Txt size={10} color={theme.colors.primary}>
            /session
          </Txt>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <Box style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <Box
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.divider,
          },
        ]}
      >
        <View>
          <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
            Find a Nutritionist
          </Txt>
          <Txt
            size={theme.fontSize.sm}
            color={theme.colors.textSecondary}
            style={{ marginTop: 4 }}
          >
            Connect with expert nutritionists for personalized advice
          </Txt>
        </View>

        {/* Stats Badge */}
        <View
          style={[
            styles.countBadge,
            { backgroundColor: theme.colors.primaryLight },
          ]}
        >
          <Txt size={theme.fontSize.sm} bold color={theme.colors.primary}>
            {nutritionists.length}
          </Txt>
          <Txt size={10} color={theme.colors.primary}>
            Available
          </Txt>
        </View>
      </Box>

      {/* Nutritionists List */}
      <FlatList
        data={nutritionists}
        renderItem={renderNutritionist}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
    </Box>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  countBadge: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    backgroundColor: "#E5E7EB",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  degreeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  priceSection: {
    alignItems: "center",
    gap: 8,
  },
  priceBadge: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
