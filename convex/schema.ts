import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  calls: defineTable({
    title: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("recording"),
      v.literal("processing"),
      v.literal("completed")
    ),
    transcript: v.optional(v.string()),
    summary: v.optional(v.string()),
    duration: v.optional(v.number()),
    userId: v.string(), // Clerk user ID from JWT subject
  }).index("by_user", ["userId"]),
});
