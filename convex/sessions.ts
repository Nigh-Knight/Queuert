import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create new session
export const createSession = mutation({
  args: {
    location: v.string(),
    scheduledDate: v.number(),
    volunteerCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate scheduledDate is in the future
    if (args.scheduledDate < Date.now()) {
      throw new Error("Session date must be in the future");
    }

    // Generate 6-digit access code with collision check
    let accessCode: string;
    let attempts = 0;
    do {
      accessCode = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await ctx.db
        .query("sessions")
        .withIndex("by_access_code", (q) => q.eq("accessCode", accessCode))
        .first();
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new Error("Failed to generate unique access code");
    }

    // Check for overlapping active sessions
    const existingActive = await ctx.db
      .query("sessions")
      .withIndex("by_location_active", (q) =>
        q.eq("location", args.location).eq("isActive", true)
      )
      .first();

    const sessionId = await ctx.db.insert("sessions", {
      location: args.location,
      isActive: true,
      accessCode,
      startedAt: Date.now(),
      scheduledDate: args.scheduledDate,
      volunteerCount: args.volunteerCount,
      serviceProviderId: "placeholder" as any, // TODO: Replace with actual auth in Phase 2
    });

    return {
      sessionId,
      accessCode,
      hasOverlappingSession: !!existingActive,
    };
  },
});

// End an active session
export const endSession = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      isActive: false,
      endedAt: Date.now(),
    });
    return true;
  },
});

// Get active session for location
export const getActiveSession = query({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_location_active", (q) =>
        q.eq("location", args.location).eq("isActive", true)
      )
      .first();
  },
});

// Get session by ID
export const getSessionById = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});
