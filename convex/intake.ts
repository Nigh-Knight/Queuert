import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit intake form
export const submitIntakeForm = mutation({
  args: {
    serviceUserId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    livingCondition: v.union(
      v.literal("homeless"),
      v.literal("sheltered"),
      v.literal("loads")
    ),
    estimatedLaundryLoads: v.number(),
    estimatedLaundryWeightLbs: v.number(),
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const intakeFormId = await ctx.db.insert("intakeForms", {
      ...args,
      submittedAt: Date.now(),
    });
    
    // Add user to queue automatically
    const queuePosition = await ctx.db
      .query("queue")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .collect();
    
    await ctx.db.insert("queue", {
      serviceUserId: args.serviceUserId,
      intakeFormId,
      sessionId: args.sessionId,
      position: queuePosition.length + 1,
      status: "waiting",
      joinedAt: Date.now(),
      timerDuration: 23 * 60 * 1000, // 23 minutes
    });
    
    return intakeFormId;
  },
});

// Get intake form for a user
export const getIntakeForm = query({
  args: { serviceUserId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("intakeForms")
      .filter((q) => q.eq(q.field("serviceUserId"), args.serviceUserId))
      .first();
  },
});
