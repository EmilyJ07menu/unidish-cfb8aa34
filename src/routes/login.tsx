import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — UniDISH" },
      { name: "description", content: "Log in to your UniDISH account to cook smart and spend less." },
      { property: "og:title", content: "Log in — UniDISH" },
      { property: "og:description", content: "Access your UniDISH recipes and meal plans." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <LogIn className="size-8" />
      </div>
      <h1 className="mt-6 text-4xl">Welcome back</h1>
      <p className="mt-2 text-lg text-muted-foreground">Log in to your account</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/setup" });
        }}
        className="mt-8 w-full max-w-md rounded-2xl border border-border bg-card p-6"
      >
        <button
          type="button"
          className="w-full rounded-xl border border-border py-3 font-medium transition-colors hover:bg-muted"
        >
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
        </div>

        <label htmlFor="email" className="font-semibold">
          Email
        </label>
        <div className="relative mt-2">
          <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label htmlFor="password" className="font-semibold">
            Password
          </label>
          <button type="button" className="text-sm font-medium text-primary">
            Forgot password?
          </button>
        </div>
        <div className="relative mt-2">
          <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/setup" className="font-medium text-primary">
          Create one
        </Link>
      </p>
    </div>
  );
}
