import { View } from "react-native";
import { useRouter } from "expo-router";
import ConsultationCard from "./ConsultationCard";
import EmptyConsultationCard from "./EmptyConsultationCard";
import { Txt } from "../UIComponents";
import { useTheme } from "../../context/ThemeContext";

export default function ConsultationsSection({ consultations = [] }) {
  const { theme } = useTheme();
  const router = useRouter();

  const upcomingConsultation = consultations.find(
    (c) => c.status === "confirmed"
  );

  const recentConsultation = consultations.find(
    (c) => c.status === "completed"
  );

  const handleNavigate = (id) => {
    router.push(`/consultancy/details/${id}`);
  };

  return (
    <View style={{ gap: 10 }}>
      <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
        My Consultations
      </Txt>

      <View style={{ gap: 10 }}>
        {upcomingConsultation ? (
          <ConsultationCard
            consultation={upcomingConsultation}
            type="upcoming"
            onPress={() => handleNavigate(upcomingConsultation._id)}
          />
        ) : (
          <EmptyConsultationCard />
        )}

        {recentConsultation && (
          <ConsultationCard
            consultation={recentConsultation}
            type="completed"
            onPress={() => handleNavigate(recentConsultation._id)}
          />
        )}
      </View>
    </View>
  );
}