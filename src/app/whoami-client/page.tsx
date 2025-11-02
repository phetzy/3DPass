"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";

export default function WhoAmIClientPage() {
  const identity = useQuery(api.users.currentIdentity as any, {} as any);
  const { signIn, signOut } = useAuthActions();

  const pretty = useMemo(() => JSON.stringify(identity ?? null, null, 2), [identity]);

  return (
    <main className="mx-auto max-w-2xl p-4 space-y-3">
      <h1 className="text-xl font-semibold">Who am I (client)</h1>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => void signIn("github")}>Sign in with GitHub</Button>
        <Button size="sm" variant="outline" onClick={() => void signOut()}>Sign out</Button>
      </div>
      <pre className="text-sm whitespace-pre-wrap break-words rounded border p-3 bg-muted/40">{pretty}</pre>
      <p className="text-sm text-muted-foreground">
        Use <code>email</code> for ADMIN_EMAILS or <code>subject</code> for ADMIN_SUBJECTS. This page reads identity from the client.
      </p>
    </main>
  );
}
