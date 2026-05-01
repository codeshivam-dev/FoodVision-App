import { TouchableOpacity, StyleSheet, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { Txt } from "../UIComponents";

export default function GenerateRecipeCard() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  // Different gradients for light/dark mode
  const gradientColors = isDark 
    ? [theme.colors.primary, '#4A1D96', '#2D0A5C']
    : [theme.colors.primary, '#9B5DE5', theme.colors.blue];

  return (
    <LinearGradient 
      colors={gradientColors} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Top decoration */}
      <View style={styles.topDecor}>
        <View style={styles.sparkleContainer}>
          <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.6)" />
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.textSection}>
          <Txt size={24} bold color={theme.colors.white} style={styles.title}>
            AI Recipe Generator
          </Txt>
          
          <Txt 
            size={14} 
            color="rgba(255,255,255,0.8)"
            style={styles.description}
          >
            Create personalized meals with the power of artificial intelligence
          </Txt>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={() => router.push('/generate-ai-recipe')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']}
            style={styles.buttonGradient}
          >
            <Ionicons name="flame-outline" size={20} color="#FFF" />
            <Txt size={15} bold color={theme.colors.white}>
              Generate Recipe
            </Txt>
            <FontAwesome6 name="arrow-right" size={14} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Features */}
      <View style={styles.features}>
        {['AI-Powered', 'Personalized', 'Quick & Easy'].map((feature, index) => (
          <View key={feature} style={styles.featureTag}>
            <Txt size={10} color="rgba(255,255,255,0.9)">
              ✦ {feature}
            </Txt>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
    minHeight: 180,
  },
  topDecor: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sparkleContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    gap: 8,
  },
  title: {
    letterSpacing: 0.5,
  },
  description: {
    lineHeight: 20,
    opacity: 0.85,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  features: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  featureTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});