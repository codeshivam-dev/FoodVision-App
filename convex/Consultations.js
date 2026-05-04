import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create consultation
export const createConsultation = mutation({
  args: {
    userId: v.id("users"),
    nutritionistId: v.id("nutritionists"),
    consultationType: v.union(v.literal("online"), v.literal("offline")),
    slot: v.object({
      date: v.string(),
      time: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Get today and 7 days ahead
    const today = new Date();
    
    // Check if enough slots exist, if not generate them
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const endDateStr = endDate.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const availableSlots = await ctx.db
      .query("slots")
      .withIndex("by_nutritionist_booked", (q) =>
        q.eq("nutritionistId", args.nutritionistId)
          .eq("isBooked", false)
      )
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), todayStr),
          q.lte(q.field("date"), endDateStr)
        )
      )
      .collect();

    // Generate slots if less than 10 available
    if (availableSlots.length < 10) {
      const timeSlots = [
        "09:00", "10:00", "11:00",
        "12:00", "14:00", "15:00",
        "16:00", "17:00",
      ];

      const now = Date.now();

      // Generate slots for next 7 days
      for (let i = 0; i < 7; i++) {
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

          if (!existingSlot) {
            await ctx.db.insert("slots", {
              nutritionistId: args.nutritionistId,
              date: dateStr,
              time: time,
              isBooked: false,
              createdAt: now,
              expiresAt: dateTimestamp + (24 * 60 * 60 * 1000),
            });
          }
        }
      }
    }

    // Check and book the specific slot
    const slotRecord = await ctx.db
      .query("slots")
      .withIndex("by_nutritionist_date", (q) =>
        q.eq("nutritionistId", args.nutritionistId)
          .eq("date", args.slot.date)
      )
      .filter((q) => q.eq(q.field("time"), args.slot.time))
      .first();

    if (!slotRecord) {
      throw new Error("Slot not found. Please refresh available slots.");
    }

    if (slotRecord.isBooked) {
      throw new Error("This slot is already booked");
    }

    // Create consultation
    const consultationId = await ctx.db.insert("consultations", {
      ...args,
      status: "upcoming",
      paymentMode: "pay_on_site",
      createdAt: Date.now(),
    });

    // Book the slot
    await ctx.db.patch(slotRecord._id, {
      isBooked: true,
      consultationId,
    });

    return consultationId;
  },
});


// Get user consultations
export const getUserConsultations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const consultations = await ctx.db
      .query("consultations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Populate nutritionist & user details
    const enriched = await Promise.all(
      consultations.map(async (consultation) => {
        const nutritionist = await ctx.db.get(consultation.nutritionistId);
        const nutritionistUser = nutritionist
          ? await ctx.db.get(nutritionist.userId)
          : null;

        const session = await ctx.db
          .query("sessions")
          .withIndex("by_consultationId", (q) =>
            q.eq("consultationId", consultation._id)
          )
          .first();

        const expertPlan = await ctx.db
          .query("expertDietPlans")
          .withIndex("by_consultationId", (q) =>
            q.eq("consultationId", consultation._id)
          )
          .first();

        return {
          ...consultation,
          nutritionist: {
            ...nutritionist,
            user: nutritionistUser,
          },
          hasSession: !!session,
          hasExpertPlan: !!expertPlan,
        };
      })
    );

    return enriched;
  },
});

// Get nutritionist consultations
export const getNutritionistConsultations = query({
  args: {
    nutritionistId: v.id("nutritionists"),
  },
  handler: async (ctx, args) => {
    const consultations = await ctx.db
      .query("consultations")
      .withIndex("by_nutritionistId", (q) =>
        q.eq("nutritionistId", args.nutritionistId)
      )
      .collect();

    // Populate user details and pre-consultation form
    const enriched = await Promise.all(
      consultations.map(async (consultation) => {
        const user = await ctx.db.get(consultation.userId);

        const preForm = await ctx.db
          .query("preConsultationForms")
          .withIndex("by_consultationId", (q) =>
            q.eq("consultationId", consultation._id)
          )
          .first();

        const expertPlan = await ctx.db
          .query("expertDietPlans")
          .withIndex("by_consultationId", (q) =>
            q.eq("consultationId", consultation._id)
          )
          .first();

        return {
          ...consultation,
          user,
          preConsultationForm: preForm,
          hasExpertPlan: !!expertPlan,
        };
      })
    );

    return enriched;
  },
});

// Get consultation details
export const getConsultationDetails = query({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) return null;

    const [user, nutritionist, session, preForm, expertPlan] = await Promise.all([
      ctx.db.get(consultation.userId),
      ctx.db.get(consultation.nutritionistId),
      ctx.db
        .query("sessions")
        .withIndex("by_consultationId", (q) =>
          q.eq("consultationId", args.consultationId)
        )
        .first(),
      ctx.db
        .query("preConsultationForms")
        .withIndex("by_consultationId", (q) =>
          q.eq("consultationId", args.consultationId)
        )
        .first(),
      ctx.db
        .query("expertDietPlans")
        .withIndex("by_consultationId", (q) =>
          q.eq("consultationId", args.consultationId)
        )
        .first(),
    ]);

    const nutritionistUser = nutritionist
      ? await ctx.db.get(nutritionist.userId)
      : null;

    return {
      ...consultation,
      user,
      nutritionist: {
        ...nutritionist,
        user: nutritionistUser,
      },
      session,
      preConsultationForm: preForm,
      expertDietPlan: expertPlan,
    };
  },
});

// Set consultation meet link
export const setConsultationMeetLink = mutation({
  args: {
    consultationId: v.id("consultations"),
    meetLink: v.string(),
  },
  handler: async (ctx, args) => {
    const consultation = await ctx.db.get(args.consultationId);
    if (!consultation) throw new Error("Consultation not found");

    await ctx.db.patch(args.consultationId, {
      meetLink: args.meetLink,
    });

    return { success: true };
  },
});