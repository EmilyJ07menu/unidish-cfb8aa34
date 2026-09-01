import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Salad, User as UserIcon, LogOut, Trash2, Bookmark, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — UniDISH" },
      {
        name: "description",
        content:
          "Manage your UniDISH account, dietary preferences and saved data in one place.",
      },
      { property: "og:title", content: "Settings — UniDISH" },
      { property: "og:description", content: "Your UniDISH account and preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function Row({
  to,
  icon: Icon,
  title,
  hint,
}: {
  to: string;
  icon: typeof Salad;
  title: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted"
    >
      <Icon className="size-5 text-primary" />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted-foreground">{hint}</span>
      </span>
    </Link>
  );
}

function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  function clearLocalData() {
    if (typeof window === "undefined") return;
    ["unidish:saved", "unidish:recipes", "unidish:plan"].forEach((key) =>
      window.localStorage.removeItem(key),
    );
    toast.success("Saved dishes, your recipes and meal plan cleared on this device.");
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="text-3xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          {user ? user.email : "You're browsing as a guest."}
        </p>

        <section className="mt-6 space-y-3">
          <Row
            to="/onboarding"
            icon={Salad}
            title="Dietary requirements"
            hint="Diet, meat preferences, allergies and intolerances"
          />
          <Row to="/setup" icon={UserIcon} title="Profile" hint="Your username and avatar" />
          <Row to="/saved" icon={Bookmark} title="Saved dishes" hint="Recipes you've kept" />
          <Row to="/calendar" icon={CalendarDays} title="Meal plan" hint="Your planned week" />
        </section>

        <section className="mt-8 space-y-3">
          <button
            onClick={clearLocalData}
            className="flex w-full items-center gap-4 rounded-2xl border border-border px-5 py-4 text-left transition-colors hover:bg-muted"
          >
            <Trash2 className="size-5 text-muted-foreground" />
            <span>
              <span className="block font-semibold">Clear data on this device</span>
              <span className="block text-sm text-muted-foreground">
                Removes saved dishes, your shared recipes and your meal plan
              </span>
            </span>
          </button>

          {user ? (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-4 rounded-2xl border border-border px-5 py-4 text-left font-semibold text-destructive transition-colors hover:bg-muted"
            >
              <LogOut className="size-5" />
              Log out
            </button>
          ) : (
            <Link
              to="/auth"
              className="flex w-full items-center gap-4 rounded-2xl bg-primary px-5 py-4 font-semibold text-primary-foreground"
            >
              Sign in
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}
