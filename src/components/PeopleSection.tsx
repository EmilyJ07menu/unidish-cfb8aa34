import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { UserPlus, UserCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Person = { id: string; username: string | null; avatar_url: string | null };

export type PeopleTab = "followers" | "following";

export function PersonAvatar({ name }: { name: string | null }) {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export function PeopleSection({
  userId,
  tab,
  onCounts,
}: {
  userId: string;
  tab: PeopleTab | null;
  onCounts?: (counts: { followers: number; following: number }) => void;
}) {
  const [followers, setFollowers] = useState<Person[]>([]);
  const [following, setFollowing] = useState<Person[]>([]);
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
      onCounts?.({ followers: a.length, following: b.length });
    } catch (error) {
      console.error("Error loading people:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, hydrate, onCounts]);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  useEffect(() => {
    if (!currentUserId) return;
    supabase
      .from("friendships")
      .select("following_id")
      .eq("follower_id", currentUserId)
      .then(({ data }) => setMyFollowing(new Set((data ?? []).map((r) => r.following_id))));
  }, [currentUserId, followers, following]);

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

  if (!tab) return null;

  const list = tab === "followers" ? followers : following;

  return (
    <section id="people" className="mt-10 scroll-mt-24">
      <h2 className="text-2xl font-bold">{tab === "followers" ? "Followers" : "Following"}</h2>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="h-16 animate-pulse rounded-2xl bg-muted" />
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Users className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              {tab === "followers"
                ? "No followers yet."
                : "Not following anyone yet — try Find people."}
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
    </section>
  );
}
