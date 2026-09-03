import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Users, Utensils, UserPlus, UserCheck, Clock, Search } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { RecipeImage } from "@/components/RecipeImage";
import { PeopleSection, type PeopleTab } from "@/components/PeopleSection";

import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/lib/useUserStats";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile/$userId")({
  head: ({ params }) => ({
    meta: [
      { title: "User Profile — UniDISH" },
      {
        name: "description",
        content: "View user profile and their shared recipes.",
      },
      { property: "og:title", content: "User Profile — UniDISH" },
      {
        property: "og:description",
        content: "Check out their recipes and stats.",
      },
    ],
  }),
  component: ProfilePage,
});

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

function ProfilePage() {
  const { userId } = useParams({ from: "/profile/$userId" });
  const { user: currentUser } = useAuth();
  const { stats, loading, toggleFollow } = useUserStats(userId);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [peopleTab, setPeopleTab] = useState<PeopleTab>("followers");
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  const showPeople = useCallback((tab: PeopleTab) => {
    setPeopleTab(tab);
    requestAnimationFrame(() => {
      document.getElementById("people")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  // Load user profile
  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;
        setProfile(data as UserProfile);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [userId]);

  const isOwnProfile = currentUser?.id === userId;

  if (loadingProfile || loading) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 w-32 rounded-full bg-muted" />
            <div className="h-8 w-64 bg-muted" />
            <div className="h-4 w-48 bg-muted" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Profile Header */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="flex size-32 items-center justify-center rounded-full bg-primary text-primary-foreground text-4xl font-bold">
            {profile?.username?.[0]?.toUpperCase() ?? "?"}
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold">{profile?.username ?? "Unknown User"}</h1>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap items-end gap-6">
              <button onClick={() => showPeople("followers")} className="flex flex-col text-left">
                <span className="text-sm text-muted-foreground">Followers</span>
                <span className="flex items-center gap-2 text-2xl font-bold">
                  <Users className="size-5" />
                  {counts.followers}
                </span>
              </button>
              <button onClick={() => showPeople("following")} className="flex flex-col text-left">
                <span className="text-sm text-muted-foreground">Following</span>
                <span className="flex items-center gap-2 text-2xl font-bold">
                  <UserCheck className="size-5" />
                  {counts.following}
                </span>
              </button>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Recipes Shared</span>
                <span className="flex items-center gap-2 text-2xl font-bold">
                  <Utensils className="size-5" />
                  {stats?.sharedRecipeCount ?? 0}
                </span>
              </div>
              <button
                onClick={() => showPeople("find")}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                <Search className="size-4" /> Find people
              </button>
            </div>

            {/* Follow Button */}
            {!isOwnProfile && currentUser && (
              <div className="mt-6">
                <button
                  onClick={() => toggleFollow(!stats?.isFollowing)}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-colors ${
                    stats?.isFollowing
                      ? "border border-border text-foreground hover:bg-muted"
                      : "border-2 border-primary bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {stats?.isFollowing ? (
                    <>
                      <UserCheck className="size-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" />
                      Follow
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shared Recipes Section */}
        {stats && stats.sharedRecipeCount > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold">Shared Recipes</h2>
            <p className="mt-2 text-muted-foreground">
              {stats.sharedRecipeCount} recipe{stats.sharedRecipeCount !== 1 ? "s" : ""} shared
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stats.sharedRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  to="/recipe/$id"
                  params={{ id: recipe.recipe_id }}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                >
                  {recipe.image ? (
                    <RecipeImage
                      src={recipe.image}
                      alt={recipe.title}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 w-full items-center justify-center bg-muted">
                      <Utensils className="size-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{recipe.title}</h3>
                    {recipe.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {recipe.price && <span>£ {recipe.price.toFixed(2)}/serve</span>}
                      {recipe.minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" /> {recipe.minutes}m
                        </span>
                      )}
                      {recipe.serves && <span>{recipe.serves} servings</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats && stats.sharedRecipeCount === 0 && (
          <div className="mt-12 rounded-2xl border border-border bg-card p-12 text-center">
            <Utensils className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">
              {isOwnProfile ? "No recipes shared yet" : `${profile?.username ?? "This user"} hasn't shared any recipes yet`}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {isOwnProfile
                ? "Share your first recipe to inspire the community!"
                : "Check back soon for their delicious creations."}
            </p>
            {isOwnProfile && (
              <Link
                to="/share"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
              >
                Share a Recipe
              </Link>
            )}
          </div>
        )}

        {/* Followers / Following / Find people */}
        <PeopleSection userId={userId} tab={peopleTab} onTabChange={setPeopleTab} onCounts={setCounts} />
      </main>

    </div>
  );
}
