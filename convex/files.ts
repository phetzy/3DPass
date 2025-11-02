import { action, httpAction } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = action({
  args: {},
  handler: async (ctx) => {
    const url = await ctx.storage.generateUploadUrl();
    return url;
  },
});

export const getDownloadUrl = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const url = await ctx.storage.getUrl(storageId);
    return url;
  },
});

export const download = httpAction(async (ctx, request) => {
  "use node";
  try {
    const u = new URL(request.url);
    const sid = u.searchParams.get("sid");
    const name = u.searchParams.get("name") || "model";
    if (!sid) return new Response("Missing sid", { status: 400 });
    const mime = "application/octet-stream";
    const data = (await ctx.storage.get(sid as any)) as Blob | null;
    if (!data) return new Response("Not found", { status: 404 });
    const ab = await data.arrayBuffer();
    return new Response(ab, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${name}"`
      },
    });
  } catch (e: any) {
    return new Response(`Error: ${e?.message ?? "download failed"}`, { status: 500 });
  }
});
