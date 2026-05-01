import { View, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Txt } from "../UIComponents";
import Button from "../shared/Button";

export default function MealCard({ meal, onPress }) {
  const { theme } = useTheme();

  const nutritionData = [
    { label: "Cal", value: meal?.jsonData?.calories ?? "--", unit: "" },
    { label: "Prot", value: meal?.jsonData?.protien ?? "--", unit: "g" },
    { label: "Carb", value: meal?.jsonData?.carbs ?? "--", unit: "g" },
    { label: "Fat", value: meal?.jsonData?.fats ?? "--", unit: "g" },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          ...theme.shadows.small,
        },
      ]}
    >
      <Image
        source={{
          uri: meal?.imageURI || "https://via.placeholder.com/400x300",
        }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Txt
          size={theme.fontSize.lg}
          bold
          color={theme.colors.text}
          style={{ marginBottom: 10 }}
        >
          {meal?.recipeName || "Unnamed Recipe"}
        </Txt>

        {/* Nutrition Grid */}
        <View style={styles.grid}>
          {nutritionData.map((nut, index) => (
            <View
              key={index}
              style={[
                styles.nutBox,
                {
                  backgroundColor: theme.colors.inputBg,
                  borderRadius: theme.borderRadius.sm,
                },
              ]}
            >
              <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                {nut.label}
              </Txt>
              <Txt size={theme.fontSize.sm} bold color={theme.colors.text}>
                {nut.value}
                {nut.unit}
              </Txt>
            </View>
          ))}
        </View>

        {/* Cook Time */}
        <View
          style={[
            styles.timeBadge,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.inputBg,
            },
          ]}
        >
          <MaterialIcons
            name="schedule"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Txt
            size={theme.fontSize.xs}
            color={theme.colors.textSecondary}
            style={{ marginLeft: 4 }}
          >
            {meal?.jsonData?.cookTime ?? "N/A"} min
          </Txt>
        </View>

        <Button
          title="View Recipe Details"
          onPress={onPress}
          style={{ marginTop: 12 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#DDD",
  },
  content: {
    padding: 16,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 6,
  },
  nutBox: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    gap: 2,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
});