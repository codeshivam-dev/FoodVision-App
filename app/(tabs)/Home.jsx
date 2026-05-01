import {
  ScrollView,
  View,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useContext, useEffect, useState, useCallback } from "react";
import { UserContext } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
import Header from "../../components/home/Header";
import TodayProgress from "../../components/home/TodayProgress";
import GenerateRecipeCard from "../../components/home/GenerateRecipeCard";
import TodaysMealPlan from "../../components/home/TodaysMealPlan";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../../components/shared/Button";
import { Txt, Box, Card } from "../../components/UIComponents";
import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import moment from "moment";
import Actions from "../../components/home/Actions";
import ConsultationsSection from "../../components/consultation/ConsultationsSection";

export default function Home() {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const convex = useConvex();
  const { theme } = useTheme();

  const [mealPlan, setMealPlan] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or preferences not set
  useEffect(() => {
    if (!user) {
      router.replace("/auth/SignIn");
      return;
    }

    if (!user?.weight) {
      router.replace("/preferences");
      return;
    }

    fetchAllData();
  }, [user]);

  // Fetch all data in parallel
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([GetTodaysMealPlan(), GetUserConsultations()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [user]);

  const GetTodaysMealPlan = async () => {
    try {
      const result = await convex.query(api.MealPlan.GetTodaysMealPlan, {
        date: moment().format("DD/MM/YYYY"),
        uid: user?._id,
      });
      setMealPlan(result || []);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      setMealPlan([]);
    }
  };

  const GetUserConsultations = async () => {
    try {
      if (user?._id) {
        const result = await convex.query(
          api.Consultations.getUserConsultations,
          {
            userId: user._id,
          },
        );
        setConsultations(result || []);
      }
    } catch (error) {
      console.error("Error fetching consultations:", error);
      setConsultations([]);
    }
  };


  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.surface }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Box style={{ padding: 20, gap: 20 }}>
        {/* Header Section */}
        <Header name={user?.name} />

        {/* Daily Progress */}
        <TodayProgress />

        {/* <Actions /> */}

        {/* AI Recipe Generator */}
        {/* <GenerateRecipeCard /> */}

        {/* Consult a Nutritionist CTA */}
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.accent || theme.colors.GREEN,
            padding: 16,
            borderRadius: theme.borderRadius.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            ...theme.shadows.medium,
          }}
          onPress={() => router.push("/consultancy")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="doctor"
            size={22}
            color={theme.colors.white}
          />
          <Txt size={theme.fontSize.md} bold color={theme.colors.white}>
            Consult a Nutritionist
          </Txt>
        </TouchableOpacity>

        {/* List of consulations */}
        {/* <ConsultationsSection consultations={consultations} /> */}

        {/* Today's Meals Section */}
        <View style={{ gap: 10 }}>
          <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
            Today's Meals
          </Txt>

          {mealPlan.length === 0 ? (
            <Card style={{ alignItems: "center", padding: 24, gap: 12 }}>
              <MaterialCommunityIcons
                name="food-off"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Txt
                size={theme.fontSize.md}
                color={theme.colors.textSecondary}
                style={{ textAlign: "center" }}
              >
                No meals planned for today
              </Txt>
              <Button
                title="Create New Meal Plan"
                onPress={() => router.push("/generate-ai-recipe")}
                style={{ width: "80%" }}
              />
            </Card>
          ) : (
            <TodaysMealPlan
              mealPlan={mealPlan}
              refreshData={GetTodaysMealPlan}
            />
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </Box>
    </ScrollView>
  );
}
