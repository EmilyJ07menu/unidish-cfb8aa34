import { Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/BottomNav";

export function AppHeader() {
  const { user } = useAuth();

  const initial = (user?.user_metadata?.["username"] ?? user?.email ?? "?")
    .toString()
    .charAt(0)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 pb-4 pt-14">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-primary">
            UniDISH
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/profile/$userId"
                  params={{ userId: user.id }}
                  title="View your profile"
                  className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {initial}
                </Link>
                <Link
                  to="/settings"
                  title="Settings"
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Settings className="size-4" />
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      <BottomNav />
    </>
  );
}
