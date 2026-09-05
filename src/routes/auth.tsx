import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogIn, Mail, Lock, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or sign up — UniDISH" },
      {
        name: "description",
        content: "Create a UniDISH account or log in to save recipes and plan your student meals.",
      },
      { property: "og:title", content: "Log in or sign up — UniDISH" },
      { property: "og:description", content: "Join the UniDISH student cooking community." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/onboarding", replace: true });
  }, [loading, session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: { username },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your account.");
          return;
        }
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/onboarding" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/onboarding" });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <LogIn className="size-8" />
      </div>
      <h1 className="mt-6 text-4xl">{mode === "login" ? "Welcome back" : "Join UniDISH"}</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        {mode === "login" ? "Log in to your account" : "Create an account to start cooking"}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md rounded-2xl border border-border bg-card p-6">
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-xl border border-border py-3 font-medium transition-colors hover:bg-muted"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
        </div>

        {mode === "signup" && (
          <>
            <label htmlFor="username" className="font-semibold">
              Username
            </label>
            <div className="relative mb-4 mt-2">
              <UserIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej2007"
                className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-ring"
              />

            </div>
          </>
        )}

        <label htmlFor="email" className="font-semibold">
          Email
        </label>
        <div className="relative mt-2">
          <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            name="email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <label htmlFor="password" className="mt-4 block font-semibold">
          Password
        </label>
        <div className="relative mt-2">
          <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-base outline-none focus:ring-2 focus:ring-ring"
          />

        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-muted-foreground">
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="font-medium text-primary"
        >
          {mode === "login" ? "Create one" : "Log in"}
        </button>
      </p>
    </div>
  );
}
