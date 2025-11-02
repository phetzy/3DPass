"use client";

import { useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatUSD(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
}

export default function AdminPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [q, setQ] = useState("");
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const rows = useQuery((api as any).orders.listOrders, { status } as any);
  const getDownloadUrl = useAction((api as any).files.getDownloadUrl);
  const markPaid = useMutation((api as any).orders.markOrderPaid);
  const markCanceled = useMutation((api as any).orders.markOrderCanceled);
  const filtered = useMemo(() => {
    if (!rows) return undefined;
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r: any) =>
      (r.print?.fileName || "").toLowerCase().includes(term) ||
      (r.order.customerEmail || "").toLowerCase().includes(term) ||
      (r.order.customerName || "").toLowerCase().includes(term)
    );
  }, [rows, q]);

  return (
    <main className="mx-auto max-w-6xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <div className="flex gap-2 text-sm">
          <Button variant={status === undefined ? "default" : "outline"} onClick={() => setStatus(undefined)}>All</Button>
          <Button variant={status === "draft" ? "default" : "outline"} onClick={() => setStatus("draft")}>Draft</Button>
          <Button variant={status === "paid" ? "default" : "outline"} onClick={() => setStatus("paid")}>Paid</Button>
          <Button variant={status === "canceled" ? "default" : "outline"} onClick={() => setStatus("canceled")}>Canceled</Button>
        </div>
      </div>

      <Card className="divide-y">
        <div className="flex items-center justify-between px-4 py-2">
          <Input placeholder="Search by file, email, name" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left w-[35%]">File</th>
                <th className="px-4 py-2 text-left w-[20%]">Material/Quality</th>
                <th className="px-4 py-2 text-left w-[10%]">Qty</th>
                <th className="px-4 py-2 text-left w-[15%]">Total</th>
                <th className="px-4 py-2 text-left w-[20%]">Actions</th>
              </tr>
            </thead>
            <tbody>
            {filtered?.map((r: any) => (
              <tr key={String(r.order._id)} className="border-t">
                <td className="px-4 py-2 align-middle">
                  <div className="truncate max-w-[280px]" title={r.print?.fileName}>{r.print?.fileName ?? "—"}</div>
                </td>
                <td className="px-4 py-2 align-middle">{r.print?.material?.toUpperCase()} • {r.print?.quality}</td>
                <td className="px-4 py-2 align-middle">{r.print?.qty ?? 0}</td>
                <td className="px-4 py-2 align-middle">{formatUSD(r.order.amountTotal ?? r.print?.total ?? 0)}</td>
                <td className="px-4 py-2 align-middle">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.order.status === "paid"
                        ? "bg-emerald-500/15 text-emerald-500"
                        : r.order.status === "canceled"
                        ? "bg-rose-500/15 text-rose-500"
                        : "bg-amber-500/15 text-amber-500"
                    }`}>
                      {r.order.status}
                    </span>
                    {r.print?.storageId ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloadingIds.has(String(r.order._id))}
                        onClick={async () => {
                          setDownloadingIds((prev) => {
                            const next = new Set(prev);
                            next.add(String(r.order._id));
                            return next;
                          });
                          try {
                            const url = await getDownloadUrl({ storageId: r.print.storageId } as any);
                            if (!url) {
                              console.error("No download URL returned for storageId", r.print.storageId);
                              return;
                            }
                            const resp = await fetch(url as string);
                            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                            const blob = await resp.blob();
                            const objectUrl = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = objectUrl;
                            a.download = r.print.fileName || "model";
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(objectUrl);
                          } catch (e) {
                            console.error("Download failed", e);
                          } finally {
                            setDownloadingIds((prev) => {
                              const next = new Set(prev);
                              next.delete(String(r.order._id));
                              return next;
                            });
                          }
                        }}
                      >
                        {downloadingIds.has(String(r.order._id)) ? "Downloading..." : "Download"}
                      </Button>
                    ) : null}
                    {r.order.status !== "paid" && (
                      <Button size="sm" variant="outline" onClick={() => markPaid({ orderId: r.order._id })}>Mark paid</Button>
                    )}
                    {r.order.status !== "canceled" && (
                      <Button size="sm" variant="outline" onClick={() => markCanceled({ orderId: r.order._id })}>Cancel</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        {!filtered && <div className="px-4 py-2 text-sm text-muted-foreground">Loading…</div>}
        {filtered?.length === 0 && <div className="px-4 py-2 text-sm text-muted-foreground">No orders</div>}
      </Card>
    </main>
  );
}
