import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()), // Unverified, just for SMS notifications
    role: v.union(
      v.literal("service_provider"),
      v.literal("volunteer"), 
      v.literal("service_user")
    ),
    location: v.string(),
    language: v.string(), // "en", "es", "pt", "ht"
    createdAt: v.number(),
  })
  .index("by_phone", ["phone"])
  .index("by_role_location", ["role", "location"]),

  // ... rest of your schema stays the same
  intakeForms: defineTable({
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
    submittedAt: v.number(),
  })
  .index("by_user", ["serviceUserId"])
  .index("by_session", ["sessionId"]),

  sessions: defineTable({
    serviceProviderId: v.optional(v.id("users")), // Optional until Phase 2 auth is implemented
    location: v.string(),
    isActive: v.boolean(),
    accessCode: v.string(), // 6-digit code for volunteers to join
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    scheduledDate: v.number(), // Timestamp for when session is scheduled
    volunteerCount: v.number(), // Number of volunteer QR codes to generate
  })
  .index("by_location_active", ["location", "isActive"])
  .index("by_access_code", ["accessCode"]),

  queue: defineTable({
    serviceUserId: v.id("users"),
    intakeFormId: v.id("intakeForms"),
    sessionId: v.id("sessions"),
    position: v.number(),
    status: v.union(
      v.literal("waiting"),
      v.literal("washing"),
      v.literal("drying"),
      v.literal("ready_to_remove"),
      v.literal("served"),
      v.literal("removed")
    ),
    joinedAt: v.number(),
    timerStartedAt: v.optional(v.number()),
    timerDuration: v.number(),
    volunteerAssignedId: v.optional(v.id("users")),
    // Machine assignment fields
    machineNumber: v.optional(v.string()),
    machineType: v.optional(v.union(v.literal("washer"), v.literal("dryer"))),
  })
  .index("by_session_status", ["sessionId", "status"])
  .index("by_position", ["sessionId", "position"]),

  volunteers: defineTable({
    userId: v.optional(v.id("users")), // Set when volunteer scans QR and registers
    sessionId: v.id("sessions"),
    qrCode: v.string(), // UUID for tracking who onboarded each user
    assignedAt: v.number(),
  })
  .index("by_session", ["sessionId"])
  .index("by_qr_code", ["qrCode"]),
});
