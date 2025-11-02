"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function formatUSD(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

function OrderSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId");
  const order = useQuery(orderId ? api.orders.getOrderById : undefined as any, orderId ? { orderId: orderId as any } : undefined as any);
  const print = useQuery(order ? api.prints.getPrintById : undefined as any, order ? { printId: order.printId } : undefined as any);

  return (
    <main className="mx-auto max-w-xl p-4">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Order placed</h1>
        <p className="text-sm text-muted-foreground">
          Thanks! We received your order. You’ll get an email update shortly.
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">File</div>
          <div className="truncate" title={print?.fileName ?? ""}>{print?.fileName || "(not provided)"}</div>
          <div className="text-muted-foreground">Weight (each)</div>
          <div>{(print?.gramsEach ?? 0).toLocaleString()} g</div>
          <div className="text-muted-foreground">Quantity</div>
          <div>{print?.qty ?? 1}</div>
          <div className="text-muted-foreground">Total</div>
          <div className="font-semibold">{formatUSD(print?.total ?? 0)}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/upload")}>New upload</Button>
          <Button variant="outline" onClick={() => router.push("/")}>Home</Button>
        </div>
      </Card>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading…</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
