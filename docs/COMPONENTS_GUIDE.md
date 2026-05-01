# FoodVision Component Library

## Quick Reference for All Reusable Components

### Base Components (UIComponents.jsx)

| Component | Props | Usage |
|-----------|-------|-------|
| **Box** | `bg`, `style`, `children` | Container with theme background |
| **Card** | `variant` (elevated/flat/outlined), `style` | Elevated container for content |
| **Txt** | `size`, `bold`, `color`, `children` | Themed text |
| **Button** | `title`, `variant`, `loading`, `onPress` | Action button |
| **Input** | `label`, `icon`, `rightIcon`, `error` | Form input |
| **Badge** | `title`, `color` | Small label/tag |
| **Divider** | `style` | Horizontal separator |

### Home Components

| Component | File | Purpose |
|-----------|------|---------|
| **Header** | `home/Header.jsx` | Dynamic greeting with time-based message |
| **TodayProgress** | `home/TodayProgress.jsx` | Calorie & macro tracking bar |
| **GenerateRecipeCard** | `home/GenerateRecipeCard.jsx` | AI recipe generator CTA |
| **MealCard** | `home/MealCard.jsx` | Individual meal with checkbox |
| **TodaysMealPlan** | `home/TodaysMealPlan.jsx` | Grouped meal plan list |
| **Actions** | `home/Actions.jsx` | Quick action buttons |

### Shared Components

| Component | File | Props |
|-----------|------|-------|
| **Button** | `shared/Button.jsx` | `title`, `onPress`, `loading`, `variant`, `disabled` |
| **Input** | `shared/Input.jsx` | `placeholder`, `onChangeText`, `password`, `label`, `leftIcon`, `rightIcon` |
| **LoadingDialog** | `shared/LoadingDialog.jsx` | `loading`, `message` |

### Recipe Components

| Component | File | Data Source |
|-----------|------|-------------|
| **RecipeIntro** | `RecipeIntro.jsx` | `recipeDetail.jsonData` |
| **RecipeIngredients** | `RecipeIngredients.jsx` | `recipeDetail.jsonData.ingredients` |
| **RecipeSteps** | `RecipeSteps.jsx` | `recipeDetail.jsonData.steps` |
| **RecipeOptionList** | `RecipeOptionList.jsx` | AI generated options |
| **AddToMealActionSheet** | `AddToMealActionSheet.jsx` | Meal type & date selection |