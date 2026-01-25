import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create new session
export const createSession = mutation({
  args: {
    serviceProviderId: v.id("users"),
    location: v.string(),
    scheduledDate: v.number(),
    volunteerCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Generate 6-digit access code
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Check for collision (unlikely but possible)
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_access_code", (q) => q.eq("accessCode", accessCode))
      .first();

    if (existing) {
      // Retry with new code
      throw new Error("Access code collision, please retry");
    }

    return await ctx.db.insert("sessions", {
      serviceProviderId: args.serviceProviderId,
      location: args.location,
      isActive: true,
      accessCode,
      startedAt: Date.now(),
      scheduledDate: args.scheduledDate,
      volunteerCount: args.volunteerCount,
    });
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
