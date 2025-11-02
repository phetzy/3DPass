"use client";

import { useState } from "react";
import type { SVGProps } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Github, Mail, KeyRound } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" {...props}>
      <path fill="#FFC107" d="M43.6 20.5H42v0H24v7h11.2C33.5 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5-5C33.3 6 28.8 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l5.7 4.2C13.8 15.4 18.5 12 24 12c3 0 5.8 1.1 7.9 3l5-5C33.3 6 28.8 4 24 4 16.5 4 10 8.1 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.3l-6.2-5.2C29 34.6 26.6 36 24 36c-5.2 0-9.5-3.4-11.1-8.1l-6.5 5C9 39.9 16 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42v0H24v7h11.2c-1.1 3.3-4.2 5.5-7.2 5.5-5.2 0-9.5-3.4-11.1-8.1l-6.5 5C9 39.9 16 44 24 44c8.8 0 16.2-6 18.6-14 0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpStep, setOtpStep] = useState<"enterEmail" | { email: string }>(
    "enterEmail",
  );

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
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 p-4">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold">
            {step === "signIn" ? "Sign In" : "Join 3D Pass"}
        </h2>
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
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading
                ? "Please wait..."
                : step === "signIn"
                ? "Sign in"
                : "Sign up"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setStep(step === "signIn" ? "signUp" : "signIn")}
            >
              {step === "signIn" ? "Create account" : "Sign in"}
            </Button>
          </div>
        </form>
        <div className="mt-2 border-t pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">Or continue with</p>
          <TooltipProvider>
            <div className="grid grid-cols-4 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon-lg"
                    className="hover:opacity-90"
                    aria-label="Continue with GitHub"
                    onClick={() => void signIn("github")}
                  >
                    <Github className="size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Continue with GitHub</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon-lg"
                    className="hover:opacity-90"
                    aria-label="Continue with Google"
                    onClick={() => void signIn("google")}
                  >
                    <GoogleIcon className="size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Continue with Google</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon-lg"
                    className="hover:opacity-90"
                    aria-label="Send magic link"
                    onClick={() => {
                      const email = (document.getElementById("email") as HTMLInputElement)?.value
                      if (!email) {
                        setError("Enter your email first")
                        return
                      }
                      const fd = new FormData()
                      fd.set("email", email)
                      void signIn("resend", fd)
                    }}
                  >
                    <Mail className="size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send magic link</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon-lg"
                    className="hover:opacity-90"
                    aria-label="Send one-time code"
                    onClick={() => {
                      const email = (document.getElementById("email") as HTMLInputElement)?.value
                      if (!email) {
                        setError("Enter your email first")
                        return
                      }
                      const fd = new FormData()
                      fd.set("email", email)
                      void signIn("resend-otp", fd).then(() => setOtpStep({ email }))
                    }}
                  >
                    <KeyRound className="size-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send one-time code</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {otpStep !== "enterEmail" ? (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                const fd = new FormData(e.currentTarget)
                fd.set("email", (otpStep as { email: string }).email)
                void signIn("resend-otp", fd)
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="otp-code">Code</Label>
                <Input id="otp-code" name="code" type="text" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Continue
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOtpStep("enterEmail")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </Card>
    </main>
  );
}
