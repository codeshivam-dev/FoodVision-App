import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create expert diet plan
export const createExpertDietPlan = mutation({
  args: {
    consultationId: v.id("consultations"),
    userId: v.id("users"),
    meals: v.array(
      v.object({
        name: v.string(),
        calories: v.number(),
        macros: v.object({
          protein: v.number(),
          carbs: v.number(),
          fat: v.number(),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("expertDietPlans", {
      ...args,
      isActive: true,
      publishedAt: Date.now(),
    });

    return id;
  },
});

// Update expert diet plan
export const updateExpertDietPlan = mutation({
  args: {
    planId: v.id("expertDietPlans"),
    meals: v.array(
      v.object({
        name: v.string(),
        calories: v.number(),
        macros: v.object({
          protein: v.number(),
          carbs: v.number(),
          fat: v.number(),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new Error("Diet plan not found");

    await ctx.db.patch(args.planId, {
      meals: args.meals,
      publishedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get expert diet plan
export const getExpertDietPlan = query({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("expertDietPlans")
      .withIndex("by_consultationId", (q) => 
        q.eq("consultationId", args.consultationId)
      )
      .first();

    return plan;
  },
});