
# FoodVision Developer Guide

> A complete guide for developers to understand, set up, and contribute to FoodVision.

---

## Table of Contents

- [Quick Start](#-quick-start)
- [Project Overview](#-project-overview)
- [Folder Structure Deep Dive](#-folder-structure-deep-dive)
- [Tech Stack Explained](#-tech-stack-explained)
- [Core Concepts](#-core-concepts)
- [Theme System](#-theme-system)
- [Component Library](#-component-library)
- [Navigation Flow](#-navigation-flow)
- [State Management](#-state-management)
- [Database Schema](#-database-schema)
- [API Integration](#-api-integration)
- [Common Patterns](#-common-patterns)
- [Adding New Features](#-adding-new-features)
- [Debugging Guide](#-debugging-guide)
- [Deployment](#-deployment)

---

## Quick Start

### 5-Minute Setup

```bash
# 1. Clone
git clone https://github.com/shivamEr/FoodVision-App.git
cd FoodVision-App

# 2. Install
npm install

# 3. Environment (create .env.local)
# Get keys from: Firebase Console, Convex Dashboard, OpenRouter

# 4. Start backend
npx convex dev

# 5. Start app
npx expo start
```

### Required Accounts
- **Firebase** – For authentication only
- **Convex** – Database & backend functions
- **OpenRouter** – AI model access

---

## Project Overview

**FoodVision** is a dual-role mobile app:
- **User Mode** – AI diet planning & meal tracking
- **Nutritionist Mode** – Client management & consultation

### Key Numbers
- **2 User Roles**: User & Nutritionist
- **4 Main Tabs**: Home, Meals, Progress, Profile
- **30+ Screens**: Complete mobile experience
- **10+ Components**: Reusable UI library

---

## Folder Structure Deep Dive

```
FoodVision-App/
│
├── 📱 app/                          #  All screens (Expo Router)
│   ├── (tabs)/                      #   USER TAB NAVIGATION
│   │   ├── _layout.jsx              #   Tab bar configuration
│   │   ├── Home.jsx                 #   Dashboard with daily progress
│   │   ├── Meals.jsx                #   Recipe discovery & AI recipes
│   │   ├── Progress.jsx             #   Stats, charts & achievements
│   │   └── Profile.jsx              #   User settings & edit profile
│   │
│   ├── (nutritionist)/              # NUTRITIONIST SECTION
│   │   ├── (tabs)/                  #   Nutritionist tabs
│   │   │   ├── _layout.jsx          #   Tab configuration
│   │   │   ├── Dashboard.jsx        #   Stats & upcoming sessions
│   │   │   ├── Clients.jsx          #   Client list with search
│   │   │   ├── Plans.jsx            #   Diet plans overview
│   │   │   └── Profile.jsx          #   Professional profile
│   │   ├── client/
│   │   │   └── [clientId].jsx       #   Individual client details
│   │   └── consultation/
│   │       └── [consultationId]/
│   │           ├── start.jsx        #   Start session page
│   │           ├── notes.jsx        #   Session notes entry
│   │           └── plan.jsx         #   Create/edit diet plan
│   │
│   ├── auth/                        #  AUTHENTICATION
│   │   ├── SignIn.jsx               #   Login screen
│   │   └── SignUp.jsx               #   Registration screen
│   │
│   ├── consultancy/                 #  BOOKING FLOW
│   │   ├── index.jsx                #   Nutritionist listing
│   │   ├── [nutritionistId]/
│   │   │   ├── index.jsx            #   Profile view
│   │   │   ├── book.jsx             #   Slot booking
│   │   │   └── form.jsx             #   Pre-consultation form
│   │   ├── confirmation/
│   │   │   └── [consultationId].jsx #   Booking confirmation
│   │   ├── details/
│   │   │   └── [consultationId].jsx #   Consultation details
│   │   └── plan/
│   │       └── [consultationId].jsx #   View diet plan
│   │
│   ├── generate-ai-recipe/          #  AI RECIPE GENERATOR
│   │   └── index.jsx                #   Generate recipes with AI
│   │
│   ├── recipe-detail/               #  RECIPE DETAILS
│   │   └── index.jsx                #   Full recipe with nutrition
│   │
│   ├── preferences/                 #  USER ONBOARDING
│   │   └── index.jsx                #   Goals & body metrics
│   │
│   ├── _layout.jsx                  #  ROOT LAYOUT
│   └── index.jsx                    #  LANDING PAGE
│
├── components/                   # Reusable UI components
│   ├── home/                        #   Home screen specific
│   │   ├── Header.jsx               #     Dynamic greeting header
│   │   ├── TodayProgress.jsx        #     Calorie/macro progress
│   │   ├── GenerateRecipeCard.jsx   #     AI recipe CTA card
│   │   ├── MealCard.jsx             #     Individual meal display
│   │   ├── TodaysMealPlan.jsx       #     Meal plan list
│   │   └── Actions.jsx              #     Quick action buttons
│   │
│   ├── shared/                      #   Shared utilities
│   │   ├── Button.jsx               #     Themed button component
│   │   ├── Input.jsx                #     Themed input with icons
│   │   └── LoadingDialog.jsx        #     Loading modal overlay
│   │
│   ├── UIComponents.jsx             #    BASE COMPONENTS
│   │                                #     Box, Card, Txt, Button,
│   │                                #     Input, Badge, Divider
│   │
│   ├── RecipeIntro.jsx              #   Recipe header with image
│   ├── RecipeIngredients.jsx        #   Ingredients list
│   ├── RecipeSteps.jsx              #   Cooking instructions
│   ├── RecipeOptionList.jsx         #   AI recipe options
│   └── AddToMealActionSheet.jsx     #   Meal slot selector
│
├── context/                      # State management
│   ├── ThemeContext.jsx             #   Light/Dark mode
│   └── UserContext.jsx              #   User state
│
├── convex/                       # Backend (auto-generated)
│   └── _generated/
│       └── api.js                   #   Type-safe API
│
├── services/                     # External integrations
│   ├── FirebasConfig.js             #   Firebase setup
│   └── AiModel.js                   #   OpenRouter AI calls
│
├── shared/                       # Constants & utils
│   ├── Colors.jsx                   #   Theme definitions
│   └── Prompt.jsx                   #   AI prompt templates
│
└── assets/                       # Static resources
    └── images/                      #   Icons & backgrounds
```

---

## Tech Stack Explained

| Technology | What it Does | Why We Use It |
|-----------|-------------|---------------|
| **Expo (React Native)** | Cross-platform mobile framework | Write once, run on iOS & Android |
| **Expo Router** | File-based navigation | Automatic routing from file structure |
| **Convex** | Real-time backend | Serverless, type-safe, live queries |
| **Firebase Auth** | User authentication | Secure email/password auth |
| **OpenRouter** | AI model access | Access to GPT/Gemini for meal plans |
| **AsyncStorage** | Local data persistence | Save theme preference, cache data |
| **React Native Reanimated** | Animations | Smooth UI transitions |
| **Expo Vector Icons** | Icon library | Ionicons, Material Icons, etc. |

---

## Core Concepts

### 1. **Theme System**

How theming works in FoodVision:

```javascript
// Access theme anywhere
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  // Use theme colors
  <View style={{ backgroundColor: theme.colors.background }}>
    <Text style={{ color: theme.colors.text }}>Hello</Text>
  </View>
  
  // Use spacing
  <View style={{ padding: theme.spacing.md }}>
  
  // Use border radius
  <View style={{ borderRadius: theme.borderRadius.md }}>
}
```

**Theme Structure:**
- `theme.colors` – All color values
- `theme.spacing` – Consistent spacing (xs, sm, md, lg, xl)
- `theme.borderRadius` – Rounded corners
- `theme.fontSize` – Text sizes
- `theme.fontWeight` – Font weights
- `theme.shadows` – Shadow presets

### 2. **Base Components (UIComponents.jsx)**

Always use these instead of React Native primitives:

```javascript
import { Box, Card, Txt, Button, Input, Badge, Divider } from '../components/UIComponents';

// Box - Themed View with automatic background
<Box>                           // Default: theme.colors.background
<Box bg="surface">              // Surface background
<Box bg="card">                 // Card background
<Box bg="transparent">          // No background

// Card - Elevated container
<Card>                          // Elevated card
<Card variant="flat">           // Flat card
<Card variant="outlined">       // Bordered card

// Txt - Themed Text
<Txt>                           // Body text
<Txt bold>                       // Bold text
<Txt size={30}>                 // Custom size
<Txt color="red">               // Custom color

// Button - Themed button
<Button title="Click">          // Primary button
<Button variant="outline">      // Outline button
<Button variant="ghost">        // Ghost button
<Button loading={true}>         // Loading state

// Input - Themed text input
<Input label="Email" icon={<Icon/>} />

// Badge - Small label
<Badge title="New" color={theme.colors.primary} />

// Divider - Horizontal line
<Divider />
```

### 3. **User Roles & Routing**

```javascript
// How role-based routing works:

// In app/index.jsx (Landing page)
useEffect(() => {
  // Check auth state
  onAuthStateChanged(auth, async (user) => {
    const userData = await convex.query(api.Users.GetUser, {
      email: user.email
    });
    
    // Route based on role
    if (userData?.role === 'nutritionist') {
      router.replace('/(nutritionist)/(tabs)/Dashboard');
    } else if (userData?.role === 'user') {
      router.replace('/(tabs)/Home');
    }
  });
}, []);
```

---

## Navigation Flow

### User Journey
```
Landing → Sign In → Home (Tabs)
                    ├── Home Dashboard
                    ├── Meals → Recipe Detail
                    ├── Progress
                    └── Profile

Home Actions:
  → Generate AI Recipe
  → Consult Nutritionist
  → Track Meals
```

### Nutritionist Journey
```
Landing → Sign In → Dashboard (Tabs)
                    ├── Dashboard
                    ├── Clients → Client Detail
                    ├── Plans → Edit Plan
                    └── Profile

Consultation Flow:
  Start → Notes → Create Plan → Complete
```

---

## State Management

### **UserContext**
```javascript
// Provides global user state
const { user, setUser } = useContext(UserContext);

// user shape:
{
  _id: string,
  name: string,
  email: string,
  role: 'user' | 'nutritionist',
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female' | 'other',
  goal: 'lose' | 'gain' | 'muscle',
  calories: number,  // Daily calorie goal
  preferences: {}
}
```

### **ThemeContext**
```javascript
// Manages light/dark mode
const { theme, isDark, toggleTheme } = useTheme();

// Persisted to AsyncStorage
```

---

## Database Schema (Convex)

### Key Tables:

**Users**
```typescript
{
  _id: Id<"users">,
  name: string,
  email: string,
  role: "user" | "nutritionist",
  weight?: number,
  height?: number,
  age?: number,
  gender?: string,
  goal?: string,
  calories?: number,
}
```

**Recipes**
```typescript
{
  _id: Id<"recipes">,
  recipeName: string,
  imageURI: string,
  jsonData: {
    calories: number,
    protein: number,
    carbs: number,
    fats: number,
    cookTime: string,
    ingredients: Array<{icon: string, ingredient: string, quantity: string}>,
    steps: string[],
  },
  uid: Id<"users">,
}
```

**MealPlan**
```typescript
{
  _id: Id<"mealPlan">,
  uid: Id<"users">,
  recipeId: Id<"recipes">,
  date: string,        // "DD/MM/YYYY"
  mealType: string,    // "Breakfast" | "Lunch" | "Dinner" | "Snacks"
  completed: boolean,
}
```

**Consultations**
```typescript
{
  _id: Id<"consultations">,
  userId: Id<"users">,
  nutritionistId: Id<"nutritionists">,
  slot: { date: string, time: string },
  consultationType: "online" | "offline",
  status: "pending" | "confirmed" | "completed" | "cancelled",
  meetLink?: string,
}
```

---

## 🔌 API Integration

### **Convex Queries (Reading Data)**
```javascript
const convex = useConvex();

// Get single item
const recipe = useQuery(api.Recipes.GetRecipeById, { id: recipeId });

// Get list
const recipes = useQuery(api.Recipes.GetAllRecipes);

// Manual query
const result = await convex.query(api.Users.GetUser, { email });
```

### **Convex Mutations (Writing Data)**
```javascript
const createRecipe = useMutation(api.Recipes.CreateRecipe);

await createRecipe({
  recipeName: "Chicken Salad",
  imageURI: "https://...",
  jsonData: { /* ... */ },
  uid: user._id,
});
```

### **AI Model Calls**
```javascript
import { GenerateWithAi } from '../services/AiModel';

const PROMPT = "Generate a healthy breakfast recipe";
const result = await GenerateWithAi(PROMPT);

// Parse JSON from AI response
const jsonData = JSON.parse(
  result.replace('```json', '').replace('```', '')
);
```

---

## Common Patterns

### **1. Data Fetching Pattern**
```javascript
export default function MyScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const result = await convex.query(api.Table.GetData);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingState />;
  if (!data) return <EmptyState />;
  return <DataView data={data} />;
}
```

### **2. Form Submission Pattern**
```javascript
const [form, setForm] = useState({});
const [saving, setSaving] = useState(false);

const handleSave = async () => {
  if (!validate()) return;
  setSaving(true);
  
  try {
    await mutation(form);
    Alert.alert('Success!');
  } catch (error) {
    Alert.alert('Error', error.message);
  } finally {
    setSaving(false);
  }
};
```

### **3. Navigation Pattern**
```javascript
import { useRouter, useLocalSearchParams } from 'expo-router';

const router = useRouter();
const { id } = useLocalSearchParams();

// Navigate forward
router.push(`/screen/${id}`);

// Navigate back
router.back();

// Replace (no back button)
router.replace('/(tabs)/Home');
```

---

## Adding New Features

### **Step-by-Step: Add a New Screen**

1. **Create the file**
```bash
touch app/new-feature/index.jsx
```

2. **Write the screen**
```javascript
import { useTheme } from '../context/ThemeContext';
import { Box, Txt } from '../components/UIComponents';

export default function NewFeature() {
  const { theme } = useTheme();
  
  return (
    <Box style={{ flex: 1, padding: theme.spacing.lg }}>
      <Txt size={24} bold>New Feature</Txt>
    </Box>
  );
}
```

3. **Add to navigation** (if needed)
```javascript
// In app/_layout.jsx
<Stack.Screen name="new-feature" />
```

4. **Add Convex queries/mutations** (if needed)
```typescript
// In convex/schema.ts
newFeature: defineTable({
  userId: v.id("users"),
  data: v.string(),
})
```

### **Add a New AI Feature**
```javascript
// 1. Add prompt to shared/Prompt.jsx
export default {
  NEW_FEATURE_PROMPT: "Generate...",
}

// 2. Create component
const AIResult = await GenerateWithAi(Prompt.NEW_FEATURE_PROMPT + userInput);

// 3. Parse and display
const data = JSON.parse(cleanAIResponse(AIResult));
```

---

## Debugging Guide

### **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| **White screen** | Check `_layout.jsx` for missing providers |
| **Navigation error** | Verify route path is correct |
| **Convex not working** | Run `npx convex dev` in separate terminal |
| **Auth not persisting** | Check Firebase config in `services/FirebasConfig.js` |
| **AI not responding** | Verify OpenRouter API key in `.env.local` |
| **Theme not updating** | Check `ThemeContext.jsx` provider wrapping |
| **Images not loading** | Verify image URI or local asset path |

### **Useful Commands**
```bash
# Reset Expo cache
npx expo start -c

# Clear Convex data (development)
npx convex dev --once

# Check environment variables
npx expo-env

# Lint code
npm run lint
```

---

## Deployment

### **Building for Production**

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### **Environment Variables in Production**
Add these in Expo dashboard or `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_CONVEX_URL": "https://your-project.convex.cloud",
        "EXPO_PUBLIC_FIREBASE_API_KEY": "your-key",
        "EXPO_PUBLIC_OPENROUTER_API_KEY": "your-key"
      }
    }
  }
}
```

---

## Learning Resources

- [Expo Documentation](https://docs.expo.dev)
- [Convex Documentation](https://docs.convex.dev)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Router Guide](https://docs.expo.dev/router/introduction)

---

## Getting Help

1. **Check existing issues** on GitHub
2. **Read Convex logs** in terminal
3. **Use React DevTools** for component debugging
4. **Check Firebase Console** for auth issues

---

**Happy Coding! **

