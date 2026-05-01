import { TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Txt } from "../UIComponents";

export default function ConsultationCard({ consultation, type, onPress }) {
  const { theme } = useTheme();

  const isUpcoming = type === "upcoming";
  const iconName = isUpcoming ? "calendar-clock" : "check-circle";

  const bgColor = isUpcoming
    ? theme.colors.primary
    : theme.colors.accent || theme.colors.GREEN;

  const statusText = isUpcoming
    ? `${consultation.slot?.date} at ${consultation.slot?.time}`
    : "Completed";

  const titleText = isUpcoming
    ? "Upcoming Consultation"
    : "Recent Consultation";

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.borderRadius.md,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        ...theme.shadows.small,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          backgroundColor: bgColor,
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={22}
          color={theme.colors.white}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
          {titleText}
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
          {consultation.nutritionist?.user?.name || "Nutritionist"} •{" "}
          {statusText}
        </Txt>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
}