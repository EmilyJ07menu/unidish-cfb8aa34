import { Link } from "@tanstack/react-router";
import {
  Home,
  Sparkles,
  PlusSquare,
  Bookmark,
  Refrigerator,
  CalendarDays,
} from "lucide-react";

const items = [
  { to: "/", label: "Feed", icon: Home, exact: true },
  { to: "/discover", label: "Discover", icon: Sparkles, exact: false },
  { to: "/share", label: "Share", icon: PlusSquare, exact: false },
  { to: "/fridge", label: "Fridge", icon: Refrigerator, exact: false },
  { to: "/calendar", label: "Plan", icon: CalendarDays, exact: false },
  { to: "/saved", label: "Saved", icon: Bookmark, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, icon: Icon, exact }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{
                className:
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-primary",
              }}
            >
              <Icon className="size-6" strokeWidth={1.9} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
