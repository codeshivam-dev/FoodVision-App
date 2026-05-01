import { View, Image, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { Txt } from './UIComponents';

export default function RecipeIntro({ recipeDetail }) {
  const { theme } = useTheme();
  const RecipeJson = recipeDetail?.jsonData || {};

  // Stats to display
  const recipeStats = [
    {
      icon: <MaterialIcons name="local-fire-department" size={24} color={theme.colors.primary} />,
      label: 'Calories',
      value: RecipeJson?.calories || '--',
      unit: 'kcal',
    },
    {
      icon: <AntDesign name="clockcircle" size={24} color={theme.colors.primary} />,
      label: 'Cook Time',
      value: RecipeJson?.cookTime || '--',
      unit: 'min',
    },
    {
      icon: <Ionicons name="fast-food" size={24} color={theme.colors.primary} />,
      label: 'Servings',
      value: RecipeJson?.serveTo || '--',
      unit: 'serve',
    },
  ];

  return (
    <View>
      {/* Recipe Image */}
      <Image 
        source={{ uri: recipeDetail?.imageURI }} 
        style={styles.image}
        resizeMode="cover"
      />

      {/* Recipe Name Row */}
      <View style={[styles.titleRow, { borderBottomColor: theme.colors.divider }]}>
        <View style={{ flex: 1 }}>
          <Txt size={theme.fontSize.xxl} bold color={theme.colors.text}>
            {recipeDetail?.recipeName || 'Unnamed Recipe'}
          </Txt>
          
          {/* Quick Tags */}
          <View style={styles.tagsRow}>
            {RecipeJson?.difficulty && (
              <View style={[styles.tag, { 
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.border,
              }]}>
                <MaterialIcons 
                  name="speed" 
                  size={12} 
                  color={theme.colors.textSecondary} 
                />
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                  {RecipeJson.difficulty}
                </Txt>
              </View>
            )}
            {RecipeJson?.cuisine && (
              <View style={[styles.tag, { 
                backgroundColor: theme.colors.inputBg,
                borderColor: theme.colors.border,
              }]}>
                <MaterialCommunityIcons 
                  name="chef-hat" 
                  size={12} 
                  color={theme.colors.textSecondary} 
                />
                <Txt size={theme.fontSize.xs} color={theme.colors.textSecondary}>
                  {RecipeJson.cuisine}
                </Txt>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Description */}
      {RecipeJson?.description && (
        <Txt 
          size={theme.fontSize.md} 
          color={theme.colors.textSecondary}
          style={styles.description}
        >
          {RecipeJson.description}
        </Txt>
      )}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {recipeStats.map((stat, index) => (
          <View 
            key={stat.label}
            style={[styles.statCard, { 
              backgroundColor: index === 0 
                ? theme.colors.primaryLight 
                : theme.colors.card,
              borderColor: index === 0 
                ? theme.colors.primary + '30' 
                : theme.colors.border,
              borderWidth: 1,
            }]}
          >
            {/* Icon */}
            <View style={[styles.iconCircle, { 
              backgroundColor: index === 0 
                ? theme.colors.primary + '20' 
                : theme.colors.primaryLight 
            }]}>
              {stat.icon}
            </View>

            {/* Value */}
            <View style={styles.statInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2 }}>
                <Txt 
                  size={theme.fontSize.xl} 
                  bold 
                  color={theme.colors.text}
                >
                  {stat.value}
                </Txt>
                {stat.unit && (
                  <Txt 
                    size={theme.fontSize.xs} 
                    color={theme.colors.textSecondary}
                  >
                    {stat.unit}
                  </Txt>
                )}
              </View>
              
              <Txt 
                size={theme.fontSize.xs} 
                color={theme.colors.textSecondary}
              >
                {stat.label}
              </Txt>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  description: {
    marginTop: 12,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    alignItems: 'center',
    gap: 2,
  },
});