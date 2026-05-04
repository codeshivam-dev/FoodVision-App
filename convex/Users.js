import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user by email 
export const GetUser = query({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.email) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return user;
  },
});

// Create new user 
export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User already exists with this email");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      credits: 5,
      role: "user",
    });

    return userId;
  },
});

// Update user profile 
export const UpdateUserProfile = mutation({
  args: {
    uid: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    age: v.optional(v.string()),
    gender: v.optional(v.string()),
    goal: v.optional(v.string()),
    weight: v.optional(v.string()),
    height: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { uid, ...updates } = args;

    const user = await ctx.db.get(uid);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(uid, updates);
    return { success: true };
  },
});

// Update user preferences 
export const UpdateUserPref = mutation({
  args: {
    uid: v.id("users"),
    weight: v.string(),
    height: v.string(),
    gender: v.string(),
    goal: v.string(),
    calories: v.optional(v.number()),
    proteins: v.optional(v.number()),
    age: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { uid, ...prefs } = args;

    const user = await ctx.db.get(uid);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(uid, prefs);
    return { success: true };
  },
});

// Get user progress data
export const GetUserProgress = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get today's meal plans
    const today = new Date().toLocaleDateString('en-GB').split('/').join('/');
    
    const mealPlans = await ctx.db
      .query("mealPlan")
      .withIndex("by_uid_date", (q) => 
        q.eq("uid", args.userId).eq("date", today)
      )
      .collect();

    const completedMeals = mealPlans.filter(m => m.completed).length;
    const totalCalories = mealPlans.reduce((sum, m) => sum + m.calories, 0);

    return {
      weight: user.weight,
      height: user.height,
      goal: user.goal,
      calories: user.calories,
      todayCalories: totalCalories,
      mealsCompleted: completedMeals,
      totalMeals: mealPlans.length,
    };
  },
});

// Get weight history
export const GetWeightHistory = query({
  args: {
    userId: v.id("users"),
    period: v.string(), // week, month, year
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    return [{
      date: new Date().toISOString().split('T')[0],
      weight: user.weight || '0',
    }];
  },
});