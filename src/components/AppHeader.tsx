import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Home, Sparkles, Bookmark, Refrigerator, CalendarDays, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";


const links = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/discover", label: "Discover", icon: Sparkles },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/fridge", label: "Fridge", icon: Refrigerator },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initial = (user?.user_metadata?.["username"] ?? user?.email ?? "?")
    .toString()
    .charAt(0)
    .toUpperCase();

  return (

    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight text-primary">
          UniDISH
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="nav-pill"
              activeProps={{ className: "nav-pill nav-pill-active" }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/onboarding"
                title="Dietary preferences"
                className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
              >
                {initial}
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/share"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Share
          </Link>
        </div>

      </div>
    </header>
  );
}
