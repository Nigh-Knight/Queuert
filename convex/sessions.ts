import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create new session
export const createSession = mutation({
  args: {
    serviceProviderId: v.id("users"),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sessions", {
      serviceProviderId: args.serviceProviderId,
      location: args.location,
      isActive: true,
      startedAt: Date.now(),
    });
  },
});

// Get active session for location
export const getActiveSession = query({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sessions")
      .filter((q) => q.eq(q.field("location"), args.location))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});
