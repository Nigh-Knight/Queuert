import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate volunteer codes for a session
export const generateVolunteerCodes = mutation({
  args: {
    sessionId: v.id("sessions"),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.db.get(args.sessionId);
    if (!session || !session.isActive) {
      throw new Error("Invalid or inactive session");
    }

    // Generate volunteer codes
    const volunteers = [];
    for (let i = 0; i < args.count; i++) {
      // Generate UUID for QR code (crypto.randomUUID equivalent in Convex)
      const qrCode = crypto.randomUUID();

      const volunteerId = await ctx.db.insert("volunteers", {
        sessionId: args.sessionId,
        qrCode,
        assignedAt: Date.now(),
        // userId will be set when volunteer scans and registers (omitted for optional field)
      });

      volunteers.push({ volunteerId, qrCode });
    }

    return volunteers;
  },
});

// Get all volunteers for a session
export const getVolunteersBySession = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("volunteers")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

// Regenerate volunteer QR code (invalidates old one)
export const regenerateVolunteerCode = mutation({
  args: {
    volunteerId: v.id("volunteers"),
  },
  handler: async (ctx, args) => {
    // Generate new UUID
    const qrCode = crypto.randomUUID();

    // Update volunteer with new code
    await ctx.db.patch(args.volunteerId, {
      qrCode,
    });

    return qrCode;
  },
});

// Get volunteer by QR code (for scanning)
export const getVolunteerByQrCode = query({
  args: {
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("volunteers")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .first();
  },
});

// Ensure volunteer has a user record (backfill helper)
// This is automatically called when needed, but can also be invoked manually
export const ensureVolunteerUser = mutation({
  args: {
    volunteerId: v.id("volunteers"),
  },
  handler: async (ctx, args) => {
    const volunteer = await ctx.db.get(args.volunteerId);
    if (!volunteer) {
      throw new Error("Volunteer not found");
    }

    // If already has userId, return it
    if (volunteer.userId) {
      return volunteer.userId;
    }

    // Get session for location
    const session = await ctx.db.get(volunteer.sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Create user record for volunteer
    const userId = await ctx.db.insert("users", {
      firstName: "Volunteer",
      lastName: volunteer.qrCode.substring(0, 8),
      role: "volunteer",
      location: session.location,
      language: "en",
      createdAt: Date.now(),
    });

    // Link user record to volunteer
    await ctx.db.patch(volunteer._id, {
      userId,
    });

    return userId;
  },
});
