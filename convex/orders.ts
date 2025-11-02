import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db.get(orderId);
  },
});

export const listOrders = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    const all = await ctx.db.query("orders").collect();
    const filtered = status ? all.filter((o) => o.status === status) : all;
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    const rows = await Promise.all(
      filtered.map(async (o) => ({ order: o, print: await ctx.db.get(o.printId) })),
    );
    return rows;
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

export const applySessionDetails = mutation({
  args: {
    orderId: v.id("orders"),
    amountTotal: v.optional(v.number()),
    amountTax: v.optional(v.number()),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    paymentIntentId: v.optional(v.string()),
    billingAddress: v.optional(
      v.object({
        line1: v.optional(v.string()),
        line2: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        postal_code: v.optional(v.string()),
        country: v.optional(v.string()),
      }),
    ),
    shippingAddress: v.optional(
      v.object({
        line1: v.optional(v.string()),
        line2: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        postal_code: v.optional(v.string()),
        country: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { orderId, ...rest } = args;
    await ctx.db.patch(orderId, rest);
  },
});
