import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, UserPlus, UserCheck, Users } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { PersonAvatar } from "@/components/PeopleSection";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/people")({
  head: () => ({
    meta: [
      { title: "Find People — UniDISH" },
      {
        name: "description",
        content: "Search for other cooks on UniDISH and follow them to see the recipes they share.",
      },
      { property: "og:title", content: "Find People — UniDISH" },
      {
        property: "og:description",
        content: "Search cooks by username and follow them for new recipe ideas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PeoplePage,
});

type Person = { id: string; username: string | null; avatar_url: string | null };

function PeoplePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    supabase
      .from("friendships")
      .select("following_id")
      .eq("follower_id", currentUserId)
      .then(({ data }) => setMyFollowing(new Set((data ?? []).map((r) => r.following_id))));
  }, [currentUserId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc("search_profiles", {
        _query: query.trim(),
        _limit: 20,
      });
      if (error) console.error("Error searching people:", error);
      if (!cancelled) {
        setResults((data ?? []) as Person[]);
        setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const toggleFollow = async (id: string) => {
    if (!currentUserId || id === currentUserId) return;
    const isFollowing = myFollowing.has(id);
    const next = new Set(myFollowing);
    if (isFollowing) next.delete(id);
    else next.add(id);
    setMyFollowing(next);
    if (isFollowing) {
      await supabase
        .from("friendships")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", id);
    } else {
      await supabase.from("friendships").insert({ follower_id: currentUserId, following_id: id });
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-4xl font-bold">Find people</h1>
        <p className="mt-2 text-muted-foreground">
          Search cooks by username and follow them to see what they share.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="h-16 animate-pulse rounded-2xl bg-muted" />
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <Users className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">
                {query ? "No one found with that username." : "No cooks to show yet."}
              </p>
            </div>
          ) : (
            results.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              >
                <Link
                  to="/profile/$userId"
                  params={{ userId: person.id }}
                  className="flex flex-1 items-center gap-3"
                >
                  <PersonAvatar name={person.username} />
                  <span className="font-semibold">{person.username ?? "Unnamed cook"}</span>
                </Link>
                {currentUserId && person.id !== currentUserId && (
                  <button
                    onClick={() => void toggleFollow(person.id)}
                    className={
                      myFollowing.has(person.id)
                        ? "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
                        : "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    }
                  >
                    {myFollowing.has(person.id) ? (
                      <>
                        <UserCheck className="size-4" /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-4" /> Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
