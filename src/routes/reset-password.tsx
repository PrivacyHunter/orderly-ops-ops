import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password | Ambition Sports" },
      { name: "description", content: "Set a new password for your Ambition Sports staff account." },
      { property: "og:title", content: "Reset Password | Ambition Sports" },
      { property: "og:description", content: "Set a new password for your Ambition Sports staff account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      navigate({ to: "/panel", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="glass w-full max-w-md rounded-3xl p-7 sm:p-10">
        <Link to="/auth" className="text-[10px] font-bold uppercase tracking-[0.35em] text-muted-foreground">← Back to sign in</Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary"><KeyRound size={18} /></span>
          <h1 className="text-2xl font-extrabold uppercase sm:text-3xl">New Password</h1>
        </div>

        {!ready ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Open this page from the password reset link in your email to continue.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">New password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Confirm password</label>
              <input
                id="confirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />} Update password
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
