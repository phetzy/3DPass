import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  prints: defineTable({
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
    status: v.string(), // draft | paid | canceled
    createdAt: v.number(),
  }),
  orders: defineTable({
    printId: v.id("prints"),
    stripeSessionId: v.optional(v.string()),
    status: v.string(), // draft | paid | canceled
    createdAt: v.number(),
  }),
});

export default schema;
