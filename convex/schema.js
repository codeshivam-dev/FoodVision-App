import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /* ==================== USERS ==================== */
  users: defineTable({
    name: v.string(),
    email: v.string(),
    picture: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    credits: v.number(),
    height: v.optional(v.string()),
    weight: v.optional(v.string()),
    age: v.optional(v.string()),
    gender: v.optional(v.string()),
    activityLevel: v.optional(v.string()),
    goal: v.optional(v.string()),
    calories: v.optional(v.number()),
    proteins: v.optional(v.number()),
    role: v.union(
      v.literal("user"),
      v.literal("nutritionist")
    ),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  /* ==================== NUTRITIONIST PROFILE ==================== */
  nutritionists: defineTable({
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
    availableSlots: v.array(
      v.object({
        date: v.string(),
        time: v.string(),
        isBooked: v.boolean(),
      })
    ),
    isVerified: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_isActive", ["isActive"]),

  /* ==================== CONSULTATIONS ==================== */
  consultations: defineTable({
    userId: v.id("users"),
    nutritionistId: v.id("nutritionists"),
    consultationType: v.union(
      v.literal("online"),
      v.literal("offline")
    ),
    slot: v.object({
      date: v.string(),
      time: v.string(),
    }),
    meetLink: v.optional(v.string()),
    status: v.union(
      v.literal("upcoming"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    paymentMode: v.literal("pay_on_site"),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_nutritionistId", ["nutritionistId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"])
    .index("by_nutritionistId_status", ["nutritionistId", "status"]),

  /* ==================== SLOTS ==================== */
  slots: defineTable({
    nutritionistId: v.id("nutritionists"),
    date: v.string(),
    time: v.string(),
    isBooked: v.boolean(),
    consultationId: v.optional(v.id("consultations")),
    createdAt: v.number(),
    expiresAt: v.number(),  // Auto-expire old slots
  })
    .index("by_nutritionist_date", ["nutritionistId", "date"])
    .index("by_nutritionist_booked", ["nutritionistId", "isBooked"])
    .index("by_date", ["date"]),

  /* ==================== PRE-CONSULTATION FORM ==================== */
  preConsultationForms: defineTable({
    consultationId: v.id("consultations"),
    goals: v.string(),
    medicalConditions: v.optional(v.string()),
    allergies: v.optional(v.string()),
    dietPreference: v.string(),
    currentIssues: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_consultationId", ["consultationId"]),

  /* ==================== CONSULTATION SESSION ==================== */
  sessions: defineTable({
    consultationId: v.id("consultations"),
    notes: v.optional(v.string()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_consultationId", ["consultationId"]),

  /* ==================== EXPERT DIET PLANS ==================== */
  expertDietPlans: defineTable({
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
    isActive: v.boolean(),
    publishedAt: v.number(),
  })
    .index("by_consultationId", ["consultationId"])
    .index("by_userId", ["userId"]),

  /* ==================== RECIPES ==================== */
  recipes: defineTable({
    jsonData: v.any(),
    uid: v.id('users'),
    imageURI: v.string(),
    recipeName: v.string(),
  })
    .index("by_uid", ["uid"]),

  /* ==================== MEAL PLAN ==================== */
  mealPlan: defineTable({
    uid: v.id('users'),
    recipeId: v.id('recipes'),
    mealType: v.string(),
    calories: v.number(),
    date: v.string(),
    completed: v.boolean(),
  })
    .index("by_uid", ["uid"])
    .index("by_uid_date", ["uid", "date"])
    .index("by_uid_date_mealType", ["uid", "date", "mealType"]),
});

