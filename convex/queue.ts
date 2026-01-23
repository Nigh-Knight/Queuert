import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get active queue for a session
export const getActiveQueue = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const queueItems = await ctx.db
      .query("queue")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .order("asc")
      .collect();
    
    // Populate user details
    return await Promise.all(
      queueItems.map(async (item) => {
        const user = await ctx.db.get(item.serviceUserId);
        const intake = await ctx.db.get(item.intakeFormId);
        return { ...item, user, intake };
      })
    );
  },
});

// Start wash timer
export const startTimer = mutation({
  args: { 
    queueId: v.id("queue"),
    volunteerUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.queueId, {
      status: "washing",
      timerStartedAt: Date.now(),
      volunteerAssignedId: args.volunteerUserId,
    });
  },
});

// Remove from queue
export const removeFromQueue = mutation({
  args: { queueId: v.id("queue") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.queueId, {
      status: "removed",
    });
  },
});

// Get user's queue position
export const getUserQueuePosition = query({
  args: { serviceUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("queue")
      .filter((q) => q.eq(q.field("serviceUserId"), args.serviceUserId))
      .filter((q) => q.neq(q.field("status"), "removed"))
      .filter((q) => q.neq(q.field("status"), "served"))
      .first();
  },
});
