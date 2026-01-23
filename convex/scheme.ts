import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.optional(v.string()),
    phone: v.optional(v.string()), // For SMS notifications
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(
      v.literal("service_provider"),
      v.literal("volunteer"), 
      v.literal("service_user")
    ),
    location: v.string(), // "Kams Laundromat" or "Star Laundry Love"
    language: v.string(), // "en", "es", "pt", "ht"
    createdAt: v.number(),
  })
  .index("by_phone", ["phone"])
  .index("by_role_location", ["role", "location"]),

  intakeForms: defineTable({
    serviceUserId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    livingCondition: v.union(
      v.literal("homeless"),
      v.literal("sheltered"),
      v.literal("loads") // From your design
    ),
    estimatedLaundryLoads: v.number(), // e.g. 2.3 loads
    estimatedLaundryWeightLbs: v.number(), // e.g. 9.15 lbs
    sessionId: v.optional(v.id("sessions")),
    submittedAt: v.number(),
  })
  .index("by_user", ["serviceUserId"]),

  sessions: defineTable({
    serviceProviderId: v.id("users"),
    location: v.string(),
    isActive: v.boolean(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    qrCode: v.optional(v.string()), // Volunteer QR for onboarding
  })
  .index("by_location_active", ["location", "isActive"]),

  queue: defineTable({
    serviceUserId: v.id("users"),
    intakeFormId: v.id("intakeForms"),
    sessionId: v.id("sessions"),
    position: v.number(),
    status: v.union(
      v.literal("waiting"),
      v.literal("washing"), 
      v.literal("ready_to_remove"),
      v.literal("served"),
      v.literal("removed")
    ),
    joinedAt: v.number(),
    timerStartedAt: v.optional(v.number()), // 23min wash timer start
    timerDuration: v.number(), // Default 23 minutes * 60 * 1000 ms
    volunteerAssignedId: v.optional(v.id("users")), // Who started their timer
  })
  .index("by_session_status", ["sessionId", "status"])
  .index("by_position", ["sessionId", "position"]),

  volunteers: defineTable({
    userId: v.id("users"),
    sessionId: v.id("sessions"),
    assignedAt: v.number(),
    qrCode: v.string(), // Unique QR for this volunteer/session
  })
  .index("by_session", ["sessionId"]),
});
