"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatUSD(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export default function OrderSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();

  const file = params.get("file") ?? "";
  const grams = Number(params.get("grams") ?? 0);
  const price = Number(params.get("price") ?? 0);

  return (
    <main className="mx-auto max-w-xl p-4">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Order placed</h1>
        <p className="text-sm text-muted-foreground">
          Thanks! We received your order. You’ll get an email update shortly.
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">File</div>
          <div className="truncate" title={file}>{file || "(not provided)"}</div>
          <div className="text-muted-foreground">Estimated weight</div>
          <div>{grams.toLocaleString()} g</div>
          <div className="text-muted-foreground">Total</div>
          <div className="font-semibold">{formatUSD(price)}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/upload")}>New upload</Button>
          <Button variant="outline" onClick={() => router.push("/")}>Home</Button>
        </div>
      </Card>
    </main>
  );
}
