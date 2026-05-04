import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Save pre-consultation form 
export const savePreConsultationForm = mutation({
  args: {
    consultationId: v.id("consultations"),
    goals: v.string(),
    medicalConditions: v.optional(v.string()),
    allergies: v.optional(v.string()),
    dietPreference: v.string(),
    currentIssues: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if form already exists
    const existing = await ctx.db
      .query("preConsultationForms")
      .withIndex("by_consultationId", (q) => 
        q.eq("consultationId", args.consultationId)
      )
      .first();

    if (existing) {
      // Update existing form
      await ctx.db.patch(existing._id, {
        ...args,
        createdAt: Date.now(),
      });
      return existing._id;
    }

    // Create new form
    const id = await ctx.db.insert("preConsultationForms", {
      ...args,
      createdAt: Date.now(),
    });

    return id;
  },
});