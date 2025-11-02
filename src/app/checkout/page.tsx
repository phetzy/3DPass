"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MATERIALS, type MaterialId, type PrintQuality } from "@/lib/materials";

function formatUSD(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const file = params.get("file") ?? "";
    const material = (params.get("material") as MaterialId | null) ?? "pla";
    const quality = (params.get("quality") as PrintQuality | null) ?? "standard";
    const grams_each = Number(params.get("grams_each") ?? 0);
    const price_each = Number(params.get("price_each") ?? 0);
    const qty = Number(params.get("qty") ?? 1);
    const total = Number(params.get("total") ?? price_each * qty);
    const base_fee = Number(params.get("base_fee") ?? 0);
    const scale = Number(params.get("scale") ?? 1);
    const color = params.get("color") ?? "";
    const colorHex = params.get("colorHex") ?? "";
    return { file, material, quality, grams_each, price_each, qty, total, scale, color, colorHex, base_fee };
  }, [params]);

  async function placeOrder(formData: FormData) {
    try {
      setPlacing(true);
      setError(null);
      // TODO: Send to backend (Convex mutation) and kick off Stripe Checkout in the next iteration.
      // For MVP, just navigate to a mocked success page with query params.
      const qs = new URLSearchParams({
        ...Object.fromEntries(formData.entries()) as Record<string, string>,
        file: summary.file,
        material: summary.material,
        quality: summary.quality,
        grams_each: String(summary.grams_each),
        price_each: String(summary.price_each),
        qty: String(summary.qty),
        total: String(summary.total),
        scale: String(summary.scale),
      });
      router.push(`/order-success?${qs.toString()}`);
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
          <h1 className="text-xl font-semibold">Order summary</h1>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">File</div>
            <div className="truncate" title={summary.file}>{summary.file || "(not provided)"}</div>
            <div className="text-muted-foreground">Material</div>
            <div>{MATERIALS[summary.material].label}</div>
            <div className="text-muted-foreground">Quality</div>
            <div className="capitalize">{summary.quality}</div>
            <div className="text-muted-foreground">Color</div>
            <div className="inline-flex items-center gap-2">
              {summary.colorHex ? (
                <span className="inline-block size-4 rounded-full border" style={{ backgroundColor: summary.colorHex }} />
              ) : null}
              <span className="capitalize">{summary.color || "—"}</span>
            </div>
            <div className="text-muted-foreground">Qty</div>
            <div>{summary.qty}</div>
            <div className="text-muted-foreground">Scale</div>
            <div>{Math.round(summary.scale * 100)}%</div>
            <div className="text-muted-foreground">Weight (each)</div>
            <div>{summary.grams_each.toLocaleString()} g</div>
            <div className="text-muted-foreground">Price (each)</div>
            <div>{formatUSD(summary.price_each)}</div>
            <div className="text-muted-foreground">Base fee</div>
            <div>{formatUSD(summary.base_fee)}</div>
            <div className="text-muted-foreground">Total</div>
            <div className="font-semibold">{formatUSD(summary.total)}</div>
          </div>
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

            <Button type="submit" className="w-full" disabled={placing}>
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
