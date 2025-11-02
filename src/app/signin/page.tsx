"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await signIn("password", formData);
      router.push("/");
    } catch (e: any) {
      setError(e?.message ?? "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold">
          {step === "signIn" ? "Sign in" : "Create account"}
        </h1>
        <form
          action={async (fd) => {
            fd.set("flow", step);
            await onSubmit(fd);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <input type="hidden" name="flow" value={step} />
          {error ? (
            <p className="text-sm text-destructive" aria-live="polite">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : step === "signIn" ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <Button
          variant="ghost"
          className="w-full"
          type="button"
          onClick={() => setStep(step === "signIn" ? "signUp" : "signIn")}
        >
          {step === "signIn" ? "Create an account" : "Have an account? Sign in"}
        </Button>
      </Card>
    </main>
  );
}
