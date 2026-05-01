// components/RecipeSteps.jsx
import { View, FlatList, StyleSheet } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Txt } from './UIComponents';

export default function RecipeSteps({ recipeDetail }) {
  const { theme } = useTheme();
  const steps = recipeDetail?.jsonData?.steps || [];

  // Empty state
  if (steps.length === 0) {
    return (
      <View style={[styles.emptyContainer, { 
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
      }]}>
        <Ionicons 
          name="document-text-outline" 
          size={32} 
          color={theme.colors.textSecondary} 
        />
        <Txt 
          size={theme.fontSize.sm} 
          color={theme.colors.textSecondary}
          style={{ textAlign: 'center' }}
        >
          No cooking instructions available
        </Txt>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 20 }}>
      {/* Section Header */}
      <View style={styles.header}>
        <Ionicons 
          name="list-outline" 
          size={20} 
          color={theme.colors.primary} 
        />
        <Txt size={theme.fontSize.lg} bold color={theme.colors.text}>
          Directions
        </Txt>
        <View style={[styles.stepCount, { backgroundColor: theme.colors.primaryLight }]}>
          <Txt size={theme.fontSize.xs} bold color={theme.colors.primary}>
            {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
          </Txt>
        </View>
      </View>

      {/* Steps List */}
      <FlatList
        data={steps}
        scrollEnabled={false}
        keyExtractor={(item, index) => `step-${index}`}
        renderItem={({ item, index }) => (
          <View style={[styles.stepCard, { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            ...theme.shadows.small,
          }]}>
            {/* Step Number */}
            <View style={[styles.stepNumber, { 
              backgroundColor: index % 2 === 0 
                ? theme.colors.primary 
                : theme.colors.accent || theme.colors.GREEN 
            }]}>
              <Txt size={theme.fontSize.md} bold color={theme.colors.white}>
                {index + 1}
              </Txt>
            </View>

            {/* Step Content */}
            <View style={styles.stepContent}>
              <Txt 
                size={theme.fontSize.md} 
                color={theme.colors.text}
                style={{ lineHeight: 24 }}
              >
                {item}
              </Txt>
            </View>

            {/* Connector Line (except last item) */}
            {index < steps.length - 1 && (
              <View style={[styles.connector, { 
                backgroundColor: theme.colors.divider 
              }]} />
            )}
          </View>
        )}
        contentContainerStyle={{ gap: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepCount: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    position: 'relative',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
    paddingTop: 6,
  },
  connector: {
    position: 'absolute',
    left: 33,
    bottom: -12,
    width: 2,
    height: 12,
  },
});