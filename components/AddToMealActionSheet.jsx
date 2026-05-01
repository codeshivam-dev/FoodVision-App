import { View, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import Button from './shared/Button';
import { Txt } from './UIComponents';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

const mealOptions = [
  {
    id: '1',
    name: 'Breakfast',
    icon: '🍳',
    timeIcon: 'sunny-outline',
  },
  {
    id: '2',
    name: 'Lunch',
    icon: '🥪',
    timeIcon: 'sunny',
  },
  {
    id: '3',
    name: 'Dinner',
    icon: '🍝',
    timeIcon: 'moon-outline',
  },
  {
    id: '4',
    name: 'Snacks',
    icon: '🍎',
    timeIcon: 'cafe-outline',
  },
];

export default function AddToMealActionSheet({ recipeDetail, hideActionSheet }) {
  const { theme } = useTheme();
  const [dateList, setDateList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [loading, setLoading] = useState(false);

  const CreateMealPlan = useMutation(api.MealPlan.CreateMealPlan);

  // Generate next 4 dates
  const generateDates = () => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      const nextDate = moment().add(i, 'days').format('DD/MM/YYYY');
      result.push(nextDate);
    }
    setDateList(result);
  };

  useEffect(() => {
    generateDates();
  }, []);

  const getDayInfo = (dateStr) => {
    const date = moment(dateStr, 'DD/MM/YYYY');
    const today = moment().format('DD/MM/YYYY');
    return {
      day: date.format('ddd'),
      date: date.format('DD'),
      month: date.format('MMM'),
      isToday: dateStr === today,
    };
  };

  const handleAddToMealPlan = async () => {
    if (!selectedDate || !selectedMeal) {
      Alert.alert(
        'Missing Selection',
        'Please select both date and meal type',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      await CreateMealPlan({
        date: selectedDate,
        mealType: selectedMeal,
        calories: recipeDetail?.jsonData?.calories || 0,
        recipeId: recipeDetail?._id,
        uid: recipeDetail?.uid,
        completed: false,
      });

      Alert.alert(
        'Success! 🎉',
        `${recipeDetail?.recipeName || 'Recipe'} added to ${selectedMeal} on ${moment(selectedDate, 'DD/MM/YYYY').format('MMM DD')}`,
        [{ text: 'OK', onPress: hideActionSheet }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to add meal plan. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Handle Bar */}
      <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />

      {/* Header */}
      <View style={styles.header}>
        <Txt size={theme.fontSize.xl} bold color={theme.colors.text}>
          Add to Meal Plan
        </Txt>
        <Txt size={theme.fontSize.sm} color={theme.colors.textSecondary}>
          Schedule this recipe for later
        </Txt>
      </View>

      {/* Selected Recipe Preview */}
      <View style={[styles.recipePreview, { 
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary + '30',
      }]}>
        <Ionicons name="restaurant" size={20} color={theme.colors.primary} />
        <Txt size={theme.fontSize.sm} bold color={theme.colors.primary} style={{ flex: 1 }}>
          {recipeDetail?.recipeName || 'Selected Recipe'}
        </Txt>
        <Txt size={theme.fontSize.xs} color={theme.colors.primary}>
          {recipeDetail?.jsonData?.calories || '--'} kcal
        </Txt>
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
            Select Date
          </Txt>
        </View>

        <FlatList
          data={dateList}
          numColumns={4}
          scrollEnabled={false}
          keyExtractor={(item) => item}
          columnWrapperStyle={styles.dateRow}
          renderItem={({ item }) => {
            const { day, date, month, isToday } = getDayInfo(item);
            const isSelected = selectedDate === item;

            return (
              <TouchableOpacity
                onPress={() => setSelectedDate(item)}
                activeOpacity={0.7}
                style={[
                  styles.dateCard,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    ...(!isSelected && theme.shadows.small),
                  },
                ]}
              >
                <Txt
                  size={theme.fontSize.xs}
                  bold
                  color={isSelected ? theme.colors.white : theme.colors.textSecondary}
                >
                  {day}
                </Txt>
                <Txt
                  size={theme.fontSize.xl}
                  bold
                  color={isSelected ? theme.colors.white : theme.colors.text}
                >
                  {date}
                </Txt>
                <Txt
                  size={theme.fontSize.xs}
                  color={isSelected ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary}
                >
                  {month}
                </Txt>
                {isToday && (
                  <View style={[styles.todayDot, { 
                    backgroundColor: isSelected ? theme.colors.white : theme.colors.primary 
                  }]} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Meal Type Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="restaurant-outline" size={18} color={theme.colors.primary} />
          <Txt size={theme.fontSize.md} bold color={theme.colors.text}>
            Select Meal Type
          </Txt>
        </View>

        <FlatList
          data={mealOptions}
          numColumns={4}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.mealRow}
          renderItem={({ item }) => {
            const isSelected = selectedMeal === item.name;

            return (
              <TouchableOpacity
                onPress={() => setSelectedMeal(item.name)}
                activeOpacity={0.7}
                style={[
                  styles.mealCard,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    ...(!isSelected && theme.shadows.small),
                  },
                ]}
              >
                <Txt size={28}>
                  {item.icon}
                </Txt>
                <Txt
                  size={theme.fontSize.xs}
                  bold
                  color={isSelected ? theme.colors.white : theme.colors.text}
                  style={{ textAlign: 'center' }}
                >
                  {item.name}
                </Txt>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="+ Add to Meal Plan"
          onPress={handleAddToMealPlan}
          loading={loading}
        />

        <TouchableOpacity
          onPress={hideActionSheet}
          style={[styles.cancelButton, { borderColor: theme.colors.border }]}
        >
          <Txt
            size={theme.fontSize.md}
            color={theme.colors.textSecondary}
            style={{ textAlign: 'center' }}
          >
            Cancel
          </Txt>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
  },
  recipePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateRow: {
    gap: 8,
  },
  dateCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 2,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  mealRow: {
    gap: 8,
  },
  mealCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
});