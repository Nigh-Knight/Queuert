import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Validate volunteer QR code and return session/volunteer info
 */
export const validateVolunteerQR = mutation({
  args: {
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up volunteer using by_qr_code index
    const volunteer = await ctx.db
      .query("volunteers")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .first();

    if (!volunteer) {
      throw new Error("Invalid QR code");
    }

    // Get session by volunteer.sessionId
    const session = await ctx.db.get(volunteer.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.isActive) {
      throw new Error("This session has ended. Please contact admin to start a new session.");
    }

    return {
      volunteerId: volunteer._id,
      sessionId: volunteer.sessionId,
      location: session.location,
      role: "volunteer" as const,
    };
  },
});

/**
 * Check if phone number is already in queue for this session
 */
export const checkPhoneDuplicate = query({
  args: {
    sessionId: v.id("sessions"),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up user by phone using by_phone index
    const user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (!user) {
      return { isDuplicate: false };
    }

    // Query queue entries for this session with active status
    const queueEntries = await ctx.db
      .query("queue")
      .withIndex("by_session_status", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Filter by serviceUserId matching found user and active statuses
    const activeEntry = queueEntries.find(
      (entry) =>
        entry.serviceUserId === user._id &&
        (entry.status === "waiting" || entry.status === "washing")
    );

    if (activeEntry) {
      return {
        isDuplicate: true,
        message: "This phone number is already in the queue for this session",
      };
    }

    // User exists but not in queue
    return {
      isDuplicate: false,
      isReturningUser: true,
      userId: user._id,
    };
  },
});

/**
 * Register a new service user
 */
export const registerServiceUser = mutation({
  args: {
    sessionId: v.id("sessions"),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate session exists and is active
    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (!session.isActive) {
      throw new Error("This session has ended. Please contact admin to start a new session.");
    }

    // If phone provided, check for duplicate inline
    if (args.phone) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();

      if (user) {
        const queueEntries = await ctx.db
          .query("queue")
          .withIndex("by_session_status", (q) => q.eq("sessionId", args.sessionId))
          .collect();

        const activeEntry = queueEntries.find(
          (entry) =>
            entry.serviceUserId === user._id &&
            (entry.status === "waiting" || entry.status === "washing")
        );

        if (activeEntry) {
          throw new Error("This phone number is already in the queue for this session");
        }
      }
    }

    // Create user record
    const userId = await ctx.db.insert("users", {
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      role: "service_user",
      location: session.location,
      language: "en", // Default to English, will be set by user in future phase
      createdAt: Date.now(),
    });

    return {
      userId,
      sessionId: args.sessionId,
      location: session.location,
      role: "service_user" as const,
    };
  },
});
