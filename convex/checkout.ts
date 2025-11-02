import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const createCheckoutSession = action({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    "use node";
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      // apiVersion optional; using package default keeps types simple
    });

    const a = api as any;
    const order = await ctx.runQuery(a.orders.getOrderById, { orderId });
    if (!order) throw new Error("Order not found");
    const print = await ctx.runQuery(a.prints.getPrintById, { printId: order.printId });
    if (!print) throw new Error("Print not found");

    const siteUrl = process.env.SITE_URL || process.env.CONVEX_SITE_URL || "http://localhost:3000";

    const line_items: any[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${print.fileName}`,
            description: `${print.material.toUpperCase()} • ${print.quality} • ${print.color}`,
          },
          unit_amount: Math.round(print.priceEach * 100),
        },
        quantity: Math.max(1, print.qty),
      },
    ];

    if (print.baseFee > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Base fee" },
          unit_amount: Math.round(print.baseFee * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/order-success?orderId=${orderId}`,
      cancel_url: `${siteUrl}/checkout?orderId=${orderId}`,
      metadata: { orderId: String(orderId) },
    });

    await ctx.runMutation(a.orders.setStripeSessionId, { orderId, sessionId: session.id });

    return { url: session.url };
  },
});
