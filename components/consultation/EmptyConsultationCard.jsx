import { View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Txt } from "../UIComponents";


export default function EmptyConsultationCard() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.borderRadius.md,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        opacity: 0.7,
        ...theme.shadows.small,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.inputBg,
          width: 44,
          height: 44,
          borderRadius: 22,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialCommunityIcons
          name="calendar-blank"
          size={22}
          color={theme.colors.textSecondary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Txt size={theme.fontSize.md} bold color={theme.colors.textSecondary}>
          No Upcoming Consultations
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
          Book your first consultation today
        </Txt>
      </View>
    </View>
  );
}