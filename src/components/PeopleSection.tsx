import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, UserPlus, UserCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Person = { id: string; username: string | null; avatar_url: string | null };

type Tab = "followers" | "following" | "find";

function Avatar({ name }: { name: string | null }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export function PeopleSection({ userId }: { userId: string }) {
  const [tab, setTab] = useState<Tab>("followers");
  const [followers, setFollowers] = useState<Person[]>([]);
  const [following, setFollowing] = useState<Person[]>([]);
  const [results, setResults] = useState<Person[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const hydrate = useCallback(async (ids: string[]): Promise<Person[]> => {
    if (ids.length === 0) return [];
    const { data, error } = await supabase.rpc("get_public_profiles", { _ids: ids });
    if (error) throw error;
    return (data ?? []) as Person[];
  }, []);

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: fr }, { data: fg }] = await Promise.all([
        supabase.from("friendships").select("follower_id").eq("following_id", userId),
        supabase.from("friendships").select("following_id").eq("follower_id", userId),
      ]);
      const [a, b] = await Promise.all([
        hydrate((fr ?? []).map((r) => r.follower_id)),
        hydrate((fg ?? []).map((r) => r.following_id)),
      ]);
      setFollowers(a);
      setFollowing(b);
    } catch (error) {
      console.error("Error loading people:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, hydrate]);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  // Who the signed-in user already follows (to render the right button state)
  useEffect(() => {
    if (!currentUserId) return;
    supabase
      .from("friendships")
      .select("following_id")
      .eq("follower_id", currentUserId)
      .then(({ data }) => setMyFollowing(new Set((data ?? []).map((r) => r.following_id))));
  }, [currentUserId, followers, following]);

  // Search people
  useEffect(() => {
    if (tab !== "find") return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc("search_profiles", {
        _query: query.trim(),
        _limit: 20,
      });
      if (error) {
        console.error("Error searching people:", error);
        return;
      }
      if (!cancelled) setResults((data ?? []) as Person[]);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [tab, query]);

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
    void loadLists();
  };

  const list = tab === "followers" ? followers : tab === "following" ? following : results;

  const tabs: { key: Tab; label: string }[] = [
    { key: "followers", label: `Followers ${followers.length}` },
    { key: "following", label: `Following ${following.length}` },
    { key: "find", label: "Find people" },
  ];

  return (
    <section className="mt-12">
      <h2 className="text-3xl font-bold">People</h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? "rounded-full border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                : "rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "find" && (
        <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      )}

      <div className="mt-4 space-y-3">
        {loading && tab !== "find" ? (
          <div className="h-16 animate-pulse rounded-2xl bg-muted" />
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Users className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              {tab === "followers"
                ? "No followers yet."
                : tab === "following"
                  ? "Not following anyone yet — try Find people."
                  : query
                    ? "No one found with that username."
                    : "Start typing to find other cooks."}
            </p>
          </div>
        ) : (
          list.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <Link
                to="/profile/$userId"
                params={{ userId: person.id }}
                className="flex flex-1 items-center gap-3"
              >
                <Avatar name={person.username} />
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
    </section>
  );
}
