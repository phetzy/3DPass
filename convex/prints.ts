import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createPrintAndOrder = mutation({
  args: {
    fileName: v.string(),
    storageId: v.id("_storage"),
    material: v.string(),
    quality: v.string(),
    color: v.string(),
    scale: v.number(),
    qty: v.number(),
    gramsEach: v.number(),
    priceEach: v.number(),
    baseFee: v.number(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const printId = await ctx.db.insert("prints", {
      ...args,
      status: "draft",
      createdAt: now,
    });
    const orderId = await ctx.db.insert("orders", {
      printId,
      status: "draft",
      createdAt: now,
    });
    return { printId, orderId };
  },
});
