import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { PolicyCheckbox } from "@/components/PolicyCheckbox";
import { SiteFooter } from "@/components/SiteFooter";
import { useLegal } from "@/lib/legal-copy";
import { PENDING_CONSENT_KEY, PRIVACY_POLICY_VERSION } from "@/lib/privacy";

export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Sign in — Offer Ready" },
      {
        name: "description",
        content: "Sign in to Offer Ready to prepare for your next job interview.",
      },
      { property: "og:title", content: "Sign in — Offer Ready" },
      { property: "og:description", content: "Sign in to prepare for your next job interview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [useCode, setUseCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [agreed, setAgreed] = useState(false);
  const { L } = useLegal();

  /** Sign-up paths (email, code, Google, Apple) need the privacy checkbox; it is recorded after sign-in. */
  function requireConsent() {
    if (!agreed) {
      toast.error(L.consent.required);
      return false;
    }
    try {
      localStorage.setItem(PENDING_CONSENT_KEY, String(PRIVACY_POLICY_VERSION));
    } catch {
      /* The consent dialog after sign-in covers blocked storage. */
    }
    return true;
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    if (!codeSent && !requireConsent()) return;
    setBusy(true);
    try {
      if (!codeSent) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setCodeSent(true);
        toast.success("We emailed you a 6-digit code.");
      } else {
        const { error } = await supabase.auth.verifyOtp({ email, token: otp.trim(), type: "email" });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !requireConsent()) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    if (!requireConsent()) return;
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Try again or use your email.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }

  async function handleApple() {
    if (!requireConsent()) return;
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Apple sign-in failed. Try again or use your email.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  }


  return (
    <main className="flex min-h-screen flex-col surface-grid">
      <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight">
          Offer Ready
        </Link>
        <h1 className="mt-6 text-2xl font-semibold">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your preparations and interview scores are saved to your account.
        </p>

        {useCode ? (
          <form onSubmit={handleCode} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code-email">Email</Label>
              <Input
                id="code-email"
                type="email"
                required
                disabled={codeSent}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {codeSent && (
              <div className="space-y-2">
                <Label htmlFor="otp">6-digit code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={10}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {codeSent ? "Verify and sign in" : "Email me a code"}
            </Button>
            {codeSent && (
              <button type="button" className="text-xs text-muted-foreground hover:underline" onClick={() => { setCodeSent(false); setOtp(""); }}>
                Use a different email
              </button>
            )}
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Moreno"
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
        )}

        <div className="mt-4">
          <PolicyCheckbox id="privacy-consent" checked={agreed} onChange={setAgreed} />
        </div>

        <Button
          type="button"
          variant="ghost"
          className="mt-3 w-full"
          onClick={() => setUseCode(!useCode)}
        >
          {useCode ? "Use email and password instead" : "Sign in with a one-time email code"}
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full" onClick={handleApple} disabled={busy}>
          Continue with Apple
        </Button>


        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
      </div>
      <SiteFooter />
    </main>
  );
}
