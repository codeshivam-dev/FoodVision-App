import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper to parse DD/MM/YYYY to Date object
function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to get start date based on period
function getStartDate(period) {
  const now = new Date();
  switch (period) {
    case 'week':
      now.setDate(now.getDate() - 7);
      break;
    case 'month':
      now.setDate(now.getDate() - 30);
      break;
    case 'year':
      now.setDate(now.getDate() - 365);
      break;
    default:
      now.setDate(now.getDate() - 7);
  }
  return now;
}

// Helper to check if date is within range
function isDateInRange(dateStr, startDate, endDate) {
  const date = parseDate(dateStr);
  return date >= startDate && date <= endDate;
}

// Create meal plan entry
export const CreateMealPlan = mutation({
  args: {
    date: v.string(),
    mealType: v.string(),
    calories: v.float64(),
    recipeId: v.id("recipes"),
    uid: v.id("users"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("mealPlan", args);
    return id;
  },
});

// Get today's meal plan
export const GetTodaysMealPlan = query({
  args: {
    uid: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const mealPlans = await ctx.db
      .query("mealPlan")
      .withIndex("by_uid_date", (q) => 
        q.eq("uid", args.uid).eq("date", args.date)
      )
      .collect();

    // Populate recipe details
    const enrichedPlans = await Promise.all(
      mealPlans.map(async (plan) => {
        const recipe = await ctx.db.get(plan.recipeId);
        return {
          mealPlan: plan,
          recipe,
        };
      })
    );

    return enrichedPlans;
  },
});

// Get total calories by date
export const GetTotalCaloriesByDate = query({
  args: {
    uid: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const mealPlans = await ctx.db
      .query("mealPlan")
      .withIndex("by_uid_date", (q) =>
        q.eq("uid", args.uid).eq("date", args.date)
      )
      .collect();

    const total = mealPlans.reduce(
      (sum, plan) => sum + (plan.calories || 0),
      0
    );

    return total;
  },
});

// Update meal plan status
export const UpdateMealPlanStatus = mutation({
  args: {
    id: v.id("mealPlan"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.id);
    if (!plan) throw new Error("Meal plan not found");

    await ctx.db.patch(args.id, {
      completed: args.completed,
    });

    return { success: true };
  },
});

// Get meal history for a period
export const GetMealHistory = query({
  args: {
    uid: v.id("users"),
    period: v.string(), // week, month, year
  },
  handler: async (ctx, args) => {
    // Get start date based on period
    const startDate = getStartDate(args.period);
    const endDate = new Date(); // today

    // Get all meal plans for user
    const mealPlans = await ctx.db
      .query("mealPlan")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .collect();

    // Filter by date range
    const filtered = mealPlans.filter(plan => 
      isDateInRange(plan.date, startDate, endDate)
    );

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    // Enrich with recipe data
    const enriched = await Promise.all(
      filtered.map(async (plan) => {
        const recipe = await ctx.db.get(plan.recipeId);
        return {
          mealPlan: plan,
          recipe,
        };
      })
    );

    return enriched;
  },
});

// Get weekly meal stats for progress chart
export const GetWeeklyStats = query({
  args: {
    uid: v.id("users"),
  },
  handler: async (ctx, args) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6); // Last 7 days

    // Get all meal plans
    const mealPlans = await ctx.db
      .query("mealPlan")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .collect();

    // Group by day of week
    const weeklyData = days.map((dayName, index) => {
      // Calculate date for this day
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

      // Find meals for this date
      const dayMeals = mealPlans.filter(m => m.date === dateStr);
      const completed = dayMeals.filter(m => m.completed).length;
      const total = dayMeals.length;

      return {
        day: dayName,

        value: total > 0 ? Math.round((completed / total) * 100) : 0,
        completed,
        total,
      };
    });

    return weeklyData;
  },
});

// Delete meal plan
export const DeleteMealPlan = mutation({
  args: {
    id: v.id("mealPlan"),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.id);
    if (!plan) throw new Error("Meal plan not found");

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Get meal count by date range
export const GetMealCountByDateRange = query({
  args: {
    uid: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const mealPlans = await ctx.db
      .query("mealPlan")
      .withIndex("by_uid", (q) => q.eq("uid", args.uid))
      .collect();

    const startDate = parseDate(args.startDate);
    const endDate = parseDate(args.endDate);

    const filtered = mealPlans.filter(plan => 
      isDateInRange(plan.date, startDate, endDate)
    );

    return {
      total: filtered.length,
      completed: filtered.filter(m => m.completed).length,
      totalCalories: filtered.reduce((sum, m) => sum + (m.calories || 0), 0),
    };
  },
});