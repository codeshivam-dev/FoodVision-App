import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all nutritionists 
export const getAllNutritionists = query({
  handler: async (ctx) => {
    const nutritionists = await ctx.db
      .query("nutritionists")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    // Populate user details
    const enriched = await Promise.all(
      nutritionists.map(async (nutri) => {
        const user = nutri.userId ? await ctx.db.get(nutri.userId) : null;
        return { ...nutri, user };
      })
    );

    return enriched;
  },
});

// Get nutritionist profile
export const getNutritionistProfile = query({
  args: {
    nutritionistId: v.id("nutritionists"),
  },
  handler: async (ctx, args) => {
    const nutritionist = await ctx.db.get(args.nutritionistId);
    if (!nutritionist) return null;

    const user = await ctx.db.get(nutritionist.userId);
    
    return { ...nutritionist, user };
  },
});

// Create nutritionist profile
export const createNutritionistProfile = mutation({
  args: {
    userId: v.id("users"),
    phone: v.string(),
    bio: v.string(),
    degree: v.string(),
    dietPhilosophy: v.string(),
    experienceYears: v.number(),
    specialization: v.array(v.string()),
    clinicAddress: v.optional(v.string()),
    consultationModes: v.object({
      online: v.boolean(),
      offline: v.boolean(),
    }),
    languagesSpoken: v.array(v.string()),
    consultationFee: v.number(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Generate default available slots for next 7 days
    const slots = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].forEach(time => {
        slots.push({ date: dateStr, time, isBooked: false });
      });
    }

    const id = await ctx.db.insert("nutritionists", {
      ...args,
      availableSlots: slots,
      isVerified: false,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return id;
  },
});

// Update nutritionist profile
export const updateNutritionistProfile = mutation({
  args: {
    nutritionistId: v.id("nutritionists"),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    degree: v.optional(v.string()),
    dietPhilosophy: v.optional(v.string()),
    experienceYears: v.optional(v.number()),
    specialization: v.optional(v.array(v.string())),
    clinicAddress: v.optional(v.string()),
    consultationModes: v.optional(v.object({
      online: v.boolean(),
      offline: v.boolean(),
    })),
    languagesSpoken: v.optional(v.array(v.string())),
    consultationFee: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { nutritionistId, ...updates } = args;

    const existing = await ctx.db.get(nutritionistId);
    if (!existing) throw new Error("Nutritionist profile not found");

    await ctx.db.patch(nutritionistId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});