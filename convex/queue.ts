import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get active queue for a session
export const getActiveQueue = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const queueItems = await ctx.db
      .query("queue")
      .withIndex("by_session_status", (q) =>
        q.eq("sessionId", args.sessionId)
      )
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

// Start wash timer (simple - uses existing duration)
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

// Assign machine and start cycle (full assignment)
export const assignAndStartCycle = mutation({
  args: {
    queueId: v.id("queue"),
    volunteerUserId: v.id("users"),
    machineNumber: v.string(),
    machineType: v.union(v.literal("washer"), v.literal("dryer")),
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const status = args.machineType === "washer" ? "washing" : "drying";
    await ctx.db.patch(args.queueId, {
      status,
      timerStartedAt: Date.now(),
      timerDuration: args.durationMinutes * 60 * 1000, // Convert to ms
      volunteerAssignedId: args.volunteerUserId,
      machineNumber: args.machineNumber,
      machineType: args.machineType,
    });
  },
});

// End current cycle (mark as ready to remove or switch to dryer)
export const endCycle = mutation({
  args: {
    queueId: v.id("queue"),
  },
  handler: async (ctx, args) => {
    const queueItem = await ctx.db.get(args.queueId);
    if (!queueItem) {
      throw new Error("Queue item not found");
    }

    // Clear machine assignment and mark as ready
    await ctx.db.patch(args.queueId, {
      status: "ready_to_remove",
      timerStartedAt: undefined,
      machineNumber: undefined,
      machineType: undefined,
    });
  },
});

// Mark user as served (complete their service)
export const markAsServed = mutation({
  args: { queueId: v.id("queue") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.queueId, {
      status: "served",
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
// Note: Uses .filter() instead of .withIndex() because this is a per-user lookup,
// not a session-wide scan. Adding an index for serviceUserId would only benefit
// if we frequently query all queue entries for a specific user across sessions.
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
