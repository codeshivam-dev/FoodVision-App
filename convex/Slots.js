// convex/slots.ts
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";

// Generate slots for nutritionist
export const generateSlots = mutation({
  args: {
    nutritionistId: v.id("nutritionists"),
    daysAhead: v.optional(v.number()),  // Default 7 days
    slotsPerDay: v.optional(v.number()), // Default 8 slots
  },
  handler: async (ctx, args) => {
    const nutritionist = await ctx.db.get(args.nutritionistId);
    if (!nutritionist) throw new Error("Nutritionist not found");

    const daysAhead = args.daysAhead || 7;
    const timeSlots = [
      "09:00", "10:00", "11:00", 
      "12:00", "14:00", "15:00", 
      "16:00", "17:00"
    ];

    const now = Date.now();
    let createdCount = 0;
    let skippedCount = 0;

    // Generate future slots
    for (let i = 0; i < daysAhead; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dateTimestamp = date.getTime();

      for (const time of timeSlots) {
        // Check if slot already exists
        const existingSlot = await ctx.db
          .query("slots")
          .withIndex("by_nutritionist_date", (q) => 
            q.eq("nutritionistId", args.nutritionistId)
             .eq("date", dateStr)
          )
          .filter((q) => q.eq(q.field("time"), time))
          .first();

        if (existingSlot) {
          skippedCount++;
          continue;
        }

        // Create new slot
        await ctx.db.insert("slots", {
          nutritionistId: args.nutritionistId,
          date: dateStr,
          time: time,
          isBooked: false,
          createdAt: now,
          expiresAt: dateTimestamp + (24 * 60 * 60 * 1000), // Expire after 1 day
        });

        createdCount++;
      }
    }

    // Also update nutritionist's availableSlots for backward compatibility
    const allSlots = await ctx.db
      .query("slots")
      .withIndex("by_nutritionist_date", (q) => 
        q.eq("nutritionistId", args.nutritionistId)
      )
      .collect();

    const formattedSlots = allSlots.map(s => ({
      date: s.date,
      time: s.time,
      isBooked: s.isBooked,
    }));

    await ctx.db.patch(args.nutritionistId, {
      availableSlots: formattedSlots,
      updatedAt: now,
    });

    return { 
      created: createdCount, 
      skipped: skippedCount,
      total: allSlots.length 
    };
  },
});

// Get available slots for nutritionist
export const getAvailableSlots = query({
  args: {
    nutritionistId: v.id("nutritionists"),
    daysAhead: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAhead = args.daysAhead || 7;
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);
    const endDateStr = endDate.toISOString().split('T')[0];

    const slots = await ctx.db
      .query("slots")
      .withIndex("by_nutritionist_date", (q) => 
        q.eq("nutritionistId", args.nutritionistId)
      )
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), today),
          q.lte(q.field("date"), endDateStr),
          q.eq(q.field("isBooked"), false)
        )
      )
      .collect();

    return slots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
  },
});

// Book a slot
export const bookSlot = mutation({
  args: {
    slotId: v.id("slots"),
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db.get(args.slotId);
    if (!slot) throw new Error("Slot not found");
    if (slot.isBooked) throw new Error("Slot already booked");

    await ctx.db.patch(args.slotId, {
      isBooked: true,
      consultationId: args.consultationId,
    });

    // Also update nutritionist's availableSlots
    const nutritionist = await ctx.db.get(slot.nutritionistId);
    if (nutritionist) {
      const updatedSlots = (nutritionist.availableSlots || []).map(s => {
        if (s.date === slot.date && s.time === slot.time) {
          return { ...s, isBooked: true };
        }
        return s;
      });

      await ctx.db.patch(slot.nutritionistId, {
        availableSlots: updatedSlots,
      });
    }

    return { success: true };
  },
});

// Release a slot (when consultation is cancelled)
export const releaseSlot = mutation({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const slot = await ctx.db
      .query("slots")
      .filter((q) => q.eq(q.field("consultationId"), args.consultationId))
      .first();

    if (slot) {
      await ctx.db.patch(slot._id, {
        isBooked: false,
        consultationId: undefined,
      });
    }

    return { success: true };
  },
});

// Clean expired slots (can be called via cron job or manually)
export const cleanExpiredSlots = mutation({
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredSlots = await ctx.db
      .query("slots")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .filter((q) => q.eq(q.field("isBooked"), false))
      .collect();

    for (const slot of expiredSlots) {
      await ctx.db.delete(slot._id);
    }

    return { deleted: expiredSlots.length };
  },
});

// Ensure sufficient slots for nutritionist
export const ensureSlots = mutation({
  args: {
    nutritionistId: v.id("nutritionists"),
  },
  handler: async (ctx, args) => {
    const nutritionist = await ctx.db.get(args.nutritionistId);
    if (!nutritionist) throw new Error("Nutritionist not found");

    // Get available (unbooked) slots count for next 7 days
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const endDateStr = endDate.toISOString().split('T')[0];

    const availableSlots = await ctx.db
      .query("slots")
      .withIndex("by_nutritionist_booked", (q) => 
        q.eq("nutritionistId", args.nutritionistId)
          .eq("isBooked", false)
      )
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), today),
          q.lte(q.field("date"), endDateStr)
        )
      )
      .collect();

    // If less than 10 slots available, generate more
    if (availableSlots.length < 10) {
      const timeSlots = [
        "09:00", "10:00", "11:00", 
        "12:00", "14:00", "15:00", 
        "16:00", "17:00"
      ];

      const now = Date.now();
      let created = 0;

      // Generate slots for the next day only
      for (let i = 1; i <= 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dateTimestamp = date.getTime();

        for (const time of timeSlots) {
          const existing = await ctx.db
            .query("slots")
            .withIndex("by_nutritionist_date", (q) => 
              q.eq("nutritionistId", args.nutritionistId)
               .eq("date", dateStr)
            )
            .filter((q) => q.eq(q.field("time"), time))
            .first();

          if (!existing) {
            await ctx.db.insert("slots", {
              nutritionistId: args.nutritionistId,
              date: dateStr,
              time: time,
              isBooked: false,
              createdAt: now,
              expiresAt: dateTimestamp + (24 * 60 * 60 * 1000),
            });
            created++;
          }
        }
      }

      return { 
        generated: created, 
        message: `Generated ${created} new slots`,
        currentAvailable: availableSlots.length + created 
      };
    }

    return { 
      generated: 0, 
      message: "Sufficient slots available",
      currentAvailable: availableSlots.length 
    };
  },
});