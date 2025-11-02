import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function WhoAmIPage() {
  const token = await convexAuthNextjsToken();
  const identity = token
    ? await fetchQuery(api.users.currentIdentity, {} as any, { token })
    : null;
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="text-xl font-semibold mb-2">Who am I</h1>
      <pre className="text-sm whitespace-pre-wrap break-words rounded border p-3 bg-muted/40">
        {JSON.stringify(identity, null, 2)}
      </pre>
      <p className="text-sm text-muted-foreground mt-2">
        {token
          ? (
            <>Use the <code>email</code> for ADMIN_EMAILS or the <code>subject</code> for ADMIN_SUBJECTS in .env.local.</>
          )
          : (
            <>Not signed in on the server. Go to <code>/signin</code> and try again.</>
          )}
      </p>
    </main>
  );
}
