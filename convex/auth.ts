import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Validate volunteer QR code and return session/volunteer info
 * Creates a user record for the volunteer if not already set
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

    // Create user record for volunteer if not already set
    // This allows volunteers to be assigned to queue items
    if (!volunteer.userId) {
      const userId = await ctx.db.insert("users", {
        firstName: "Volunteer",
        lastName: volunteer.qrCode.substring(0, 8), // Use part of QR code as identifier
        role: "volunteer",
        location: session.location,
        language: "en",
        createdAt: Date.now(),
      });

      // Link user record to volunteer
      await ctx.db.patch(volunteer._id, {
        userId,
      });

      return {
        volunteerId: volunteer._id,
        sessionId: volunteer.sessionId,
        location: session.location,
        role: "volunteer" as const,
      };
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
 * Validate session QR code and return session info
 * Used by service users to join a session
 */
export const validateSessionQR = mutation({
  args: {
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    // QR format for sessions: "session:{sessionId}"
    if (!args.qrCode.startsWith("session:")) {
      throw new Error("Invalid session QR code");
    }

    const sessionIdStr = args.qrCode.replace("session:", "");

    // Get session using by_access_code index to validate format
    // Note: This is a fallback - normally sessionId is directly embedded
    const session = await ctx.db.get(sessionIdStr as any);

    if (!session || session === null) {
      throw new Error("Session not found");
    }

    // Type guard to ensure we have a session document
    if (!('isActive' in session)) {
      throw new Error("Invalid session document");
    }

    if (!session.isActive) {
      throw new Error("This session has ended");
    }

    return {
      sessionId: session._id,
      location: session.location,
      date: session.scheduledDate,
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

/**
 * Verify admin access code
 * Uses hardcoded verification code for MVP
 */
export const verifyAdminCode = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // Hardcoded admin verification code (from CONTEXT.md)
    const ADMIN_CODE = "kepler cool";

    // Case-insensitive comparison with trimmed input
    if (args.code.trim().toLowerCase() !== ADMIN_CODE.toLowerCase()) {
      throw new Error("Invalid verification code");
    }

    return {
      role: "service_provider" as const,
      verified: true,
      // Note: No sessionId - admin creates sessions after verification
    };
  },
});
