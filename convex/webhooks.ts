import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

export const stripeWebhook = httpAction(async (ctx, request) => {
  "use node";
  const Stripe = (await import("stripe")).default;

  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return new Response("Missing webhook configuration", { status: 400 });
  }

  const raw = await request.text();
  let event: any;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    event = await stripe.webhooks.constructEventAsync(raw, sig, secret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message ?? "invalid signature"}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as { metadata?: { orderId?: string } };
      const orderId = session.metadata?.orderId as any;
      if (orderId) {
        await ctx.runMutation((api as any).orders.markOrderPaid, { orderId });
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as { metadata?: { orderId?: string } };
      const orderId = session.metadata?.orderId as any;
      if (orderId) {
        await ctx.runMutation((api as any).orders.markOrderCanceled, { orderId });
      }
      break;
    }
    default:
      // ignore other events for MVP
      break;
  }

  return new Response("ok", { status: 200 });
});
