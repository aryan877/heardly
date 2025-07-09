import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query, QueryCtx } from "./_generated/server";

// Helper function to get current user
async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}

// Helper function to ensure user owns call
async function ensureCallOwnership(ctx: QueryCtx, callId: Id<"calls">) {
  const identity = await getCurrentUser(ctx);
  const call = await ctx.db.get(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  if (call.userId !== identity.subject) {
    throw new Error("Forbidden");
  }

  return call;
}

export const create = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, { title }) => {
    const identity = await getCurrentUser(ctx);

    return await ctx.db.insert("calls", {
      title,
      status: "draft",
      userId: identity.subject,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("calls"),
    transcript: v.optional(v.string()),
    summary: v.optional(v.string()),
    duration: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("recording"),
        v.literal("processing"),
        v.literal("completed")
      )
    ),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ensureCallOwnership(ctx, id);

    // Only include defined fields in the update
    const updateData = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length > 0) {
      await ctx.db.patch(id, updateData);
    }
  },
});

export const remove = mutation({
  args: {
    id: v.id("calls"),
  },
  handler: async (ctx, { id }) => {
    await ensureCallOwnership(ctx, id);
    await ctx.db.delete(id);
  },
});

export const get = query({
  args: {
    id: v.id("calls"),
  },
  handler: async (ctx, { id }) => {
    const call = await ensureCallOwnership(ctx, id);
    return call;
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await getCurrentUser(ctx);

    return await ctx.db
      .query("calls")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const recent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const identity = await getCurrentUser(ctx);

    return await ctx.db
      .query("calls")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit);
  },
});
