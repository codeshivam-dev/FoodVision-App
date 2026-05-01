import { View, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Txt } from './UIComponents';

export default function RecipeIngredients({ recipeDetail }) {
  const { theme } = useTheme();
  const ingredients = recipeDetail?.jsonData?.ingredients || [];

  // Empty state
  if (!ingredients || ingredients.length === 0) {
    return (
      <View style={[styles.emptyContainer, { 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderWidth: 1,
      }]}>
        <Ionicons 
          name="leaf-outline" 
          size={36} 
          color={theme.colors.textSecondary} 
        />
        <Txt 
          size={theme.fontSize.sm} 
          color={theme.colors.textSecondary}
          style={{ textAlign: 'center' }}
        >
          No ingredients listed for this recipe
        </Txt>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 20 }}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons 
            name="nutrition-outline" 
            size={20} 
            color={theme.colors.accent || theme.colors.GREEN} 
          />
          <Txt size={theme.fontSize.xl} bold color={theme.colors.text}>
            Ingredients
          </Txt>
        </View>
        
        <View style={[styles.countBadge, { 
          backgroundColor: theme.colors.primaryLight 
        }]}>
          <Txt size={theme.fontSize.sm} bold color={theme.colors.primary}>
            {ingredients.length} {ingredients.length === 1 ? 'Item' : 'Items'}
          </Txt>
        </View>
      </View>

      {/* Ingredients List */}
      <FlatList 
        data={ingredients}
        scrollEnabled={false}
        keyExtractor={(item, index) => `ingredient-${index}`}
        renderItem={({ item, index }) => (
          <View style={[
            styles.ingredientRow,
            { 
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            index === ingredients.length - 1 && { marginBottom: 0 }
          ]}>
            {/* Left: Icon + Name */}
            <View style={styles.ingredientLeft}>
              {/* Icon Container */}
              <View style={[styles.iconBox, { 
                backgroundColor: index % 2 === 0 
                  ? theme.colors.primaryLight 
                  : (theme.colors.accent || theme.colors.GREEN) + '20'
              }]}>
                <Txt size={theme.fontSize.xl}>
                  {item?.icon || '🥘'}
                </Txt>
              </View>
              
              {/* Ingredient Name */}
              <Txt 
                size={theme.fontSize.md} 
                bold 
                color={theme.colors.text}
                style={{ flex: 1 }}
              >
                {item?.ingredient || 'Unknown Ingredient'}
              </Txt>
            </View>

            {/* Right: Quantity */}
            <View style={[styles.quantityBadge, { 
              backgroundColor: theme.colors.inputBg,
              borderColor: theme.colors.border,
            }]}>
              <Txt 
                size={theme.fontSize.sm} 
                bold 
                color={theme.colors.primary}
              >
                {item?.quantity || 'To taste'}
              </Txt>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
  },
});