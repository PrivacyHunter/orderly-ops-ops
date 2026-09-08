import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s['next'] === "string" && s['next'].startsWith("/") && !s['next'].startsWith("//")
      ? s['next']
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Staff Sign In | Ambition Sports" },
      { name: "description", content: "Secure sign in for the Ambition Sports admin and developer control panel." },
      { property: "og:title", content: "Staff Sign In | Ambition Sports" },
      { property: "og:description", content: "Secure sign in for the Ambition Sports control panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode] = useState<"signin">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  async function sendReset() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent — check your inbox");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset email");
    } finally {
      setSendingReset(false);
    }
  }

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/panel", replace: true });
    });
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back");
      navigate({ to: "/panel", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      <div className="absolute right-4 top-4"><ThemeToggle /></div>

      <div className="glass noise w-full max-w-md rounded-3xl p-7 sm:p-10">
        <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">
          ← Ambition Sports
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
            <LockKeyhole size={18} />
          </span>
          <h1 className="min-w-0 truncate text-2xl font-extrabold uppercase sm:text-3xl">
            Staff Access
          </h1>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your credentials to access the internal management tools.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="magnetic flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
          <button
            type="button"
            onClick={() => void sendReset()}
            disabled={sendingReset}
            className="w-full text-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-primary disabled:opacity-60"
          >
            {sendingReset ? "Sending reset link…" : "Forgot password?"}
          </button>
        </form>
      </div>
    </main>
  );
}
