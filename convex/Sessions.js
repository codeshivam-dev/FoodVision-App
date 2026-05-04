import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Start session
export const startSession = mutation({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    // Check if session already exists
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_consultationId", (q) => 
        q.eq("consultationId", args.consultationId)
      )
      .first();

    if (existing) {
      throw new Error("Session already exists for this consultation");
    }

    const id = await ctx.db.insert("sessions", {
      consultationId: args.consultationId,
      startedAt: Date.now(),
    });

    return id;
  },
});

// Get session
export const getSession = query({
  args: {
    consultationId: v.id("consultations"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_consultationId", (q) => 
        q.eq("consultationId", args.consultationId)
      )
      .first();

    return session;
  },
});

// Save session notes
export const saveSessionNotes = mutation({
  args: {
    sessionId: v.id("sessions"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, {
      notes: args.notes,
      endedAt: Date.now(),
    });

    return { success: true };
  },
});