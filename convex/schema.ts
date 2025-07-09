import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  calls: defineTable({
    title: v.string(),
    status: v.union(
      v.literal("recording"),
      v.literal("processing"),
      v.literal("completed")
    ),
    audioStorageId: v.optional(v.id("_storage")),
    transcript: v.optional(v.string()),
    summary: v.optional(v.string()),
    duration: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.id("users"), // Associate calls with users
  })
    .index("by_created_at", ["createdAt"])
    .index("by_user", ["userId"])
    .index("by_user_created_at", ["userId", "createdAt"]),
});
