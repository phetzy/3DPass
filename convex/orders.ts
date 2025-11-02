import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db.get(orderId);
  },
});

export const setStripeSessionId = mutation({
  args: { orderId: v.id("orders"), sessionId: v.string() },
  handler: async (ctx, { orderId, sessionId }) => {
    await ctx.db.patch(orderId, { stripeSessionId: sessionId });
  },
});

export const markOrderPaid = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    await ctx.db.patch(orderId, { status: "paid" });
  },
});

export const markOrderCanceled = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    await ctx.db.patch(orderId, { status: "canceled" });
  },
});
