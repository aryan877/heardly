import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

export const createCall = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("calls", {
      title: args.title,
      status: "recording",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId,
    });
  },
});

export const updateCall = mutation({
  args: {
    id: v.id("calls"),
    audioStorageId: v.optional(v.id("_storage")),
    transcript: v.optional(v.string()),
    summary: v.optional(v.string()),
    duration: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("recording"),
        v.literal("processing"),
        v.literal("completed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const existingCall = await ctx.db.get(args.id);
    if (!existingCall) {
      throw new Error("Call not found");
    }

    if (existingCall.userId !== userId) {
      throw new Error("Forbidden");
    }

    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.audioStorageId !== undefined) {
      updateData.audioStorageId = args.audioStorageId;
    }
    if (args.transcript !== undefined) {
      updateData.transcript = args.transcript;
    }
    if (args.summary !== undefined) {
      updateData.summary = args.summary;
    }
    if (args.duration !== undefined) {
      updateData.duration = args.duration;
    }
    if (args.status !== undefined) {
      updateData.status = args.status;
    }

    await ctx.db.patch(args.id, updateData);
  },
});

export const deleteCall = mutation({
  args: {
    id: v.id("calls"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const existingCall = await ctx.db.get(args.id);
    if (!existingCall) {
      throw new Error("Call not found");
    }

    if (existingCall.userId !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(args.id);
  },
});

export const getCall = query({
  args: {
    id: v.id("calls"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const call = await ctx.db.get(args.id);
    if (!call) {
      return null;
    }

    if (call.userId !== userId) {
      throw new Error("Forbidden");
    }

    return call;
  },
});

export const getCalls = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("calls")
      .withIndex("by_user_created_at", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getRecentCalls = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const limit = args.limit ?? 10;

    return await ctx.db
      .query("calls")
      .withIndex("by_user_created_at", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.getUrl(args.storageId);
  },
});
