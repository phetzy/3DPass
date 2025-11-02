"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MATERIALS, MATERIAL_COLORS, type MaterialId, type PrintQuality } from "@/lib/materials";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function formatUSD(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useAction((api as any).checkout.createCheckoutSession);
  const orderId = params.get("orderId") ?? "";
  const order = useQuery((api as any).orders.getOrderById, orderId ? ({ orderId } as any) : undefined);
  const print = useQuery((api as any).prints.getPrintById, order ? ({ printId: order.printId } as any) : undefined);
  const colorHex = useMemo(() => {
    if (!print) return "";
    const set = (MATERIAL_COLORS as any)[print.material as MaterialId];
    const c = set?.find((x: any) => x.id === print.color);
    return c?.hex ?? "";
  }, [print]);

  async function placeOrder(formData: FormData) {
    try {
      setPlacing(true);
      setError(null);
      if (!orderId) throw new Error("Missing orderId");
      const { url } = await createSession({
        orderId: orderId as any,
        fullName: String(formData.get("fullName") || ""),
        email: String(formData.get("email") || ""),
        address1: String(formData.get("address1") || ""),
        city: String(formData.get("city") || ""),
        state: String(formData.get("state") || ""),
        zip: String(formData.get("zip") || ""),
        notes: String(formData.get("notes") || ""),
      });
      if (!url) throw new Error("Failed to create checkout session");
      window.location.href = url as string;
    } catch (e: any) {
      setError(e?.message ?? "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-4 md:grid-cols-2">
      <section className="space-y-3">
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Order summary</h1>
            {order ? (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                order.status === "paid"
                  ? "bg-emerald-500/15 text-emerald-500"
                  : order.status === "canceled"
                  ? "bg-rose-500/15 text-rose-500"
                  : "bg-amber-500/15 text-amber-500"
              }`}>
                {order.status}
              </span>
            ) : null}
          </div>
          {print ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">File</div>
              <div className="truncate" title={print.fileName}>{print.fileName || "(not provided)"}</div>
              <div className="text-muted-foreground">Material</div>
              <div>{MATERIALS[print.material as MaterialId]?.label ?? print.material}</div>
              <div className="text-muted-foreground">Quality</div>
              <div className="capitalize">{print.quality}</div>
              <div className="text-muted-foreground">Color</div>
              <div className="inline-flex items-center gap-2">
                {colorHex ? (
                  <span className="inline-block size-4 rounded-full border" style={{ backgroundColor: colorHex }} />
                ) : null}
                <span className="capitalize">{print.color}</span>
              </div>
              <div className="text-muted-foreground">Qty</div>
              <div>{print.qty}</div>
              <div className="text-muted-foreground">Scale</div>
              <div>{Math.round((print.scale || 1) * 100)}%</div>
              <div className="text-muted-foreground">Weight (each)</div>
              <div>{Number(print.gramsEach ?? 0).toLocaleString()} g</div>
              <div className="text-muted-foreground">Price (each)</div>
              <div>{formatUSD(Number(print.priceEach ?? 0))}</div>
              <div className="text-muted-foreground">Base fee</div>
              <div>{formatUSD(Number(print.baseFee ?? 0))}</div>
              {typeof order?.amountTax === "number" ? (
                <>
                  <div className="text-muted-foreground">Tax</div>
                  <div>{formatUSD(order.amountTax)}</div>
                </>
              ) : null}
              <div className="text-muted-foreground">Total</div>
              <div className="font-semibold">
                {typeof order?.amountTotal === "number" ? formatUSD(order.amountTotal) : formatUSD(Number(print.total ?? 0))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading order…</p>
          )}
          {order?.billingAddress || order?.shippingAddress ? (
            <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
              {order?.billingAddress ? (
                <div>
                  <div className="mb-1 font-medium">Billing address</div>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {(order.billingAddress.line1 || "") + (order.billingAddress.line2 ? "\n" + order.billingAddress.line2 : "")}
                    {(order.billingAddress.city || order.billingAddress.state || order.billingAddress.postal_code)
                      ? `\n${order.billingAddress.city ?? ""}${order.billingAddress.city ? ", " : ""}${order.billingAddress.state ?? ""} ${order.billingAddress.postal_code ?? ""}`
                      : ""}
                    {order.billingAddress.country ? `\n${order.billingAddress.country}` : ""}
                  </div>
                </div>
              ) : null}
              {order?.shippingAddress ? (
                <div>
                  <div className="mb-1 font-medium">Shipping address</div>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {(order.shippingAddress.line1 || "") + (order.shippingAddress.line2 ? "\n" + order.shippingAddress.line2 : "")}
                    {(order.shippingAddress.city || order.shippingAddress.state || order.shippingAddress.postal_code)
                      ? `\n${order.shippingAddress.city ?? ""}${order.shippingAddress.city ? ", " : ""}${order.shippingAddress.state ?? ""} ${order.shippingAddress.postal_code ?? ""}`
                      : ""}
                    {order.shippingAddress.country ? `\n${order.shippingAddress.country}` : ""}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          <Button variant="outline" onClick={() => router.push("/upload")}>Change model</Button>
        </Card>
      </section>

      <section className="space-y-3">
        <Card className="p-4 space-y-4">
          <h2 className="text-lg font-semibold">Shipping & contact</h2>
          <form
            className="space-y-3"
            action={async (fd) => {
              await placeOrder(fd);
            }}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" name="fullName" required autoComplete="name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address1">Address</Label>
              <Input id="address1" name="address1" required autoComplete="address-line1" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required autoComplete="address-level2" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" required autoComplete="address-level1" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="zip">ZIP</Label>
                <Input id="zip" name="zip" required autoComplete="postal-code" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" name="notes" placeholder="Printer settings, orientation, color preferences, etc." />
            </div>

            {error ? (
              <p className="text-sm text-destructive" aria-live="polite">{error}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={placing || (order && order.status !== "draft") || !print}>
              {placing ? "Placing order..." : "Place order"}
            </Button>
          </form>
        </Card>
      </section>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading checkout…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
