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
      const session = event.data.object as any;
      const orderId = session?.metadata?.orderId as any;
      if (orderId) {
        await ctx.runMutation((api as any).orders.markOrderPaid, { orderId });
        // Fetch full session for totals and addresses
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
        const sResp = await stripe.checkout.sessions.retrieve(session.id, { expand: ["customer", "payment_intent"] });
        const s: any = sResp as any;
        await ctx.runMutation((api as any).orders.applySessionDetails, {
          orderId,
          livemode: !!s.livemode,
          amountTotal: s?.amount_total ? Number((s.amount_total as number) / 100) : undefined,
          amountTax: s?.total_details?.amount_tax ? Number((s.total_details.amount_tax as number) / 100) : undefined,
          customerEmail: s?.customer_details?.email ?? undefined,
          customerName: s?.customer_details?.name ?? undefined,
          paymentIntentId: typeof s?.payment_intent === "string" ? s.payment_intent : s?.payment_intent?.id,
          billingAddress: s?.customer_details?.address
            ? {
                line1: s.customer_details.address?.line1 ?? undefined,
                line2: s.customer_details.address?.line2 ?? undefined,
                city: s.customer_details.address?.city ?? undefined,
                state: s.customer_details.address?.state ?? undefined,
                postal_code: s.customer_details.address?.postal_code ?? undefined,
                country: s.customer_details.address?.country ?? undefined,
              }
            : undefined,
          shippingAddress: s?.shipping_details?.address
            ? {
                line1: s.shipping_details.address?.line1 ?? undefined,
                line2: s.shipping_details.address?.line2 ?? undefined,
                city: s.shipping_details.address?.city ?? undefined,
                state: s.shipping_details.address?.state ?? undefined,
                postal_code: s.shipping_details.address?.postal_code ?? undefined,
                country: s.shipping_details.address?.country ?? undefined,
              }
            : undefined,
        });
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
