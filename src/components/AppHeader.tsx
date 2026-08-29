import { Link } from "@tanstack/react-router";
import { Home, Sparkles, Bookmark, Refrigerator, CalendarDays, Plus } from "lucide-react";

const links = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/discover", label: "Discover", icon: Sparkles },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/fridge", label: "Fridge", icon: Refrigerator },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

export function AppHeader() {
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
          <Link
            to="/setup"
            className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
          >
            E
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90">
            <Plus className="size-4" />
            Share
          </button>
        </div>
      </div>
    </header>
  );
}
